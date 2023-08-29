import { Chord, Pitch, Rest as ZRest, Ziffers } from "zifferjs";
import { Editor } from "../main";
import { Event } from "./AbstractEvents";
import { SkipEvent } from "./SkipEvent";
import { SoundEvent } from "./SoundEvent";
import { NoteEvent } from "./MidiEvent";
import { RestEvent } from "./RestEvent";

export type InputOptions = { [key: string]: string | number };

export class Player extends Event {
    input: string;
    ziffers: Ziffers;
    initCallTime: number = 1;
    startCallTime: number = 1;
    lastCallTime: number = 1;
    waitTime = 0;
    startBeat: number = 0;
    played: boolean = false;
    current!: Pitch|Chord|ZRest;
    retro: boolean = false;
    index: number = -1;
    zid: string = "";
    options: InputOptions = {};
    skipIndex = 0;
    endTime = 0;

    constructor(input: string, options: InputOptions, public app: Editor) {
        super(app);
        this.input = input;
        this.options = options;
        this.ziffers = new Ziffers(input, options);
    }

    get ticks(): number {
        const dur = this.ziffers.duration;
        return dur * 4 * this.app.clock.ppqn;
    }

    nextEndTime(): number {
        return this.startCallTime + this.ticks;
    }

    updateLastCallTime(): void {
        if (this.notStarted() || this.played) {
            this.lastCallTime = this.app.clock.pulses_since_origin;
            this.played = false;
        }
    }

    notStarted(): boolean {
        return this.ziffers.notStarted();
    }

    next = (): Pitch|Chord|ZRest => {
        this.current =  this.ziffers.next() as Pitch|Chord|ZRest;
        this.played = true;
        return this.current;
    }

    pulseToSecond = (pulse: number): number => {
        return this.app.clock.convertPulseToSecond(pulse);
    }

    firstRun = (): boolean => {
        return this.notStarted();
    }

    atTheBeginning = (): boolean => {
        return this.skipIndex === 0 && this.ziffers.index<=0;
    }

    origin = (): number => {
        return this.app.clock.pulses_since_origin;
    }

    pulse = (): number => {
        return this.app.clock.time_position.pulse;
    }

    beat = (): number => {
        return this.app.clock.time_position.beat;
    }

    nextBeat = (): number => {
        return this.app.clock.next_beat_in_ticks;
    }

    // Check if it's time to play the event
    areWeThereYet = (): boolean => {

        // If clock has stopped
        if(this.app.clock.pulses_since_origin<this.lastCallTime) {
            this.lastCallTime = 1;
            this.startCallTime = 1;
            this.index = 0;
            this.waitTime = 0;
        }

        // Main logic
        const howAboutNow = (
            (   // If pattern is just starting
                this.notStarted() && 
                (this.app.clock.time_position.pulse === 1 ||
                this.app.clock.pulses_since_origin >= this.app.clock.next_beat_in_ticks) &&
                (this.app.clock.pulses_since_origin >= this.waitTime)
            )
            ||
            (   // If pattern is already playing
                this.current &&
                (this.pulseToSecond(this.app.clock.pulses_since_origin) >= 
                this.pulseToSecond(this.lastCallTime) +
                (this.current.duration*4) * this.pulseToSecond(this.app.api.ppqn())) &&
                (this.app.clock.pulses_since_origin >= this.waitTime)
            )
        );
        
        // Increment index of how many times call is skipped
        this.skipIndex = howAboutNow ? 0 : this.skipIndex+1;

        // Increment index of how many times sound/midi have been called
        this.index = howAboutNow ? this.index+1 : this.index;
        

        if(howAboutNow && this.notStarted()) {
            this.initCallTime = this.app.clock.pulses_since_origin;
        }

        if(this.atTheBeginning()) {
            this.startCallTime = this.app.clock.pulses_since_origin;
        }
        
        return howAboutNow;
    }

    sound(name: string) {
        if(this.areWeThereYet()) {
            const event = this.next() as Pitch|Chord|ZRest;
            if(event instanceof Pitch) {
                const obj = event.getExisting("freq","pitch","key","scale","octave","parsedScale");
                return new SoundEvent(obj, this.app).sound(name);
            } else if(event instanceof ZRest) {
                return RestEvent.createRestProxy(event.duration, this.app);
            } 
        } else {
            return SkipEvent.createSkipProxy();
        }
    }

    midi(value: number|undefined = undefined) {
         if(this.areWeThereYet()) {
            const event = this.next() as Pitch|Chord|ZRest;
            if(event instanceof Pitch) {
                const obj = event.getExisting("note","pitch","bend","key","scale","octave","parsedScale");
                const note = new NoteEvent(obj, this.app);
                return value ? note.note(value) : note;
            } else if(event instanceof ZRest) {
                return RestEvent.createRestProxy(event.duration, this.app);
            } 
        } else {
            return SkipEvent.createSkipProxy();
        }
    }

    scale(name: string) {
        if(this.atTheBeginning()) this.ziffers.scale(name);
        return this;
    }

    key(name: string) {
        if(this.atTheBeginning()) this.ziffers.key(name);
        return this;
    }

    octave(value: number) {
        if(this.atTheBeginning()) this.ziffers.octave(value);
        return this;
    }

    retrograde() {
        if(this.atTheBeginning()) this.ziffers.retrograde();
        return this;
    }

    wait(value: number|Function) {
        if(this.atTheBeginning()) {    
            if(typeof value === "function") {
                const refPat = this.app.api.patternCache.get(value.name) as Player;
                if(refPat) this.waitTime = refPat.nextEndTime();
                return this;
            }
            this.waitTime = this.origin() + Math.ceil(value*4*this.app.clock.ppqn); 
        }
        return this;
    }

    out = (): void => {
        // TODO?
    }


}
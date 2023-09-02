// @ts-ignore
import { TransportNode } from "./TransportNode";
import TransportProcessor from "./TransportProcessor?worker&url";
import { Editor } from "./main";

export interface TimePosition {
  /**
   *  A position in time.
   *
   * @param bar - The bar number
   * @param beat - The beat number
   * @param pulse - The pulse number
   */
  bar: number;
  beat: number;
  pulse: number;
}

export class Clock {
  /**
   * The Clock Class is responsible for keeping track of the current time.
   * It is also responsible for starting and stopping the Clock TransportNode.
   *
   * @param app - The main application instance
   * @param ctx - The current AudioContext used by app
   * @param transportNode - The TransportNode helper
   * @param bpm - The current beats per minute value
   * @param time_signature - The time signature
   * @param time_position - The current time position
   * @param ppqn - The pulses per quarter note
   * @param tick - The current tick since origin
   */

  ctx: AudioContext;
  transportNode: TransportNode | null;
  private _bpm: number;
  time_signature: number[];
  time_position: TimePosition;
  private _ppqn: number;
  tick: number;

  constructor(public app: Editor, ctx: AudioContext) {
    this.time_position = { bar: 0, beat: 0, pulse: 0 };
    this.time_signature = [4, 4];
    this.tick = 0;
    this._bpm = 120;
    this._ppqn = 48;
    this.transportNode = null;
    this.ctx = ctx;
    ctx.audioWorklet
      .addModule(TransportProcessor)
      .then((e) => {
        this.transportNode = new TransportNode(ctx, {}, this.app);
        this.transportNode.connect(ctx.destination);
        return e;
      })
      .catch((e) => {
        console.log("Error loading TransportProcessor.js:", e);
      });
  }

  get ticks_before_new_bar(): number {
    /**
     * This function returns the number of ticks separating the current moment
     * from the beginning of the next bar.
     *
     * @returns number of ticks until next bar
     */
    const ticskMissingFromBeat = this.ppqn - this.time_position.pulse;
    const beatsMissingFromBar = this.beats_per_bar - this.time_position.beat;
    return beatsMissingFromBar * this.ppqn + ticskMissingFromBeat;
  }

  get next_beat_in_ticks(): number {
    /**
     * This function returns the number of ticks separating the current moment
     * from the beginning of the next beat.
     *
     * @returns number of ticks until next beat
     */
    return this.app.clock.pulses_since_origin + this.time_position.pulse;
  }

  get beats_per_bar(): number {
    /**
     * Returns the number of beats per bar.
     */
    return this.time_signature[0];
  }

  get beats_since_origin(): number {
    /**
     * Returns the number of beats since the origin.
     *
     * @returns number of beats since origin
     */
    return Math.floor(this.tick / this.ppqn);
  }

  get pulses_since_origin(): number {
    /**
     * Returns the number of pulses since the origin.
     *
     * @returns number of pulses since origin
     */
    return this.tick;
  }

  get pulse_duration(): number {
    /**
     * Returns the duration of a pulse in seconds.
     */
    return 60 / this.bpm / this.ppqn;
  }

  get bpm(): number {
    return this._bpm;
  }

  set bpm(bpm: number) {
    if(this.bpm !== bpm) {
      this._bpm = bpm;
      this.transportNode?.setBPM(bpm);
    }
  }

  get ppqn(): number {
    return this._ppqn;
  }

  set ppqn(ppqn: number) {
    if(this._ppqn !== ppqn) {
      this._ppqn = ppqn;
      this.transportNode?.setPPQN(ppqn);
    }
  }

  public convertPulseToSecond(n: number): number {
    /**
     * Converts a pulse to a second.
     */
    return n * this.pulse_duration;
  }

  public start(): void {
    /**
     * Starts the TransportNode (starts the clock).
     */
    this.app.audioContext.resume();
    this.transportNode?.start();
  }

  public pause(): void {
    /**
     * Pauses the TransportNode (pauses the clock).
     */
    this.transportNode?.pause();
  }

  public stop(): void {
    /**
     * Stops the TransportNode (stops the clock).
     */
    this.app.clock.tick = 0;
    this.transportNode?.stop();
  }
}

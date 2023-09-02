import { tryEvaluate } from "./Evaluator";
const zeroPad = (num, places) => String(num).padStart(places, '0')

export class TransportNode extends AudioWorkletNode {

    constructor(context, options, application) {
        super(context, "transport", options);
        this.app = application
        this.port.addEventListener("message", this.handleMessage);
        this.port.start();
    }

    /** @type {(this: MessagePort, ev: MessageEvent<any>) => any} */
    handleMessage = (message) => {
        if (message.data && message.data.type === "bang") {
<<<<<<< Updated upstream
            this.logicalTime = message.data.logicalTime;
            
            const futureTimeStamp = this.convertTicksToTimeposition(this.app.clock.tick);
           // console.log("BANG", this.logicalTime, futureTimeStamp);
            
            this.app.clock.time_position = futureTimeStamp;
            tryEvaluate(this.app, this.app.global_buffer);
=======

            this.app.clock.tick++
            const futureTimeStamp = this.app.clock.convertTicksToTimeposition(this.app.clock.tick);
            this.app.clock.time_position = futureTimeStamp;
            
            if (this.app.exampleIsPlaying) {
                tryEvaluate(this.app, this.app.example_buffer);
            } else {
                tryEvaluate(this.app, this.app.global_buffer);
            }
>>>>>>> Stashed changes
              
        }
    };

    convertTicksToTimeposition(ticks) {
        const beatsPerBar = this.app.clock.time_signature[0];
        const ppqnPosition = (ticks % this.app.clock.ppqn)+1;
        const beatNumber = Math.floor(ticks / this.app.clock.ppqn);
        const barNumber = Math.floor(beatNumber / beatsPerBar)+1;
        const beatWithinBar = Math.floor(beatNumber % beatsPerBar)+1;
        this.app.clock.tick++
        return {bar: barNumber, beat: beatWithinBar, pulse: ppqnPosition};
    }

    start() {
        this.port.postMessage("start");
    }

    pause() {
        this.port.postMessage("pause");
    }

    setBPM(bpm) {
        this.port.postMessage({ type: "bpm", value: bpm });
    }

    setPPQN(ppqn) {
        this.port.postMessage({ type: "ppqn", value: ppqn });
    }

    stop() {
        this.port.postMessage("stop");
    }

}
// deps
import LLM from "./components/llm.js";
import STT from "./components/stt.js";
import TTS from "./components/tts.js";
import config from "./config.json" assert { type: "json" };

// class
export default class Controller {
    // constructor
    constructor() {
        this.llm = new LLM();
        if (config.stt) this.stt = new STT();
        if (config.tts) this.tts = new TTS();
    }
    // init function
    async init() {
        console.log("[CONTROLLER] Initializing LLM...");
        await this.llm.init();
        if (this.tts) {
            console.log("[CONTROLLER] Initializing TTS...");
            await this.tts.init();
        }
        if (this.stt) {
            console.log("[CONTROLLER] Initializing STT...");
            await this.stt.init();
        }
    }
    // audio pipeline
    async audio(audioPath) {
        // if stt is disabled
        if (!this.stt)
            return {
                input: "N/A",
                output: "STT is disabled. Please enable STT to use the audio pipeline.",
            };
        // log
        console.log(
            "[CONTROLLER] Audio pipeline called. Requesting transcription..."
        );
        // get the transcription
        const input = await this.stt.transcribe(audioPath);
        // log
        console.log(`[CONTROLLER] Transcription finished: ${input}`);
        // get output from the llm
        let output = await this.llm.generate(input);
        // log the output
        console.log(`[CONTROLLER] Output generated: ${output}`);
        // if tts is enabled, speak the output
        if (this.tts) await this.tts.speak(output);
        // log on output spoken
        console.log("[CONTROLLER] Output processing done!");
        // return
        return {
            input,
            output,
            tts: !!this.tts,
        };
    }
    // text pipeline
    async text(input) {
        // log
        console.log(`[CONTROLLER] Generation requested: ${input}`);
        // generate output with the llm
        let output = await this.llm.generate(input);
        // log the output
        console.log(`[CONTROLLER] Output generated: ${output}`);
        // if tts is enabled, speak the output
        if (this.tts) await this.tts.speak(output);
        // log on output spoken
        console.log("[CONTROLLER] Output processing done!");
        // return
        return {
            output,
            tts: !!this.tts,
        };
    }
    // vision pipeline
    async vision(input, imagePath) {
        // if vision is off
        if (!config.vision) {
            return {
                output: "Vision is disabled. Please enable vision to use the vision pipeline.",
                tts: false,
            };
        }
        // log
        console.log(
            `[CONTROLLER] Generation through vision endpoint requested. Text input: ${input}`
        );
        // get output from the llm
        let output = await this.llm.generate(input, imagePath);
        // log the output
        console.log(`[CONTROLLER] Output generated: ${output}`);
        // if tts is enabled, speak the output
        if (this.tts) await this.tts.speak(output);
        // log on output spoken
        console.log("[CONTROLLER] Output processing done!");
        // return
        return {
            output,
            tts: !!this.tts,
        };
    }
    // see
    async see(imagePath) {
        // if vision is off
        if (!config.vision)
            return "Vision is disabled. Please enable vision to use the see function.";
        // log
        console.log("[CONTROLLER] Vision requested.");
        // see the image
        let caption = await this.llm.vision.caption(imagePath);
        // log again
        console.log(`[CONTROLLER] Caption generated: ${caption}`);
        // return
        return caption;
    }
    // speak
    async speak(text) {
        // if tts is off
        if (!this.tts) return false;
        // log
        console.log(`[CONTROLLER] TTS requested: ${text}`);
        // generate
        await this.tts.speak(text);
        // log again
        console.log("[CONTROLLER] TTS generated.");
        // return
        return true;
    }
    // listen
    async listen(audioPath) {
        // if stt is off
        if (!this.stt)
            return "STT is disabled. Please enable STT to use the listen function.";
        // log
        console.log("[CONTROLLER] Transcription requested.");
        // transcribe the audio
        let transcription = await this.stt.transcribe(audioPath);
        // log again
        console.log(`[CONTROLLER] Transcription generated: ${transcription}`);
        // return
        return transcription;
    }
    // generate
    async generate(input) {
        // log
        console.log(`[CONTROLLER] Generation requested: ${input}`);
        // get output from the llm
        let output = await this.llm.generate(input);
        // log it
        console.log(`[CONTROLLER] Generation finished: ${output}`);
        // return
        return output;
    }
    // emitter
    get emitter() {
        return this.llm.emitter;
    }
    // model
    get model() {
        return this.llm.model;
    }
}

// deps
import fs from "fs";
import path from "path";
import { cwd } from "process";
import wavefile from "wavefile";
import Ffmpeg from "fluent-ffmpeg";
import { pipeline } from "@xenova/transformers";
import config from "../config.json" assert { type: "json" };

// ffmpeg run function
function runFfmpeg(webmPath) {
    // run ffmpeg on the webm
    return new Promise(resolve => Ffmpeg()
        .input(webmPath)
        .outputOptions("-ac", "1")
        .saveToFile(path.join(cwd(), "input.wav"))
        .on("end", () => resolve()));
}

// class
export default class STT {
    // init function
    async init() {
        // make a pipeline
        this.transcriber = await pipeline("automatic-speech-recognition", config.stt);
    }
    // transcribe function
    async transcribe(webmPath) {
        // run ffmpeg on the webm path
        await runFfmpeg(webmPath);
        // read the wav
        let wav = new wavefile.WaveFile(fs.readFileSync(path.join(cwd(), "input.wav")));
        // set bit depth
        wav.toBitDepth("32f");
        // set sample rate to 16 khz
        wav.toSampleRate(16000);
        // get audio data
        let audioData = wav.getSamples();
        // idk what this does but the transformers.js docs said to do this
        if (Array.isArray(audioData)) audioData = audioData[0];
        // get the output
        let { text } = await this.transcriber(audioData);
        // return it
        return text.trim();
    }
}
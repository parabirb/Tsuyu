// deps
import fs from "fs";
import path from "path";
import { cwd } from "process";
import wavefile from "wavefile";
import { pipeline } from "@xenova/transformers";
import config from "../config.json" with { type: "json" };

// class
export default class TTS {
    // init function
    async init() {
        // make a pipeline
        this.synthesizer = await pipeline("text-to-speech", config.tts, { quantized: false });
    }
    // speak function
    async speak(text) {
        // get output
        let output = await this.synthesizer(text, { speaker_embeddings: config.ttsEmbeddings });
        // turn it into a wav
        const wav = new wavefile.WaveFile();
        wav.fromScratch(1, output.sampling_rate, "32f", output.audio);
        // write the wav
        fs.writeFileSync(path.join(cwd(), "ame_speech.wav"), wav.toBuffer());
    }
}
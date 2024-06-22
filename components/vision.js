// deps
import { pipeline } from "@xenova/transformers";
import config from "../config.json" with { type: "json" };

// class
export default class Vision {
    // init function
    async init() {
        // make a pipeline
        this.captioner = await pipeline("image-to-text", config.vision);
    }
    // caption function
    async caption(imgPath) {
        // run the generation
        let generation = await this.captioner(imgPath);
        // return the text
        return generation[0].generated_text;
    }
}
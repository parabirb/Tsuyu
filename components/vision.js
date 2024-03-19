// deps
import { pipeline } from "@xenova/transformers";
import config from "../config.json" assert { type: "json" };

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
        let { generated_text } = await this.captioner(imgPath);
        // return the text
        return generated_text;
    }
}
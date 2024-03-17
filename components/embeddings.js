// deps
import { pipeline } from "@xenova/transformers";
import config from "../config.json" assert { type: "json" };

// class
export default class Embeddings {
    // constructor
    constructor() {}
    // init function
    async init() {
        this.embedder = await pipeline("feature-extraction", config.embeddings);
    }
    // embed documents
    async embedDocuments(texts) {
        return (await this.embedder(texts, { pooling: "mean", normalize: true })).tolist();
    }
    // embed query
    async embedQuery(text) {
        return (await this.embedDocuments([text]))[0];
    }
}

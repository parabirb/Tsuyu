// deps
import { getLlama } from "llama-beta";
import config from "../config.json" assert { type: "json" };

// class
export default class Embeddings {
    // constructor
    constructor(llmPath) {
        this.llmPath = llmPath;
    }
    // init function
    async init() {
        this.llama = await getLlama();
        this.model = await this.llama.loadModel({ modelPath: this.llmPath, ...config.embeddingLlamaConfig });
        this.embeddingContext = await this.model.createEmbeddingContext({
            contextSize: Math.min(4096, this.model.trainContextSize)
        });
    }
    // embed query
    async embedQuery(text) {
        return (await this.embeddingContext.getEmbeddingFor(text)).vector;
    }
    // embed documents
    async embedDocuments(texts) {
        let embeddings = [];
        for (let text of texts) {
            embeddings.push((await this.embeddingContext.getEmbeddingFor(text)).vector);
        }
        return embeddings;
    }
}
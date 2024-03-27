// deps
import path from "path";
import { cwd } from "process";
import { LlamaContext, LlamaModel } from "node-llama-cpp";
import config from "../config.json" assert { type: "json" };

// class
export default class Wrapper {
    // constructor
    constructor() {
        this.model = new LlamaModel({
            modelPath: path.join(cwd(), "models", config.llm),
            ...config.llamaConfig,
        });
        this.context = new LlamaContext({
            model: this.model,
            ...config.contextConfig,
        });
        this.params = config.params;
    }
    // stream
    async *stream(prompt) {
        // clone params
        let params = structuredClone(this.params);
        // evaluate
        let stream = await this.context.evaluate(
            this.context.encode(prompt),
            params
        );
        // for each token
        for await (let token of stream) {
            yield {
                content: this.context.decode([token]),
            };
        }
    }
    // invoke
    async invoke(prompt) {
        // empty response string
        let response = "";
        // create stream
        let stream = await this.stream(prompt);
        // stream
        for await (let chunk of stream) {
            response += chunk.content;
        }
        // return response
        return response;
    }
}

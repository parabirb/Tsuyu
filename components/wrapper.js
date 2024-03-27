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
        if (config.modules) this.invocationContext = new LlamaContext({
            model: this.model,
            ...config.contextConfig,
        });
        else this.invocationContext = this.context;
        this.params = config.params;
    }
    // stream
    async *stream(prompt) {
        // evaluate
        let stream = await this.context.evaluate(
            this.context.encode(prompt),
            this.params
        );
        // for each token
        for await (let token of stream) {
            token = this.context.decode([token])
            if (token === config.stop) break;
            else yield {
                content: token,
            };
        }
    }
    // invoke
    async invoke(prompt) {
        // empty response string
        let response = "";
        // create stream
        let stream = await this.invocationContext.evaluate(
            this.context.encode(prompt),
            this.params
        );
        // stream
        for await (let token of stream) {
            token = this.invocationContext.decode([token])
            if (token !== config.stop) response += this.invocationContext.decode([token]);
            else break;
        }
        // return response
        return response;
    }
}

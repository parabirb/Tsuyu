// deps
import path from "path";
import { cwd } from "process";
import Memory from "./memory.js";
import Vision from "./vision.js";
import EventEmitter from "events";
import Modules from "./modules.js";
import Formatter from "./formatter.js";
import config from "../config.json" assert { type: "json" };
import { LlamaCpp } from "@langchain/community/llms/llama_cpp";

// export class
export default class LLM {
    // constructor
    constructor() {
        this.emitter = new EventEmitter();
    }
    // init function
    async init() {
        // set the llm path
        this.llmPath = path.join(cwd(), "models", config.llm);
        // create the model
        this.model = new LlamaCpp({
            modelPath: this.llmPath,
            ...config.llamaConfig,
        });
        // if modules are enabled, init our modules
        if (config.modules) this.modules = new Modules(this.model);
        // if vision is enabled, init vision
        if (config.vision) {
            this.vision = new Vision();
            this.vision.init();
        }
        // init the memory component
        this.memoryComponent = new Memory(this.model);
        await this.memoryComponent.init();
        // make a formatter
        this.formatter = new Formatter();
        await this.formatter.init();
    }
    // generate function
    async generate(input, imgPath = null) {
        // get the date
        let date = new Date();
        // get any relevant memories
        let memories = await this.memoryComponent.retrieveMemory(input);
        // empty response string
        let response = "";
        // get stream
        let stream = await this.model.stream(this.formatter.format({
            input,
            dateTimeString: `${date.toLocaleDateString(
                "en-US"
            )} ${date.toLocaleTimeString("en-US")}`,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            relevantDocs: memories.relevantDocs,
            conversationSummary: memories.conversationSummary || "N/A",
            moduleInfo: config.modules
                ? await this.modules.callModule(input, memories.relevantDocs)
                : undefined,
            caption: imgPath && config.vision ? await this.vision.caption(imgPath) : undefined
        }));
        // chunks
        for await (let chunk of stream) {
            // emit an event
            this.emitter.emit("chunk", chunk.content);
            // add to the response
            response += chunk.content;
        }
        // trim response
        response = response.trim();
        // if there's a memory store, save history
        await this.memoryComponent.saveMessage(input, response);
        // return the response
        return response;
    }
}

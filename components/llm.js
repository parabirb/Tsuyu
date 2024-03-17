// deps
import path from "path";
import { cwd } from "process";
import Memory from "./memory.js";
import EventEmitter from "events";
import Modules from "./modules.js";
import config from "../config.json" assert { type: "json" };
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";

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
        this.model = new ChatLlamaCpp({
            modelPath: this.llmPath,
            ...config.llamaConfig,
        });
        // if modules are enabled, init our modules
        if (config.modules) this.modules = new Modules(this.llmPath);
        // init the memory component
        this.memoryComponent = new Memory(this.model);
        await this.memoryComponent.init();
        // make a prompt
        this.prompt = ChatPromptTemplate.fromTemplate(`${config.prompt}

Current date and time:
{dateTimeString}
Time zone:
{timeZone}

${
    config.memory
        ? `Relevant previous pieces of information/conversation:
{relevantDocs}
(Do not use these if they are not relevant)
`
        : ""
}
${
    config.modules
        ? `Relevant information fetched by your modules:
{moduleInfo}
(Do not use this if it is not relevant)
`
        : ""
}
Previous conversation:
{conversationSummary}

Current conversation:
Human: {input}
AI: `);
        // make a chain
        this.llmChain = this.prompt.pipe(this.model);
    }
    // generate function
    async generate(input) {
        // get the date
        let date = new Date();
        // get any relevant memories
        let memories = await this.memoryComponent.retrieveMemory(input);
        // empty response string
        let response = "";
        // get stream
        let stream = await this.llmChain.stream({
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
        });
        // chunks
        for await (let chunk of stream) {
            // emit ana event
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

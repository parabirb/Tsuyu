// deps
import path from "path";
import { cwd } from "process";
import Memory from "./memory.js";
import EventEmitter from "events";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import config from "../config.json" assert { type: "json" };
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";

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
        // if saveable memory is enabled
        if (config.memory) {
            // init the memory component
            this.memoryComponent = new Memory();
            await this.memoryComponent.init();
            // set our memory to feed to the llm chain
            this.memory = this.memoryComponent.memory;
        }
        // otherwise
        else {
            // make a buffer memory
            this.memory = new BufferMemory({
                returnMessages: true,
                memoryKey: "history",
                inputKey: "input"
            });
        }
        // create the model
        this.model = new ChatLlamaCpp({
            modelPath: this.llmPath,
            ...config.llamaConfig,
            callbacks: [BaseCallbackHandler.fromMethods({
                handleLLMNewToken: (token) => {
                    console.log(token);
                    this.emitter.emit("chunk", token);
                }
            })]
        });
        // make a prompt
        if (!config.memory)
            this.prompt = ChatPromptTemplate.fromMessages([
                ["system", `${config.prompt}

Current date and time:
{dateTimeString}
Time zone:
UTC{timeZone}`],
                new MessagesPlaceholder("history"),
                ["human", "{input}"],
            ]);
        else
            this.prompt = ChatPromptTemplate.fromTemplate(`${config.prompt}

Current date and time:
{dateTimeString}
Time zone:
UTC{timeZone}

Relevant pieces of information:
{history}
(Do not use these if they are not relevant)

Current conversation:
Human: {input}
AI: `);
        // make a chain
        this.llmChain = new ConversationChain({
            memory: this.memory,
            prompt: this.prompt,
            llm: this.model
        });
    }
    // generate function
    async generate(input) {
        // get the date
        let date = new Date();
        // get response, but with a callback that emits an event on data recv
        let { response } = await this.llmChain.invoke({
            input,
            dateTimeString: `${date.toLocaleDateString("en-US")} ${date.toLocaleTimeString("en-US")}`,
            timeZone: `UTC${date.getTimezoneOffset() > 0 ? "+" : ""}${date.getTimezoneOffset()}`
        });
        // if there's a memory store, save history
        if (config.memory) await this.memoryComponent.save();
        // return the reseponse
        return response;
    }
}

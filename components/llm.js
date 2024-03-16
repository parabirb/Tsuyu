// deps
import { cwd } from "process";
import Memory from "./memory.js";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import config from "../config.json" assert { type: "json" };
import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

// export class
export default class LLM {
    // init function
    async init() {
        // set the llm path
        this.llmPath = path.join(cwd(), "models", config.llm);
        // if saveable memory is enabled
        if (config.memory) {
            // init the memory component
            this.memoryComponent = new Memory(this.llmPath);
            await this.memoryComponent.init();
            // set our memory to feed to the llm chain
            this.memory = this.memoryComponent.memory;
        }
        // otherwise
        else {
            // make a buffer memory
            this.memory = new BufferMemory({ returnMessages: true, memoryKey: "history" });
        }
        // create the model
        this.model = new ChatLlamaCpp({ modelPath: this.llmPath, topK: config.topK, topP: config.topP, temperature: config.temperature, maxTokens: config.maxTokens });
        // make a prompt
        this.prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                config.prompt
            ],
            new MessagesPlaceholder("history"),
            [
                "human",
                "{input}"
            ]
        ]);
        // make a chain
        this.llmChain = new ConversationChain({
            memory: this.memory,
            prompt: this.prompt,
            llm: this.model
        });
    }
    // generate function
    async generate(input) {
        // call the llm chain with the input
        let { response } = await this.llmChain.call({
            input
        });
        // if we have memory on, save the history
        if (config.memory) await this.memoryComponent.save();
        // return the response
        return response;
    }
}
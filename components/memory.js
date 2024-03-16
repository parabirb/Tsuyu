// deps
import fs from "fs";
import path from "path";
import { cwd } from "process";
import config from "../config.json" assert { type: "json" };
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { LlamaCppEmbeddings } from "@langchain/community/embeddings/llama_cpp";
import { CloseVectorNode } from "@langchain/community/vectorstores/closevector/node";

// to test if directory has been created
function testDir(dir) {
    try {
        fs.accessSync(dir);
        return true;
    }
    catch {
        return false;
    }
}

// class
export default class Memory {
    // initialization function
    async init() {
        // set the memory dir
        this.memoryDir = path.join(process.cwd(), "memory");
        // set the llm path
        let llmPath = path.join(process.cwd(), "models", config.llm);
        // if the memory dir has been initialized
        if (testDir(this.memoryDir)) this.vectorStore = await CloseVectorNode.load(this.memoryDir, new LlamaCppEmbeddings({ modelPath: llmPath }), { space: "cosine" });
        // otherwise
        else {
            fs.mkdirSync(this.memoryDir);
            this.vectorStore = new CloseVectorNode(new LlamaCppEmbeddings({ modelPath: llmPath }), { space: "cosine" });
        }
        // make a memory object
        this.memory = new VectorStoreRetrieverMemory({
            vectorStoreRetriever: this.vectorStore.asRetriever(config.memoryDocs),
            memoryKey: "history"
        });
    }
    // save message
    async saveMessage(input, output) {
        await this.memory.saveContext({ input, output });
    }
    // save function
    async save() {
        await this.vectorStore.save(this.memoryDir);
    }
}
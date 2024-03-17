// deps
import fs from "fs";
import Embeddings from "./embeddings.js";
import config from "../config.json" assert { type: "json" };
import { VectorStoreRetrieverMemory } from "langchain/memory";
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
    // constructoor
    constructor(llmPath) {
        this.llmPath = llmPath;
    }
    // initialization function
    async init() {
        // create an embedding thing
        this.embeddings = new Embeddings(this.llmPath);
        await this.embeddings.init();
        // set the memory dir
        this.memoryDir = path.join(process.cwd(), "memory");
        // if the memory dir has been initialized
        if (testDir(this.memoryDir)) this.vectorStore = await CloseVectorNode.load(this.memoryDir, this.embeddings, { space: "cosine" });
        // otherwise
        else {
            fs.mkdirSync(this.memoryDir);
            this.vectorStore = await CloseVectorNode.fromTexts([fs.readFileSync(path.join(process.cwd(), "initial_document.txt")).toString()], [{ id: 1 }], this.embeddings, { space: "cosine" });
            await this.save();
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
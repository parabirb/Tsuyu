// deps
import fs from "fs";
import path from "path";
import Embeddings from "./embeddings.js";
import config from "../config.json" with { type: "json" };
import { CloseVectorNode } from "@langchain/community/vectorstores/closevector/node";
import {
    CombinedMemory,
    BufferWindowMemory,
    ConversationSummaryBufferMemory,
    VectorStoreRetrieverMemory,
} from "langchain/memory";

// to test if directory has been created
function testDir(dir) {
    try {
        fs.accessSync(dir);
        return true;
    } catch {
        return false;
    }
}

// class
export default class Memory {
    // constructor
    constructor(llm) {
        this.llm = llm;
    }
    // initialization function
    async init() {
        // create an embedding thing
        this.embeddings = new Embeddings();
        await this.embeddings.init();
        // set the memory dir
        this.memoryDir = path.join(process.cwd(), "memory");
        // make a conversation summary buffer memory
        this.shortTermMemory = config.useSummarizer
            ? new ConversationSummaryBufferMemory({
                  llm: this.llm,
                  maxTokenLimit: config.historyPieces,
                  memoryKey: "conversationSummary",
              })
            : new BufferWindowMemory({
                  k: config.historyPieces,
                  memoryKey: "conversationSummary"
              });
        // if long-term memory is enabled
        if (config.memory) {
            // if the memory dir has been initialized
            if (testDir(this.memoryDir))
                this.vectorStore = await CloseVectorNode.load(
                    this.memoryDir,
                    this.embeddings,
                    { space: "cosine" }
                );
            // otherwise
            else {
                fs.mkdirSync(this.memoryDir);
                this.vectorStore = await CloseVectorNode.fromTexts(
                    [
                        fs
                            .readFileSync(
                                path.join(process.cwd(), "initial_document.txt")
                            )
                            .toString(),
                    ],
                    [{ id: 1 }],
                    this.embeddings,
                    { space: "cosine" }
                );
                await this.save();
            }
            // make a memory object
            this.longTermMemory = new VectorStoreRetrieverMemory({
                vectorStoreRetriever: this.vectorStore.asRetriever(
                    config.memoryDocs
                ),
                memoryKey: "relevantDocs",
            });
            // concat the two memory types
            this.memory = new CombinedMemory({
                memories: [this.longTermMemory, this.shortTermMemory],
            });
        }
        // otherwise
        else {
            this.memory = this.shortTermMemory;
        }
    }
    // save message
    async saveMessage(input, output) {
        await this.memory.saveContext({ input }, { output });
        if (config.memory) await this.save();
    }
    // retrieve memory
    async retrieveMemory(input) {
        return await this.memory.loadMemoryVariables({ input });
    }
    // save function
    async save() {
        await this.vectorStore.save(this.memoryDir);
    }
}

// deps
import Memory from "./memory.js";
import Vision from "./vision.js";
import EventEmitter from "events";
import Modules from "./modules.js";
import Wrapper from "./wrapper.js";
import Formatter from "./formatter.js";
import config from "../config.json" assert { type: "json" };

// export class
export default class LLM {
    // constructor
    constructor() {
        this.emitter = new EventEmitter();
    }
    // init function
    async init() {
        // create the model
        this.model = new Wrapper();
        // make a formatter
        this.formatter = new Formatter();
        await this.formatter.init();
        // if modules are enabled, init our modules
        if (config.modules)
            this.modules = new Modules(this.model, this.formatter);
        // if vision is enabled, init vision
        if (config.vision) {
            this.vision = new Vision();
            await this.vision.init();
        }
        // init the memory component
        this.memoryComponent = new Memory(this.model);
        await this.memoryComponent.init();
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
        let stream = await this.model.stream(
            this.formatter.format({
                input,
                dateTimeString: `${date.toLocaleDateString(
                    "en-US"
                )} ${date.toLocaleTimeString("en-US")}`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                relevantDocs: memories.relevantDocs,
                conversationSummary: memories.conversationSummary || "N/A",
                moduleInfo: config.modules
                    ? await this.modules.callModule(
                          input,
                          memories.relevantDocs
                      )
                    : undefined,
                caption:
                    imgPath && config.vision
                        ? await this.vision.caption(imgPath)
                        : undefined,
            })
        );
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

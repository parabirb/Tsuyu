// deps
import modules from "../modules/index.js";
import config from "../config.json" assert { type: "json" };
import { LlamaCpp } from "@langchain/community/llms/llama_cpp";

// function to parse json
function parseJson(input) {
    try {
        return JSON.parse(input);
    } catch {
        return false;
    }
}

// check if module exists
function checkIfModuleExists(moduleName) {
    // loop through
    for (let module of modules) {
        if (module.title === moduleName) return module;
    }
}

// check if all args met
function checkIfAllArgs(module, args) {
    // check
    for (let arg of Object.keys(module.args)) {
        if (!Object.keys(args).includes(arg)) return false;
    }
    return true;
}

// export class
export default class Modules {
    // constructor
    constructor(llmPath) {
        this.llmPath = llmPath;
        // create the model
        this.llm = new LlamaCpp({
            modelPath: this.llmPath,
            ...config.moduleLlamaConfig,
        });
    }
    // call module function
    async callModule(input, memory) {
        // convert the modules to text
        let textModules = modules
            .map(
                (module) => `Title: ${module.title}
Description: ${module.description}
Arguments:
${Object.keys(module.args)
    .map((key) => `- ${key}: ${module.args[key]}`)
    .join("\n")}`
            )
            .join("\n\n");
        // prompt the llm
        let response = await this.llm
            .invoke(`Predict which module should be called based on the input and context. If no module should be called or if the module you want to call does not exist, return null. Also return null if you do not have all the arguments necessary to call the relevant module. Otherwise, return a JSON object with key "title" for the title and a key "args" with the relevant arguments.

${
    memory
        ? `These pieces of context may be relevant.
${memory}
(Do not use the context if it is unnecessary.)
`
        : ""
}
Modules:
${textModules}

Input: ${input}

Do not output ANYTHING other than either the JSON or the word "null".`);
        // parse the output
        response = parseJson(response);
        // if it isn't json, return
        if (!response) return "N/A";
        // get the relevant module
        let module = checkIfModuleExists(response.title);
        // return if there is none
        if (!module) return "N/A";
        // return if args not met
        if (!checkIfAllArgs(module, response.args));
        // try the module
        try {
            return await module.function(response.args);
        } catch {
            return "N/A";
        }
    }
}

// deps
import config from "../config.json" with { type: "json" };
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
function checkIfModuleExists(moduleName, modules) {
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
    constructor(llm, formatter) {
        this.llm = llm;
        this.formatter = formatter;
    }
    // call module function
    async callModule(input, memory) {
        // get the modules
        let { default: modules } = await import("../modules/index.js");
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
            .invoke(this.formatter.formatSingle(`Predict which module should be called based on the input and context. If no module should be called or if the module you want to call does not exist, return null. Also return null if you do not have all the arguments necessary to call the relevant module. Otherwise, return a JSON object with key "title" for the title and a key "args" with the relevant arguments.
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

Do not output ANYTHING other than either the JSON or the word "null".`));
        // parse the output
        response = parseJson(response);
        // if it isn't json, return
        if (!response) return "N/A";
        // get the relevant module
        let module = checkIfModuleExists(response.title, modules);
        // return if there is none
        if (!module) return "N/A";
        // return if args not met
        if (!checkIfAllArgs(module, response.args)) return "N/A";
        // try the module
        try {
            return await module.function(response.args);
        } catch {
            return "N/A";
        }
    }
}

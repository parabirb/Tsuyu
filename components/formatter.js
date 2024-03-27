// deps
import { AutoTokenizer } from "@xenova/transformers";
import config from "../config.json" assert { type: "json" };

// class
export default class Formatter {
    // init function
    async init() {
        // set the tokenizer
        this.tokenizer = await AutoTokenizer.from_pretrained(config.hfModel);
    }
    // format function
    format({
        input,
        dateTimeString,
        timeZone,
        relevantDocs,
        conversationSummary,
        moduleInfo,
        caption,
    }) {
        // remove N/A from the conversation summary
        conversationSummary = conversationSummary.replace("N/A", "");
        // tease the summary out of conversationSummary
        let summary = conversationSummary.match(/System: [\w\d\s]+Human: /);
        if (summary) summary = summary[0].replace("System: ", "").replace("Human: ", "");
        // create a messages array with a system prompt
        let messages = [
            {
                role: "system",
                content: `${config.prompt}

Current date and time:
${dateTimeString}
Time zone:
${timeZone}

${
    relevantDocs
        ? `Relevant previous pieces of information/conversation:
${relevantDocs}
(Do not use these if they are not relevant)

`
        : ""
}${
    moduleInfo
        ? `Relevant information fetched by your modules:
${moduleInfo}
(Do not use this if it is not relevant)

`
        : ""
}${
    caption
        ? `Note that the user has attached an image to their latest message.
The image caption is as follows: ${caption}

`
        : ""
}${
    summary ? `Summary of the past conversation:
${summary}` : ""
}`,
            },
        ];
        // remove any summary from the conversationsummary if it exists
        if (summary) conversationSummary = conversationSummary.replace(/System: [\w\d\s]+Human: /, "");
        // split by the "AI: " tell
        conversationSummary = conversationSummary.replace(/Human: /g, "").split("AI: ");
        // now go through the summary
        for (let i = 0; i < conversationSummary.length; i++) {
            if (i % 2) {
                messages.push({
                    role: "assistant",
                    content: conversationSummary[i]
                });
            }
            else {
                messages.push({
                    role: "user",
                    content: conversationSummary[i]
                });
            }
        }
        // add the input
        messages.push({
            role: "user",
            content: input
        });
        // format the prompt
        return this.tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true });
    }
    // format single function
    formatSingle(input) {
        // create messages array
        let messages = [
            {
                role: "user",
                content: input
            }
        ];
        // return
        return this.tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true });
    }
}

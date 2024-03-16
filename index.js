// deps
import config from "./config.json" assert { type: "json" };
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";

const llamaPath = "/home/parabirb/Tsuyu/models/gpt4all-falcon-newbpe-q4_0.gguf";

const model = new ChatLlamaCpp({ modelPath: llamaPath });

const response = await model.invoke([
    new SystemMessage(config.prompt),
    new HumanMessage("Generate a short poem for me.")
]);
console.log(`AI: ${response.content}`);
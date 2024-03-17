// deps
import cors from "cors";
import path from "path";
import sse from "better-sse";
import { cwd } from "process";
import express from "express";
import bb from "express-busboy";
import bodyParser from "body-parser";
import LLM from "./components/llm.js";
import STT from "./components/stt.js";
import TTS from "./components/tts.js";
import config from "./config.json" assert { type: "json" };

// load the LLM
console.log("Loading LLM module...");
const llm = new LLM();
await llm.init();

// if TTS is enabled
let tts;
if (config.tts) {
    console.log("Loading TTS module...");
    tts = new TTS();
    await tts.init();
}

// if STT is enabled
let stt;
if (config.stt) {
    console.log("Loading STT module...");
    stt = new STT();
    await stt.init();
}

// log once all components are loaded
console.log("All components loaded!");

// create express app
const app = new express();

// set app to use cors
app.use(cors());
// set app to use bodyparser for json
app.use(bodyParser.json());
// set static folder to build (so we can have webui)
app.use(express.static("build"));
// extend with busboy to allow uploads
bb.extend(app, {
    upload: true,
});

// send ame speech upon request
app.get("/ame_speech.wav", async (req, res) => {
    res.sendFile(path.join(cwd(), "ame_speech.wav"));
});

// text generation (compatible w/ ame api)
app.post("/api/v1/text", async (req, res) => {
    // log
    console.log(`Generation requested: ${req.body.input}`);
    // generate output with the llm
    let output = await llm.generate(req.body.input);
    // log the output
    console.log(`Output generated: ${output}`);
    // if tts is enabled, speak the output
    if (tts) await tts.speak(output);
    // log on output spoken
    console.log("Output processing done!");
    // return
    res.json({
        output,
        tts: !!tts,
    });
});

// text generation from speech (compatible w/ ame api)
app.post("/api/v1/full", async (req, res) => {
    // if stt is off
    if (!stt) {
        res.json({
            input: "N/A",
            output: "STT is turned off on this Tsuyu instance.",
            tts: false,
        });
        return;
    }
    // log
    console.log(
        "Generation through full endpoint requested. Running transcription..."
    );
    // get the transcription
    const input = await stt.transcribe(req.files.recording.file);
    // log
    console.log(`Transcription finished: ${input}`);
    // get output from the llm
    let output = await llm.generate(input);
    // log the output
    console.log(`Output generated: ${output}`);
    // if tts is enabled, speak the output
    if (tts) await tts.speak(output);
    // log on output spoken
    console.log("Output processing done!");
    // return
    res.json({
        input,
        output,
        tts: !!tts,
    });
});

// sse endpoint
app.get("/api/v1/sse", async (req, res) => {
    // create a session
    let session = await sse.createSession(req, res);
    // configure an event listener
    let eventListener = (data) => {
        session.push(data);
    }
    // hook it to the event emitter
    llm.emitter.on("chunk", eventListener);
    // when the session closes, remove the event listener
    session.on("disconnected", () => llm.emitter.removeListener("chunk", eventListener));
});

// set app to listen on config port
app.listen(config.port);
console.log(`Listening on ${config.port}...`);

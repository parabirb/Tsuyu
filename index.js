// deps
import cors from "cors";
import path from "path";
import sse from "better-sse";
import { cwd } from "process";
import express from "express";
import bb from "express-busboy";
import bodyParser from "body-parser";
import localtunnel from "localtunnel";
import Controller from "./controller.js";
import config from "./config.json" with { type: "json" };

// create the controller
let controller = new Controller();
// init it
await controller.init();

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
    res.json(await controller.text(req.body.input));
});

// text generation from speech (compatible w/ ame api)
app.post("/api/v1/full", async (req, res) => {
    res.json(await controller.audio(req.files.recording.file));
});

// text generation with vision
app.post("/api/v1/vision", async (req, res) => {
    res.json(await controller.vision(req.body.input, req.files.image.file));
});

// sse endpoint
app.get("/api/v1/sse", async (req, res) => {
    // create a session
    let session = await sse.createSession(req, res);
    // configure an event listener
    let eventListener = (data) => {
        session.push(data);
    };
    // hook it to the event emitter
    controller.emitter.on("chunk", eventListener);
    // when the session closes, remove the event listener
    session.on("disconnected", () =>
        controller.emitter.removeListener("chunk", eventListener)
    );
});

// set app to listen on config port
app.listen(config.port);
console.log(`Listening on ${config.port}...
If you installed a Web UI, you can visit http://localhost:${config.port} to access it.`);

// if localtunnel is enabled
if (config.forwarding) {
    // log
    console.log("Creating tunnel...");
    // create tunnel
    let tunnel = await localtunnel({ port: config.port });
    // log the url
    console.log(`URL for tunneling: ${tunnel.url}`);
    // log password
    let password = await fetch("https://loca.lt/mytunnelpassword").then((res) =>
        res.text()
    );
    console.log(
        `You will need a password to access the tunnel from the browser. The password is: ${password}`
    );
}

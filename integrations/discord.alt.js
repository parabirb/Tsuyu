// deps
import os from "os";
import path from "path";
import fs from "fs/promises";
import { Client } from "discord.js";
import Controller from "../controller.js";
import config from "../config.json" with { "type": "json" };

// variables
let generating = false;
let tmpDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}tsuyu-`);

// controller
let controller = new Controller();
await controller.init();

// client
const client = new Client({
    intents: [33281],
});

// on ready
client.on("ready", async () => {
    // set presence
    await client.user.setPresence({
        activities: [
            {
                name: "for new messages",
                type: 3,
            },
        ],
    });
    // ready
    console.log("Ready!");
});

// on message
client.on("messageCreate", async (msg) => {
    // don't let the bot infinite reply itself
    if (msg.author.id === client.user.id) return;
    // if we're in the right channel
    if (msg.channel.id === config.channel) {
        // if we're generating
        if (generating) {
            msg.reply("Tsuyu can only process one message at a time!");
            return;
        }
        // if there's multiple attachments
        if (msg.attachments.length > 1) {
            msg.reply("Tsuyu can only process one attachment.");
            return;
        }
        // if there's no content and the attachment content type isn't audio
        if (
            msg.attachments.length &&
            !msg.content &&
            !msg.attachments[0].contentType.startsWith("audio")
        ) {
            msg.reply("Your message must have **something** in it.");
            return;
        }
        // if audio is attached and audio isn't supported
        if (
            msg.attachments.length &&
            msg.attachments[0].contentType.startsWith("audio") &&
            !config.stt
        ) {
            msg.reply("This Tsuyu instance does not support STT. Sorry.");
            return;
        }
        // if image is attached and image isn't supported
        if (
            msg.attachments.length &&
            msg.attachments[0].contentType.startsWith("image") &&
            !config.vision
        ) {
            msg.reply("This Tsuyu instance does not support vision. Sorry.");
            return;
        }
        // otherwise, turn on generating
        generating = true;
        // download the attachment
        let attachment;
        if (msg.attachments.length)
            attachment = await fetch(msg.attachments[0].attachment)
                .then((res) => res.blob())
                .then(async (blob) => {
                    let pth = path.join(tmpDir, msg.attachments[0].name);
                    await fs.writeFile(
                        pth,
                        new Uint8Array(await blob.arrayBuffer())
                    );
                    return pth;
                });
        // response variable
        let response = "";
        // numbers of messages sent
        let nmbrMessages = 1;
        // send message in reply
        let message = await msg.reply("Generating response, please wait...");
        // start typing
        message.channel.sendTyping();
        // interval
        let interval = setInterval(async () => {
            if (response.length / 1900 >= nmbrMessages) {
                if (
                    response
                        .slice(
                            Math.floor(response.length / 1900) * 1900,
                            Math.ceil(response.length / 1900) * 1900
                        )
                        .trim() !== ""
                ) {
                    message = await message.reply(
                        response.slice(
                            Math.floor(response.length / 1900) * 1900,
                            Math.ceil(response.length / 1900) * 1900
                        )
                    );
                    message.channel.sendTyping();
                    nmbrMessages++;
                }
            } else if (response.trim() !== "") {
                await message.edit(
                    response.slice(
                        Math.floor(response.length / 1900) * 1900,
                        Math.ceil(response.length / 1900) * 1900
                    )
                );
            }
        }, 2000);
        // stream generation
        let fnc = (chunk) => {
            response += chunk;
        };
        controller.emitter.on("chunk", fnc);
        let rsp = attachment
            ? msg.attachments[0].contentType.startsWith("image")
                ? await controller.vision(message.content, attachment)
                : await controller.audio(attachment)
            : await controller.text(message.content);
        console.log(rsp);
        // destroy the interval
        clearInterval(interval);
        // edit the response
        await message.edit(
            response.slice(
                Math.floor(response.length / 1900) * 1900,
                Math.ceil(response.length / 1900) * 1900
            )
        );
        // stop the listener
        controller.emitter.removeListener("chunk", fnc);
        // set generating to false
        generating = false;
    }
});

// login
client.login(config.token);

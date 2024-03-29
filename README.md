# Tsuyu (梅雨)
Tsuyu is a lightweight virtual assistant framework based off Ame's design. While Tsuyu isn't particularly customizable at the moment, it provides a functional, fast alternative to Ame for those with less powerful systems and those who don't wish to work with Python. Tsuyu is also typically easier to install, and has features that Ame doesn't (like streaming and vision).

**Tsuyu is currently in a preliminary state, and there may be bugs. Please join the Ame Discord server if you wish to report any issues.**

## Why Try Tsuyu?
For certain users, Tsuyu may provide key advantages over Ame, such as:
* A simpler interface. Tsuyu's design is centered around providing lightweight interfaces that can quickly be turned into working assistant prototypes.
* Lighter resource usage and faster generations. While Ame is meant to be run on enterprise-grade hardware, Tsuyu can run on ordinary consumer hardware. A simple gaming PC (without an RTX GPU) or Mac is oftentimes enough to get generations within just 20-30 seconds. Additionally, Tsuyu is intended for use with LLMs from 7B down to 0.5B, Tsuyu's TTS model is dozens of times smaller than Ame's, and Tsuyu's STT model is also smaller. Even with STT, TTS, and Vision enabled, Tsuyu can often run much faster than Ame.
* JavaScript interfacing. Ame is written fully in Python, but Tsuyu is written fully in JavaScript and designed to be integrated with JS from the bottom-up. If you don't want to write Python, Tsuyu provides massive advantages.
* A more functional server/client interface. Ame doesn't currently provide a functional web interface, but Tsuyu does (note that Ame **will** have an API and web UI on par with Tsuyu's in the future). Additionally, as Tsuyu is written by a web developer, Tsuyu's interfaces are more in line with current standards.
* Streaming. Tsuyu currently provides streaming in the controller, web API, and web UI. Ame currently does not.
* Crude vision. Tsuyu supports simple, basic vision using ViT + GPT-2. Ame does not, although vision support is planned for the future. 
* High levels of support. Users can go into the Ame Discord and get quick, fast, and helpful support from the Tsuyu dev.
* Easier installation. Tsuyu is typically faster to get running than Ame.
* No licensing. Tsuyu's core and Tsuyu's example modules are entirely in the public domain.

We recommend Tsuyu for the following types of users:
* Users who do not need fine-grained control.
* Users who do not need extremely accurate generations.
* Users who do not mind a more simplistic and less fleshed out API.
* Users who are fine with less accurate, monolingual TTS.
* Users who are not on enterprise hardware or who want quick generations.
* Users who want access to one integrated pipeline without much fuss.
* New users who don't want the complexity that comes with Ame.
* Users who want public domain software.

However, Ame may be more appropriate for these kinds of users:
* Users who need highly accurate generations.
* Users who need low-level control. While Tsuyu **does** provide direct access to its models through the component, Ame allows for far more control.
* Users running enterprise-grade applications. Tsuyu is not stable at the moment, and Ame is more tweakable than Tsuyu.
* Users who are more comfortable in Python. Tsuyu can be interfaced with in Python through its web API, but the current web API does not provide the same control as the JavaScript interface.
* Users who want strict control over prompting. Ame is better for this use case.

Overall, we recommend you evaluate your use case to figure out which one is better for you. However, for a lot of users, Tsuyu may be the better alternative.

## Installing Tsuyu
Tsuyu is easier to run than Ame, but it'll still require a bit of work. You will need node and npm installed. Here are the steps:

1. Download the Tsuyu repository (`git clone git@github.com:parabirb/Tsuyu.git` or `git clone https://github.com/parabirb/Tsuyu.git`).
2. Run `npm install` in the Tsuyu repository.
3. **If you are not on Mac and want to use CUDA, you will need to download the relevant binary for your OS. If you're on Mac or do not have a NVIDIA GPU, you can skip this step.** To do this, simply run `npx --no node-llama-cpp download --cuda` in the Tsuyu repository. If you get an error, run `npm install node-llama-cpp` and try again.
4. Create a `models` folder inside the Tsuyu repository, then download your preferred LLM (**it must be a chat finetune**) in GGUF format and move it into the folder. We currently recommend anything in the [Qwen1.5](https://huggingface.co/collections/Qwen/qwen15-65c0a2f577b1ecb76d786524) lineup, including the small models (down to 0.5B!).
5. Write your config file to `config.json`. An example is provided in `config.example.json`.
6. **If you are using long-term memory, you will have to set an initial memory.** You can do this by modifying `initial_document.txt`.
7. You're ready to work with Tsuyu! As Tsuyu is an officially supported port of Ame, you can join the [Discord server](https://discord.gg/y9H8NWDxeC) if you have any questions or need help.

Note: STT will not work unless you have ffmpeg installed on your system. If you are on Windows, click [here](https://www.wikihow.com/Install-FFmpeg-on-Windows) for instructions on how to install ffmpeg. Mac users can install ffmpeg through [Homebrew](https://brew.sh), and Linux users can install ffmpeg through their package manager.

## Installing the Tsuyu Web UI
Tsuyu's web UI is provided (and must be installed) separately. Below are the instructions:
1. In another folder, download the Tsuyu WebUI repository (`git clone git@github.com:parabirb/Tsuyu-WebUI.git` or `git clone https://github.com/parabirb/Tsuyu-WebUI.git`).
2. Run `npm install`, then `npm run build` in the Tsuyu WebUI repository.
3. Move the `build` folder in the Tsuyu WebUI repository to the Tsuyu repository.
4. You can now use the web UI. Just do `node .` in the Tsuyu folder, and a link to the interface will be provided in the console. 

## Configuration
You should save a config to `config.json`. An example is provided to you in `config.example.json`. Below is a detailed description of each parameter.

* `port`: A number with the port to run the web API on. You can omit this if you aren't running the web interface.
* `forwarding`: A boolean that determines whether Tsuyu's web interface will run a reverse proxy (similar to ngrok) or not. If you aren't using the web interface, it's safe to omit this.
* `token`: The token for Tsuyu's Discord bot. You can omit this if you aren't using the Discord integration.
* `channel`: The channel where you'll be running Tsuyu's Discord bot. You can also omit this if you aren't using the Discord integration.
* `memory`: Determines whether long-term memory is enabled or not. Set this to `true` if you wish to enable memory, and `false` if you do not. Enabling memory may cause some LLM-related bugs.
* `modules`: Determines whether modules are enabled. Set this to `true` to enable modules, and `false` to leave them disabled. **Please note that enabling modules will increase VRAM usage, as two separate LLaMA contexts have to be created. Additionally, LLaMA will be called twice per generation.**
* `memoryDocs` - Determines how many memories the memory component will feed to the LLM on each generation. You can omit this if you have long-term memory disabled.
* `useSummarizer` and `historyPieces` - `useSummarizer` determines the type of short-term memory (chat history) Tsuyu will use. If set to `true`, Tsuyu will call LLaMA to summarize the chatlogs once they get longer than `historyPieces` tokens. If set to `false`, Tsuyu will use a simple window-based chat history, keeping the last `historyPieces` input/output pairs in short-term memory. **These options do NOT impact long-term memory.**
* `llamaConfig` - This is the config passed to llama.cpp when Tsuyu creates a `LlamaModel`. See [the node-llama-cpp docs](https://withcatai.github.io/node-llama-cpp/api/type-aliases/LlamaModelOptions) for more info.
* `contextConfig` - This is passed to node-llama-cpp when Tsuyu creates a `LlamaContext`. See [the node-llama-cpp docs](https://withcatai.github.io/node-llama-cpp/api/type-aliases/LlamaContextOptions) for more info.
* `params` - These are the parameters passed to node-llama-cpp when generating a response. As always, see [the node-llama-cpp docs](https://withcatai.github.io/node-llama-cpp/api/classes/LlamaContext#evaluate) for more info.
* `llm` - The filename of the LLM to use. Note that your LLM should be in GGUF format, should be a chat finetune, and should be in the `models` directory.
* `hfModel` - This should be the name of the HuggingFace repository containing your model (or the closest thing to it). This is used to automatically detect the correct prompt format for the model you're using, so it's essential that you pick the right one.
* `stt` - The HuggingFace repository to retrieve the STT model from. We recommend that you leave this as `Xenova/whisper-small`. However, if accuracy doesn't matter, you can set this to `Xenova/whisper-tiny` or `Xenova/whisper-tiny.en`. **Omitting this will disable speech-to-text.**
* `tts` - The HuggingFace repository to retrieve the TTS model from. We recommend using either `Xenova/speecht5_tts` or `Xenova/mms-tts-eng`. **Omitting this will disable text-to-speech.**
* `vision` - The HuggingFace repository to retrieve the vision model from. You should probably leave this as `Xenova/vit-gpt2-image-captioning` if you want vision to work well. **Omitting this will disable vision.**
* `embeddings` - The HuggingFace repository to fetch the embedding model from. Unless you know what you're doing, we recommend leaving this as `Xenova/all-MiniLM-L6-v2`. You can omit this if you have long-term memory disabled, but we recommend not doing so.
* `ttsEmbeddings` - The URL to retrieve the TTS embedding model from. If you want to use TTS, leave this as `https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin`. You can omit this if you don't wannt to use TTS.
* `prompt` - The prompt fed to the LLM. This should contain everything the LLM needs to know about the intended personality and output. Think of it like prompting gpt-3.5-turbo or similar.

## Tsuyu Controller
If you don't wish to use a web API, Tsuyu also provides you a controller you can directly interface with. Example usage is below:
```js
import Controller from "./controller.js";

const controller = new Controller();
await controller.init();

console.log(await controller.generate("Hello, world!"));
```

`Controller` is a class, which, as the example suggests, is provided in `controller.js`. The methods it provides are below:
* `constructor()` - Creates the controller, but **does not** initialize it.
* `async init()` - Initializes the controller (including AI models), making it ready for use.
* `async vision(input: String, imagePath: String)` - **Only works if vision is enabled in the config.** Runs a full vision pipeline on the text input and image at the provided image path, returning an object with two keys:
    * `output` - The output of the LLM.
    * `tts` - `true` if TTS was generated, `false` if it was not. If generated, the TTS output is located at `cwd/ame_speech.wav`.
* `async audio(audioPath: String)` - **Only works if STT is enabled in the config.** Runs the full audio pipeline on the audio at the given path, returning an object with three keys:
    * `input` - A transcription of the audio.
    * `output` - The LLM's output.
    * `tts` - `true` if generated (output at `cwd/ame_speech.wav`), `false` if not.
* `async text(input: String)` - Runs the full text pipeline on the given input, returning an object with two keys:
    * `output` - The LLM output.
    * `tts` - `true` if generated and saved to `cwd/ame_speech.wav`, `false` if not.
* `async see(imagePath: String)` - **Only works if vision is enabled in the config.** Runs the vision model on the image at `imagePath` and returns a string with the generated caption.
* `async listen(audioPath: String)` - **Only works if STT is enabled in the config.** Runs the STT model on the audio at `audioPath` and returns a string with the transcript.
* `async speak(text: String)` - **Only works if TTS is enabled in the config.** Runs the TTS model on the text. Returns `true` if audio was successfully generated and saved to `cwd/ame_speech.wav`.
* `async generate(input: String)` - Passes the given input to the LLM, and returns the output, skipping STT and TTS. The module pipeline will still run if enabled.

Additionally, the controller comes with two useful properties:
* `emitter: EventEmitter` - An event emitter for streaming. Emits `chunk` events with data whenever a chunk is received from the LLM.
* `model: Wrapper` - An interface for directly working with the LLM, in case you want to skip Tsuyu's prompting and pipelines. **Only powerusers should use this interface.** The model class implements the `invoke` and `stream` functions from LangChain.js's [ChatLlamaCpp](https://api.js.langchain.com/classes/langchain_community_chat_models_llama_cpp.ChatLlamaCpp.html).

## Tsuyu Web API Endpoints
Tsuyu's web interface currently provides five API endpoints.

* `GET /ame_speech.wav` will return the last line spoken by Ame, if there is one.
* `POST /api/v1/text` with a JSON body of `{ input: String }` will feed the text to the LLM and provide a JSON output with two keys.
    * `output` - A string containing the output of the LLM run.
    * `tts` - A boolean, `true` if TTS is enabled and TTS was generated, `false` if otherwise.
* `POST /api/v1/full` with a `multipart/form-data` body where `recording` is any type of audio file will feed the recording to the STT and provide a JSON output with three keys. Note that if STT is disabled, this endpoint will simply provide dummy output instead of erroring.
    * `input` - A string containing the STT model's transcription of the recording.
    * `output` - A string containing the LLM's generation.
    * `tts` - A boolean to indicate whether TTS was generated or not.
* `POST /api/v1/vision` with a `multipart/form-data` body where `image` is any type of image and `input` is a string with text input will feed the image and the text to the LLM (with the image being passed to the vision model first), providing a JSON output with two keys. If vision is disabled, this endpoint will provide dummy output instead of erroring.
    * `output` - A string containing the output of the LLM.
    * `tts` - A boolean indicating whether TTS was generated or not.
* `GET /api/v1/sse` will start a server-side events stream. Whenever a chunk is generated by the LLM, it will be passed through the stream.

There will also be programmatic ways to interact with the Tsuyu controller in the future, like with Ame.

## Tsuyu Modules
Much like Ame, Tsuyu provides an interface for modules. Users are expected to provide their own modules. Thus, no packages for modules will be provided.

HOWEVER, Tsuyu does have an [example](https://github.com/parabirb/Tsuyu-Modules) of how to implement modules.

Here's what you need to know:

* All modules should go in the `modules` folder.
* Your `modules` folder should have an `index.js`, with the default export being an array of the modules you want enabled.
* A module should be an object with four properties:
    * `title`: This is the title of the module that the LLM will use when calling it. Your title should ideally be lowercase.
    * `function`: This is the function that will be called when the LLM attempts to run the module. **This function must take an object.** Your function should return a sentence that the LLM can read.
    * `description`: This is the description of the module that will be given to the LLM. It should simply say what the module does.
    * `args`: This is another object, which contains the arguments that the LLM needs to provide to the module to call it. The object's keys should be the names of each argument that must be passed to the function, and the values under the keys should be descriptions of the relevant arguments.

To see all of this in action, check the [example weather module](https://github.com/parabirb/Tsuyu-Modules/blob/main/weather.js) out.

## Progress & Roadmap
As a reimplementation of Ame v1's features, Tsuyu has the same goals. Below is a chart of our progress:

🔴 Planned | 🟡 In progress | 🟢 Finished

### Core (v1)

Component                     | Status 
----------------------------- | -----
Speech-to-text                |  🟢
Text-to-speech                |  🟢
Long-term memory              |  🟢
Primary controller            |  🟢
Module handler                |  🟢
Server/client interface       |  🟢

### Extensions (v1)

Component                     | Status 
----------------------------- | -----
Client UI                     |  🟢
Discord interface             |  🟢
Documentation                 |  🟢

### Additional features
Component                     | Status 
----------------------------- | -----
Context summarization         |  🟢
Streaming                     |  🟢
Reverse proxy                 |  🟢
Vision                        |  🟢
UI revamp                     |  🔴
Installer                     |  🔴
Logging                       |  🟡

## Acknowledgements
This project would not be possible without LangChain.js, node-llama-cpp, Transformers.js, CloseVector, and fluent-ffmpeg.

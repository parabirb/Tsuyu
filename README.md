# Tsuyu (梅雨)
Tsuyu is a lightweight virtual assistant framework based off Ame's design. While Tsuyu isn't particularly customizable at the moment, it provides a functional, fast alternative to Ame for those with less powerful systems and those who don't wish to work with Python. Tsuyu is also typically easier to install, and has features that Ame doesn't (like streaming and vision).

**Tsuyu is currently in a preliminary state, and there may be bugs. Please join the Ame Discord server if you wish to report any issues.**

## Installing Tsuyu
Tsuyu is easier to run than Ame, but it'll still require a bit of work. You will need node and npm installed. Here are the steps:

1. Download the Tsuyu repository (`git clone git@github.com:parabirb/Tsuyu.git` or `git clone https://github.com/parabirb/Tsuyu.git`).
2. Run `npm install` in the Tsuyu repository.
3. **If you are not on Mac and want to use CUDA, you will need to download the relevant binary for your OS. If you're on Mac or do not have a NVIDIA GPU, you can skip this step.** To do this, simply run `npx --no node-llama-cpp download --cuda` in the Tsuyu repository. If you get an error, run `npm install node-llama-cpp` and try again.
4. Create a `models` folder inside the Tsuyu repository, then download your preferred LLM in GGUF format and move it into the folder. We recommend either [mistral-7b-instruct-v0.1.Q4_0.gguf](https://gpt4all.io/models/gguf/mistral-7b-instruct-v0.1.Q4_0.gguf) or [gpt4all-falcon-newbpe-q4_0.gguf](https://gpt4all.io/models/gguf/gpt4all-falcon-newbpe-q4_0.gguf).
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
* `memory`: Determines whether long-term memory is enabled or not. Set this to `true` if you wish to enable memory, and `false` if you do not. Enabling memory may cause some LLM-related bugs.
* `modules`: Determines whether modules are enabled. Set this to `true` to enable modules, and `false` to leave them disabled. **Modules will significantly slow Tsuyu down and take up resources, as LLaMA has to run twice on each generation AND has to be loaded twice when modules are enabled.**
* `memoryDocs` - Determines how many memories the memory component will feed to the LLM on each generation. You can omit this if you have long-term memory disabled.
* `useSummarizer` and `historyPieces` - `useSummarizer` determines the type of short-term memory (chat history) Tsuyu will use. If set to `true`, Tsuyu will call LLaMA to summarize the chatlogs once they get longer than `historyPieces` tokens. If set to `false`, Tsuyu will use a simple window-based chat history, keeping the last `historyPieces` input/output pairs in short-term memory. **These options do NOT impact long-term memory.**
* `llamaConfig` - These are the parameters passed directly to LangChain and llama.cpp. Increase `gpuLayers` if you want to offload the LLM onto the GPU, set `verbose` to true if you want more detailed logging from LangChain, and increase `batchSize` if you want a larger potential context window.
* `moduleLlamaConfig` - The same as `llamaConfig`, but for the LLaMA instance powering the modules. You can omit this if you have modules disabled.
* `llm` - The filename of the LLM to use. Note that your LLM should be in GGUF format, and should be in the `models` directory.
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
* `llm: ChatLlamaCpp` - An interface for directly working with the LLM, in case you want to skip Tsuyu's prompting and pipelines. **Only powerusers should use this interface.** For more information on the ChatLlamaCpp interface, see the [LangChain.js](https://api.js.langchain.com/classes/langchain_community_chat_models_llama_cpp.ChatLlamaCpp.html) documentation.

## Tsuyu Web API Endpoints
Tsuyu's web interface currently provides four API endpoints.

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
Discord interface             |  🔴
Telegram interface            |  🔴
Documentation                 |  🟢

### Additional features (separate from Ame)
Component                     | Status 
----------------------------- | -----
Context summarization         |  🟢
Streaming                     |  🟢
Reverse proxy                 |  🟢
Vision                        |  🟢

## Acknowledgements
This project would not be possible without LangChain.js, node-llama-cpp, Transformers.js, CloseVector, and fluent-ffmpeg.

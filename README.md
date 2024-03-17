# Tsuyu (梅雨)
Tsuyu is a lightweight virtual assistant framework based off Ame's design. While Tsuyu isn't particularly customizable at the moment, it provides a functional, fast alternative to Ame for those with less powerful systems and those who don't wish to work with Python. Tsuyu is also typically easier to install, and has features that Ame doesn't (like streaming).

**TSUYU IS NOT READY FOR RELEASE YET! There are bugs. Only use Tsuyu for testing.**

## Installing Tsuyu
Tsuyu is easier to run than Ame, but it'll still require a bit of work. You will need node and npm installed. Here are the steps:

1. Download the Tsuyu repository (`git clone git@github.com:parabirb/Tsuyu.git`).
2. Run `npm install`.
3. In another folder, download the Tsuyu WebUI repository (`git clone git@github.com:parabirb/Tsuyu-WebUI.git`).
4. Run `npm install`, then `npm build` in the Tsuyu WebUI repository.
5. Move the `build` folder in the Tsuyu WebUI repository to the Tsuyu repository.
6. **If you are not on Mac and want to use CUDA, you will need to download the relevant binary for your OS. If you're on Mac or do not have a NVIDIA GPU, you can skip this step.** To do this, simply run `npx --no node-llama-cpp download --cuda` in the Tsuyu repository.
7. Create a `models` folder inside the Tsuyu repository, then download your preferred LLM in GGUF format and move it into the folder. We recommend either [mistral-7b-instruct-v0.1.Q4_0.gguf](https://gpt4all.io/models/gguf/mistral-7b-instruct-v0.1.Q4_0.gguf) or [gpt4all-falcon-newbpe-q4_0.gguf](https://gpt4all.io/models/gguf/gpt4all-falcon-newbpe-q4_0.gguf).
8. Write your config file to `config.json`. An example is provided in `config.example.json`.
9. **If you are using long-term memory, you will have to set an initial memory.** You can do this by modifying `initial_document.txt`.
10. You're ready to run Tsuyu! Just do `node .` and you should be ready. If you installed the web UI, you can visit the port to see an accessible interface. As Tsuyu is an officially supported port of Ame, you can join the [Discord server](https://discord.gg/y9H8NWDxeC) if you have any questions or need help.

## Tsuyu API Endpoints
Tsuyu currently provides four API endpoints.

* `GET /ame_speech.wav` will return the last line spoken by Ame, if there is one.
* `POST /api/v1/text` with a JSON body of `{ input: String }` will feed the text to the LLM and provide a JSON output with two keys.
    * `output` - A string containing the output of the LLM run.
    * `tts` - A boolean, `true` if TTS is enabled and TTS was generated, `false` if otherwise.
* `POST /api/v1/full` with a `multipart/form-data` body where `recording` is any type of audio file will feed the recording to the STT and provide a JSON output with three keys. Note that if STT is disabled, this endpoint will simply provide dummy output instead of erroring.
    * `input` - A string containing the STT model's transcription of the recording.
    * `output` - A string containing the LLM's generation.
    * `tts` - A boolean to indicate whether TTS was generated or not.
* `GET /api/v1/sse` will start a server-side events stream. Whenever a chunk is geenerated by the LLM, it will be passed through the stream.

There will also be programmatic ways to interact with the Tsuyu controller in the future, like with Ame.

## Acknowledgements
This project would not be possible without LangChain.js, node-llama-cpp, Transformers.js, CloseVector, and fluent-ffmpeg.
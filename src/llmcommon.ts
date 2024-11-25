// @ts-ignore
import appConfig from "@/app-config";
import { Chat, CreateMLCEngine, CreateWebWorkerMLCEngine, WebWorkerMLCEngine, type AppConfig, type InitProgressReport } from "@mlc-ai/web-llm";
import { parseMarkdown, highlight } from '@/mdcommon';
import { VCardItem } from "vuetify/components";

export default class Assistant {
    llmConfig!: AppConfig;
    chat!: Chat;
    engine!: WebWorkerMLCEngine
    messages!: any

    public async init(selectedModel: string) {
        //const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

        this.llmConfig = appConfig;
        this.messages = [];

        /*
        // Callback function to update model loading progress
        const initProgressCallback = (initProgress: InitProgressReport) => {
            console.log(initProgress);
        }

        const engine = await CreateMLCEngine(
            selectedModel,
            { initProgressCallback: initProgressCallback, 
                //appConfig 
            }, // engineConfig
        );

        const messages: any = [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: "Hello!" },
        ]

        const reply = await engine.chat.completions.create({
            messages,
        });
        console.log(reply.choices[0].message);
        console.log(reply.usage);
        */


        console.log(this.llmConfig)
        const initProgressCallback = (report: InitProgressReport) => {
            console.log(report);
            Assistant.setLabel("init-label", report.text);
        }

        const engine = await CreateWebWorkerMLCEngine(
            new Worker(
                new URL("@/llmworker.ts", import.meta.url),
                {
                    type: "module",
                }
            ),
            selectedModel,
            {
                appConfig: this.llmConfig,
                initProgressCallback
            },
        );

        this.engine = engine;
        this.chat = engine.chat;



        // this.chat = new ChatWorkerClient(new Worker(
        //     new URL('@/llmworker.ts', import.meta.url),
        //     { type: 'module' }
        // ));

    }

    public static setLabel(id: string, text: string) {
        const label = document.getElementById(id);
        if (label == null) {
            throw Error("Cannot find label " + id);
        }
        label.innerHTML = parseMarkdown(text) as string;
    }

    public static generateProgressCallback(itemId: string) {
        return (_step: number, message: string) => this.setLabel(itemId, message);
    };

    public modelList() {
        return appConfig.model_list.map((item: { model_id: any; }) => item.model_id);
    }

    public async reload(model: string) {
        //const model = "RedPajama-INCITE-Chat-3B-v1-q4f32_0";
        //const model = "TinyLlama-1.1B-Chat-v0.3-q4f32_0";
        if (this.engine === undefined) {
            await this.init(model);
        }

        await this.engine.reload(model);
    }

    public async prompt(prompt: string, itemId: string) {
        this.messages.push({ role: "user", content: prompt });

        const reply = await this.engine.chat.completions.create({
            messages: this.messages,
        });
        
        this.messages.push({ role: "assistant", content: reply.choices[0].message.content });
        return reply.choices[0].message.content
    }

    public async explain(code: string, itemId: string) {
        const prompt = `${code}`;
        return await this.prompt(prompt, itemId);
    }
}

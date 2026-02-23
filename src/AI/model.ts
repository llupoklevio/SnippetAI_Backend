import { initChatModel } from "langchain";

type ModelAI = Awaited<ReturnType<typeof initChatModel>>

let _model: ModelAI | null = null

export const setupModelAI = async () => {
    try {
        _model = await initChatModel("gpt-4.1");
        console.log("AI Model caricato correttamente")
    } catch(e) {
        console.error(e);
    }
}

export const getModelAI = () => _model
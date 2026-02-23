import {initChatModel} from "langchain";

export const setupModelAI = async () => {
    try{
       return await initChatModel("gpt-4.1");

    }catch(e){
        console.error(e);
    }
}
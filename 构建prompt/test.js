import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import "dotenv/config";

const systemTemplate =
  "你是一个专业的翻译员，你的任务是将文本从{source_lang}翻译成{target_lang}。";
const humanTemplate = "请翻译这句话：{text}";

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", humanTemplate],
]);

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const outputPraser = new StringOutputParser();

const chain = chatPrompt.pipe(chatModel).pipe(outputPraser);

const res = await chain.invoke({
  source_lang: "中文",
  target_lang: "英语",
  text: "你好，世界",
});

console.log(res);

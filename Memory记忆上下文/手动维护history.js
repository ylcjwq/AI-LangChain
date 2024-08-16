import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import "dotenv/config";

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你是一个乐于助人的助手。尽你所能回答所有问题。你说话很多，并且提供很多来自其上下文的特定细节。
    如果你不知道问题的答案，你会诚实地说你不知道。`,
  ],
  new MessagesPlaceholder("history_message"),
]);

const chain = prompt.pipe(chatModel);

const history = new ChatMessageHistory();
await history.addMessage(new HumanMessage("你好，我的名字叫ylc"));

const res = await chain.invoke({
  history_message: await history.getMessages(),
});

console.log(res);

await history.addMessage(res);
await history.addMessage(new HumanMessage("我叫什么名字?"));

const res1 = await chain.invoke({
  history_message: await history.getMessages(),
});

console.log(res1);

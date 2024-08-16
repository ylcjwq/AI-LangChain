// RunnableWithMessageHistory  自动维护history
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
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
  ["human", "{input}"],
]);

const history = new ChatMessageHistory();
const chain = prompt.pipe(chatModel);

const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain, // 需要被包裹的 chain
  getMessageHistory: (_sessionId) => history, // 根据传入的 _sessionId，去获取对应的 ChatMessageHistory 对象
  inputMessagesKey: "input", // 用户传入的信息 key 的名称
  historyMessagesKey: "history_message", // 聊天记录在 prompt 中的 key
});

const res = await chainWithHistory.invoke(
  {
    input: "你好，我的名字叫ylc",
  },
  {
    configurable: { sessionId: "none" },
  }
);

console.log(res);

const res1 = await chainWithHistory.invoke(
  {
    input: "我的名字叫什么？",
  },
  {
    configurable: { sessionId: "none" },
  }
);

console.log(res1);

const hty = await history.getMessages();
console.log(hty);

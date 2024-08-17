// ConversationSummaryMemory 随着聊天不断自动生成和更新对聊天记录摘要

import { ChatOpenAI } from "@langchain/openai";
import { ConversationSummaryMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import "dotenv/config";

const memory = new ConversationSummaryMemory({
  memoryKey: "summary",
  llm: new ChatOpenAI({
    configuration: {
      baseURL: "https://api.chatanywhere.tech/v1/",
    },
    verbose: true,
  }),
});

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const prompt = PromptTemplate.fromTemplate(`
你是一个乐于助人的助手。尽你所能回答所有问题。

这是聊天记录的摘要:
{summary}
Human: {input}
AI:`);
const chain = new ConversationChain({
  llm: model,
  prompt,
  memory,
  verbose: true,
});

const res = await chain.call({ input: "我是小明" });
console.log(res);
const res1 = await chain.call({ input: "我叫什么？" });
console.log(res1);

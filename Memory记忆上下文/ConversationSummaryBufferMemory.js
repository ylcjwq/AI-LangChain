// ConversationSummaryBufferMemory 根据 token 数量，如果上下文历史过大时就切换到 summary，如果上下文比较小时就使用原始的聊天记录

import { ChatOpenAI } from "@langchain/openai";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import "dotenv/config";

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const memory = new ConversationSummaryBufferMemory({
  llm: new ChatOpenAI({
    configuration: {
      baseURL: "https://api.chatanywhere.tech/v1/",
    },
  }),
  maxTokenLimit: 200, // 若token数超过该值，则总结为summary
});

const chain = new ConversationChain({
  llm: model,
  memory: memory,
  verbose: true,
});

const res = await chain.call({ input: "我是小明" });
console.log(res);
const res1 = await chain.call({ input: "我叫什么？" });
console.log(res1);

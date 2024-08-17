// EntityMemory 在聊天中去生成和更新不同的实体的描述。

import { ChatOpenAI } from "@langchain/openai";
import {
  EntityMemory,
  ENTITY_MEMORY_CONVERSATION_TEMPLATE,
} from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import "dotenv/config";

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const memory = new EntityMemory({
  llm: new ChatOpenAI({
    configuration: {
      baseURL: "https://api.chatanywhere.tech/v1/",
    },
    verbose: true,
  }),
  chatHistoryKey: "history",
  entitiesKey: "entities",
});
const chain = new ConversationChain({
  llm: model,
  prompt: ENTITY_MEMORY_CONVERSATION_TEMPLATE,
  memory: memory,
  verbose: true,
});

const res1 = await chain.call({ input: "我叫小明，今年 18 岁" });
const res2 = await chain.call({
  input: "ABC 是一家互联网公司，主要是售卖方便面的公司",
});
// const res3 = await chain.call({ input: "介绍小明" });
const res3 = await chain.call({ input: "介绍小明和 ABC" });
// console.log(res3);
const test = await memory.loadMemoryVariables({
  input: "介绍小明和 ABC",
});

console.log(test);

import { JSONChatHistory } from "../JSONChatHistory/index.js";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import "dotenv/config";

const history = new JSONChatHistory({
  dir: "chat_data",
  sessionId: "test",
});

await history.addMessages([
  new HumanMessage("Hi, 我叫小明"),
  new AIMessage("你好"),
]);

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const memory = new BufferMemory({
  chatHistory: history,
});
const chain = new ConversationChain({ llm: chatModel, memory: memory });
const res = await chain.call({ input: "我叫什么？" });
console.log(res);

const messages = await history.getMessages();
console.log(messages);

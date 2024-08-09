import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import "dotenv/config";

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
  maxRetries: 0,
});

const realLLM = new ChatOpenAI();

// StringOutputParser 来处理输出，将 OpenAI 返回的复杂对象提取出最核心的字符串
const outputPrase = new StringOutputParser();
const simpleChain = chatModel.pipe(outputPrase);

const llmWithFallback = simpleChain.withFallbacks({
  fallbacks: [realLLM],
});

const stream = await llmWithFallback.stream([new HumanMessage("讲一个笑话")]);

for await (const chunk of stream) {
  console.log(chunk);
}

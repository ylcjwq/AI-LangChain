// StringOutputParser 获取回答中的文本内容

import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import "dotenv/config";

const parser = new StringOutputParser();
const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

const chain = model.pipe(parser);

const res = await chain.invoke([new HumanMessage("Tell me a joke")]);

console.log(res);

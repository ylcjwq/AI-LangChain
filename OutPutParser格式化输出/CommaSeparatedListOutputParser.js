// CommaSeparatedListOutputParser 输出一个数组，逐个列举

import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

const parser = new CommaSeparatedListOutputParser();

console.log(parser.getFormatInstructions());

const prompt = PromptTemplate.fromTemplate(
  "列出3个 {country} 的著名的互联网公司.\n{instructions}"
);

const chain = prompt.pipe(model).pipe(parser);

const res = await chain.invoke({
  country: "中国",
  instructions: parser.getFormatInstructions(),
});

console.log(res);

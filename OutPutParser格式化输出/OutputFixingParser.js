// OutputFixingParser 自动修复的 parser。
// 只能修复类型，并不能保证内容的准确性，一般只对部分回答使用修复，修复对模型要求不高，可以回答用较贵的模型，修复用较便宜的。

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { OutputFixingParser } from "langchain/output_parsers";
import "dotenv/config";
import { z } from "zod";

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

const schema = z.object({
  answer: z.string().describe("用户问题的答案"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("问题答案的可信度评分，满分 100"),
});

const parser = StructuredOutputParser.fromZodSchema(schema);
const prompt = PromptTemplate.fromTemplate(
  "尽可能的回答用的问题 \n{instructions} \n{question}"
);

const chain = prompt.pipe(model).pipe(parser);
const res = await chain.invoke({
  question: "蒙娜丽莎的作者是谁？是什么时候绘制的",
  instructions: parser.getFormatInstructions(),
});

console.log(res);

const wrongOutput = {
  answer:
    "蒙娜丽莎的作者是达芬奇，大约在16世纪初期（1503年至1506年之间）开始绘制。",
  sources: "90%",
};

const fixParser = OutputFixingParser.fromLLM(model, parser);
const output = await fixParser.parse(JSON.stringify(wrongOutput));

console.log(output);

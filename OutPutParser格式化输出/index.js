import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  StringOutputParser,
  StructuredOutputParser,
  CommaSeparatedListOutputParser,
} from "@langchain/core/output_parsers";
import { OutputFixingParser } from "langchain/output_parsers";
import "dotenv/config";
import { z } from "zod";

//todo 1. StringOutputParser 获取回答中的文本内容

const parser = new StringOutputParser();
const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

// const chain = model.pipe(parser);

// const res = await chain.invoke([new HumanMessage("Tell me a joke")]);

// console.log(res);

//todo 2. StructuredOutputParser 引导模型以你需要的格式进行输出

const parser1 = StructuredOutputParser.fromNamesAndDescriptions({
  answer: "用户问题的答案",
  evidence: "你回答用户问题所依据的答案",
  confidence: "问题答案的可信度评分，格式是百分数",
});

// console.log(parser1.getFormatInstructions());

// const prompt = PromptTemplate.fromTemplate(
//   "尽可能的回答问题 \n{instructions}\n{question}"
// );

// const chain = prompt.pipe(model).pipe(parser1);

// const res = await chain.invoke({
//   question: "在葡萄糖转换为丙酮酸的过程中，有哪几个关键酶，列举出来",
//   instructions: parser1.getFormatInstructions(),
// });

// console.log(res);

//todo 3. CommaSeparatedListOutputParser 输出一个数组，逐个列举

const parser2 = new CommaSeparatedListOutputParser();

// console.log(parser2.getFormatInstructions());

// const prompt = PromptTemplate.fromTemplate(
//   "列出3个 {country} 的著名的互联网公司.\n{instructions}"
// );

// const chain = prompt.pipe(model).pipe(parser);

// const res = await chain.invoke({
//   country: "中国",
//   instructions: parser2.getFormatInstructions(),
// });

// console.log(res);

//todo 4. OutputFixingParser 自动修复的 parser。
// 只能修复类型，并不能保证内容的准确性，一般只对部分回答使用修复，修复对模型要求不高，可以回答用较贵的模型，修复用较便宜的。

const schema = z.object({
  answer: z.string().describe("用户问题的答案"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("问题答案的可信度评分，满分 100"),
});

const parser3 = StructuredOutputParser.fromZodSchema(schema);
const prompt = PromptTemplate.fromTemplate(
  "尽可能的回答用的问题 \n{instructions} \n{question}"
);

const chain = prompt.pipe(model).pipe(parser3);
const res = await chain.invoke({
  question: "蒙娜丽莎的作者是谁？是什么时候绘制的",
  instructions: parser3.getFormatInstructions(),
});

console.log(res);

const wrongOutput = {
  answer:
    "蒙娜丽莎的作者是达芬奇，大约在16世纪初期（1503年至1506年之间）开始绘制。",
  sources: "90%",
};

const fixParser = OutputFixingParser.fromLLM(model, parser3);
const output = await fixParser.parse(JSON.stringify(wrongOutput));

console.log(output);

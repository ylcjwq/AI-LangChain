// StructuredOutputParser 引导模型以你需要的格式进行输出
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  answer: "用户问题的答案",
  evidence: "你回答用户问题所依据的答案",
  confidence: "问题答案的可信度评分，格式是百分数",
});

console.log(parser.getFormatInstructions());

const prompt = PromptTemplate.fromTemplate(
  "尽可能的回答问题 \n{instructions}\n{question}"
);

const chain = prompt.pipe(model).pipe(parser);

const res = await chain.invoke({
  question: "在葡萄糖转换为丙酮酸的过程中，有哪几个关键酶，列举出来",
  instructions: parser.getFormatInstructions(),
});

console.log(res);

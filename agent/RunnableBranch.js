import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";
import {
  RunnableSequence,
  RunnableBranch,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import "dotenv/config";

const classifySchema = z.object({
  type: z.enum(["科普", "编程", "一般问题"]).describe("用户提问的分类"),
});

const model = new ChatOpenAI({
  temperature: 0,
});

const modelWithTools = model.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "classifyQuestion",
        description: "对用户的提问进行分类",
        parameters: zodToJsonSchema(classifySchema),
      },
    },
  ],
  tool_choice: {
    type: "function",
    function: {
      name: "classifyQuestion",
    },
  },
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `仔细思考，你有充足的时间进行严谨的思考，然后对用户的问题进行分类，
    当你无法分类到特定分类时，可以分类到 "一般问题"`,
  ],
  ["human", "{input}"],
]);

const classifyChain = RunnableSequence.from([
  prompt,
  modelWithTools,
  new JsonOutputToolsParser(),
  (input) => {
    const type = input[0]?.args?.type;
    return type ? type : "一般问题";
  },
]);

const res = await classifyChain.invoke({
  input: "鲸鱼是哺乳动物么？",
});
console.log(res);

const answeringModel = new ChatOpenAI({
  temperature: 0.7,
});

const sciencePrompt = PromptTemplate.fromTemplate(
  `作为一位科普专家，你需要解答以下问题，尽可能提供详细、准确和易于理解的答案：

问题：{input}
答案：`
);

const programmingPrompt = PromptTemplate.fromTemplate(
  `作为一位编程专家，你需要解答以下编程相关的问题，尽可能提供详细、准确和实用的答案：

问题：{input}
答案：`
);

const generalPrompt = PromptTemplate.fromTemplate(
  `请回答以下一般性问题，尽可能提供全面和有深度的答案：

问题：{input}
答案：`
);

const scienceChain = RunnableSequence.from([
  sciencePrompt,
  answeringModel,
  new StringOutputParser(),
  {
    output: (input) => input,
    role: () => "科普专家",
  },
]);

const programmingChain = RunnableSequence.from([
  programmingPrompt,
  answeringModel,
  new StringOutputParser(),
  {
    output: (input) => input,
    role: () => "编程大师",
  },
]);

const generalChain = RunnableSequence.from([
  generalPrompt,
  answeringModel,
  new StringOutputParser(),
  {
    output: (input) => input,
    role: () => "通识专家",
  },
]);

const branch = RunnableBranch.from([
  [(input) => input.type.includes("科普"), scienceChain],
  [(input) => input.type.includes("编程"), programmingChain],
  generalChain,
]);

const outputTemplate = PromptTemplate.fromTemplate(
  `感谢您的提问，这是来自 {role} 的专业回答：
    
    {output}
    `
);

const finalChain = RunnableSequence.from([
  {
    type: classifyChain,
    input: (input) => input.input,
  },
  branch,
  (input) => outputTemplate.format(input),
]);
const res1 = await finalChain.invoke({
  input: "鲸鱼是哺乳动物么？",
});

console.log(res1);

const route = ({ type }) => {
  if (type.includes("科普")) {
    return scienceChain;
  } else if (type.includes("编程")) {
    return programmingChain;
  }

  return generalChain;
};
const finalChain2 = RunnableSequence.from([
  {
    type: classifyChain,
    input: (input) => input.input,
  },
  route,
  (input) => outputTemplate.format(input),
]);
const res3 = await finalChain2.invoke({
  input: "鲸鱼是哺乳动物么？",
});
console.log(res3);

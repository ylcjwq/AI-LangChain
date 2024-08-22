import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";
import "dotenv/config";

const taggingSchema = z.object({
  emotion: z.enum(["pos", "neg", "neutral"]).describe("文本的情感"),
  language: z.string().describe("文本的核心语言（应为ISO 639-1代码）"),
});

const model = new ChatOpenAI({
  temperature: 0,
});

const modelTagging = model.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "tagging",
        description: "为特定的文本片段打上标签",
        parameters: zodToJsonSchema(taggingSchema),
      },
    },
  ],
  tool_choice: {
    type: "function",
    function: {
      name: "tagging",
    },
  },
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "仔细思考，你有充足的时间进行严谨的思考，然后按照指示对文本进行标记",
  ],
  ["human", "{input}"],
]);

const chain = prompt.pipe(modelTagging).pipe(new JsonOutputToolsParser());

const res = await chain.invoke({
  input: "hello world",
});
console.log(res);

const res2 = await chain.invoke({
  input: "写代码太难了，👴 不干了",
});
console.log(res2);

const res3 = await chain.invoke({
  // 日语，圣诞快乐
  input: "メリークリスマス!",
});
console.log(res3);

const res4 = await chain.invoke({
  input: "我非常喜欢 AI，特别是 LLM，因为它非常 powerful",
});
console.log(res4);

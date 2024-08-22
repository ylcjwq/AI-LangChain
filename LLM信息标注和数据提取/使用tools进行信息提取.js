import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";
import "dotenv/config";

const personExtractionSchema = z
  .object({
    name: z.string().describe("人的名字"),
    age: z.number().optional().describe("人的年龄"),
  })
  .describe("提取关于一个人的信息");

const relationExtractSchema = z.object({
  people: z.array(personExtractionSchema).describe("提取所有人"),
  relation: z.string().describe("人之间的关系, 尽量简洁"),
});
const schema = zodToJsonSchema(relationExtractSchema);
console.log(schema);
console.log(schema.properties.people);
const model = new ChatOpenAI({
  temperature: 0,
});

const modelExtract = model.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "relationExtract",
        description: "提取数据中人的信息和人的关系",
        parameters: zodToJsonSchema(relationExtractSchema),
      },
    },
  ],
  tool_choice: {
    type: "function",
    function: {
      name: "relationExtract",
    },
  },
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "仔细思考，你有充足的时间进行严谨的思考，然后提取文中的相关信息，如果没有明确提供，请不要猜测，可以仅提取部分信息",
  ],
  ["human", "{input}"],
]);

const chain = prompt.pipe(modelExtract).pipe(new JsonOutputToolsParser());

const res = await chain.invoke({
  input: "小明现在 18 岁了，她妈妈是小丽",
});
console.log(res);

const res2 = await chain.invoke({
  input: "我是小明现在 18 岁了，我和小 A、小 B 是好朋友，都一样大",
});
console.log(res2);

const res3 = await chain.invoke({
  input: "我是小明",
});
console.log(res3);

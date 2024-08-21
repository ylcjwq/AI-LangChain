import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";

const getCurrentWeatherSchema = z.object({
  location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  unit: z.enum(["celsius", "fahrenheit"]).describe("The unit of temperature"),
});
const paramSchema = zodToJsonSchema(getCurrentWeatherSchema);
const model = new ChatOpenAI({
  temperature: 0,
});

const modelWithTools = model.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: paramSchema,
      },
    },
  ],
});

const res = await modelWithTools.invoke("北京的天气怎么样");
console.log(res);

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["human", "{input}"],
]);

const chain = prompt.pipe(modelWithTools);
const res1 = await chain.invoke({
  input: "北京的天气怎么样",
});
console.log(res1);

const getCurrentTimeSchema = z.object({
  format: z
    .enum(["iso", "locale", "string"])
    .optional()
    .describe("The format of the time, e.g. iso, locale, string"),
});

zodToJsonSchema(getCurrentTimeSchema);

const modelWithMultiTools = model.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: zodToJsonSchema(getCurrentWeatherSchema),
      },
    },
    {
      type: "function",
      function: {
        name: "getCurrentTime",
        description: "Get the current time in a given format",
        parameters: zodToJsonSchema(getCurrentTimeSchema),
      },
    },
  ],
});

const res2 = await modelWithMultiTools.invoke("现在几点了？");
const res3 = await modelWithMultiTools.invoke("现在 iso 格式的时间是什么？");
console.log(res2);
console.log(res3);

const modelWithForce = model.bind({
  tools: [
    {
      type: "function",
      function: {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: zodToJsonSchema(getCurrentWeatherSchema),
      },
    },
    {
      type: "function",
      function: {
        name: "getCurrentTime",
        description: "Get the current time in a given format",
        parameters: zodToJsonSchema(getCurrentTimeSchema),
      },
    },
  ],
  tool_choice: {
    type: "function",
    function: {
      name: "getCurrentWeather",
    },
  },
});

const res4 = await modelWithForce.invoke("现在几点了？");
console.log(res4);

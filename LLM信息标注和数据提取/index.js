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

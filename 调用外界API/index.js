import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI();

function getCurrentWeather({ location, unit = "fahrenheit" }) {
  const weather_info = {
    location: location,
    temperature: "72",
    unit: unit,
    forecast: ["sunny", "windy"],
  };
  return JSON.stringify(weather_info);
}

function getCurrentTime({ format = "iso" } = {}) {
  let currentTime;
  switch (format) {
    case "iso":
      currentTime = new Date().toISOString();
      break;
    case "locale":
      currentTime = new Date().toLocaleString();
      break;
    default:
      currentTime = new Date().toString();
      break;
  }
  return currentTime;
}

const tools = [
  {
    type: "function", // 必须指定，只支持'function'
    function: {
      name: "getCurrentWeather", // 函数名, 需要跟函数的名称一致,
      description: "Get the current weather in a given location", // 函数的描述, 可以理解成对 LLM 决定什么是否调用该函数的唯一信息
      parameters: {
        // 函数的参数
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"], // 通过 key 告知 LLM 该参数是必须的
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCurrentTime",
      description: "Get the current time in a given format",
      parameters: {
        type: "object",
        properties: {
          format: {
            type: "string",
            enum: ["iso", "locale", "string"],
            description: "The format of the time, e.g. iso, locale, string",
          },
        },
        required: ["format"],
      },
    },
  },
];

const messages = [
  {
    role: "user",
    content: "北京的天气怎么样",
  },
];

const result = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages,
  tools,
  tool_choice: "auto", // 是否使用函数  auto - 让 LLM 自己决定 none - 禁止使用
});
console.dir(result.choices[0], { depth: null, colors: true });

// 传入函数调用
messages.push(result.choices[0].message);

const functions = {
  getCurrentWeather: getCurrentWeather,
};

const cell = result.choices[0].message.tool_calls[0];
const functionInfo = cell.function;
const functionName = functionInfo.name;
const functionParams = functionInfo.arguments;

const functionResult = functions[functionName](functionParams);

console.log(functionResult);
// 传入函数调用的结果
messages.push({
  tool_call_id: cell.id,
  role: "tool",
  name: functionName,
  content: functionResult,
});
console.log(messages);

// 整个对话再次传入大模型，得到当前天气的回答
const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages,
});
console.log(response.choices[0].message);

// 多函数并发，效果并不好，不建议
const messages1 = [
  {
    role: "user",
    content: "请同时告诉我当前的时间, 和北京的天气",
  },
];

const result1 = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: messages1,
  tools,
});

console.dir(result1.choices[0], { depth: null, colors: true });

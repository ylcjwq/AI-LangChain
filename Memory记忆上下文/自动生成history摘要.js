import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import {
  RunnableWithMessageHistory,
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getBufferString } from "@langchain/core/messages";
import "dotenv/config";

const summaryModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const summaryPrompt = ChatPromptTemplate.fromTemplate(`
逐步总结所提供的对话内容，并在之前的摘要基础上添加，返回一个新的摘要。

当前摘要：
{summary}

新的对话内容:
{new_lines}

新的摘要:
`);

const summaryChain = RunnableSequence.from([
  summaryPrompt,
  summaryModel,
  new StringOutputParser(),
]);

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你是一个乐于助人的助手。尽你所能回答所有问题。

    这是聊天记录摘要:
    {history_summary}
    `,
  ],
  ["human", "{input}"],
]);
let summary = "";

const history = new ChatMessageHistory();

const chatChain = RunnableSequence.from([
  {
    input: new RunnablePassthrough({
      func: (input) => history.addUserMessage(input),
    }),
  },
  RunnablePassthrough.assign({
    history_summary: () => summary,
  }),
  chatPrompt,
  chatModel,
  new StringOutputParser(),
  new RunnablePassthrough({
    func: async (input) => {
      console.log("AI回答：", input);
      history.addAIMessage(input);
      const messages = await history.getMessages();
      const new_lines = getBufferString(messages);
      const newSummary = await summaryChain.invoke({
        summary,
        new_lines,
      });
      history.clear();
      summary = newSummary;
    },
  }),
]);

await chatChain.invoke("我现在饿了");

console.log(summary);

await chatChain.invoke("我今天想吃方便面");

console.log(summary);

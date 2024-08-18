import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";
import path from "path";
import { JSONChatHistory } from "../JSONChatHistory/index.js";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableWithMessageHistory,
  Runnable,
} from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { fileURLToPath } from "url";

process.env.LANGCHAIN_VERBOSE = "true";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadVectorStore() {
  const directory = path.join(__dirname, "../db/qiuzhuangshandian");
  const embeddings = new OpenAIEmbeddings({
    configuration: {
      baseURL: "https://api.chatanywhere.tech/v1/",
    },
  });
  const vectorStore = await FaissStore.load(directory, embeddings);
  return vectorStore;
}

async function getRephraseChain() {
  const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "给定以下对话和一个后续问题，请将后续问题重述为一个独立的问题。请注意，重述的问题应该包含足够的信息，使得没有看过对话历史的人也能理解，并且重述的问题应该是一个问句，而不是回答这个问题。",
    ],
    new MessagesPlaceholder("history"),
    ["human", "将以下问题重述为一个独立的问题：\n{question}"],
  ]);

  const rephraseChain = RunnableSequence.from([
    rephraseChainPrompt,
    new ChatOpenAI({
      configuration: {
        baseURL: "https://api.chatanywhere.tech/v1/",
      },
      temperature: 0.4,
    }),
    new StringOutputParser(),
  ]);

  return rephraseChain;
}

// const historyMessages = [
//   new HumanMessage("你好，我叫小明"),
//   new AIMessage("你好小明"),
// ];

// const question = "你觉得我的名字怎么样？";
// const rephraseChain = await getRephraseChain();
// const standaloneQuestion = await rephraseChain.invoke({
//   history: historyMessages,
//   question,
// });
// console.log(standaloneQuestion);

export async function getRagChain() {
  const vectorStore = await loadVectorStore();
  const retriever = vectorStore.asRetriever(2);

  const convertDocsToString = (documents) => {
    return documents.map((document) => document.pageContent).join("\n");
  };
  const contextRetrieverChain = RunnableSequence.from([
    (input) => input.standalone_question,
    retriever,
    convertDocsToString,
  ]);

  const SYSTEM_TEMPLATE = `
      你是一个熟读刘慈欣的《球状闪电》的终极原着党，精通根据作品原文详细解释和回答问题，你在回答时会引用作品原文。
      并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

      以下是原文中跟用户回答相关的内容：
      {context}
    `;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    new MessagesPlaceholder("history"),
    ["human", "现在，你需要基于原文，回答以下问题：\n{standalone_question}`"],
  ]);
  const model = new ChatOpenAI({
    configuration: {
      baseURL: "https://api.chatanywhere.tech/v1/",
    },
  });
  const rephraseChain = await getRephraseChain();

  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      standalone_question: rephraseChain,
    }),
    RunnablePassthrough.assign({
      context: contextRetrieverChain,
    }),
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const chatHistoryDir = path.join(__dirname, "../chat_data");

  const ragChainWithHistory = new RunnableWithMessageHistory({
    runnable: ragChain,
    getMessageHistory: (sessionId) =>
      new JSONChatHistory({ sessionId, dir: chatHistoryDir }),
    historyMessagesKey: "history",
    inputMessagesKey: "question",
  });

  return ragChainWithHistory;
}

async function run() {
  const ragChain = await getRagChain();

  const res = await ragChain.invoke(
    {
      // question: "什么是球状闪电？",
      question: "这个现象在文中有什么故事",
    },
    {
      configurable: { sessionId: "test-history" },
    }
  );

  console.log(res);
}

// run();

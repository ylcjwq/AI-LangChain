import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import "dotenv/config";

// 加载文本数据
const loader = new TextLoader("data/球状闪电.txt");
const docs = await loader.load();

// 分割文本
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});
const splitDocs = await splitter.splitDocuments(docs);

// 构建embeddings对象
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

//? 将文档转为向量，并持久化到Faiss向量数据库
// const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
// const directory = "db/qiuzhuangshandian";
// await vectorStore.save(directory);

// 使用向量数据库
const directory = "db/qiuzhuangshandian";
const vectorstore = await FaissStore.load(directory, embeddings);
const retriever = vectorstore.asRetriever(2);

// 将Document处理为普通文本
const convertDocsToString = (documents) => {
  return documents.map((document) => document.pageContent).join("\n");
};
// 获取向量数据库中相关上下文的 chain
// 接收一个 input 对象作为输入，然后从中获得 question 属性，然后传递给 retriever，返回的 Document 对象输入作为参数传递给 convertDocsToString 然后被转换成纯文本。
const contextRetriverChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  convertDocsToString,
]);

// 构建prompt
const TEMPLATE = `
你是一个熟读刘慈欣的《球状闪电》的终极原著党，精通根据作品原文详细解释和回答问题，你在回答时会引用作品原文。
并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

以下是原文中跟用户回答相关的内容：
{context}

现在，你需要基于原文，回答以下问题：
{question}`;
const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);

// 构建模型对象
const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

// 基于向量数据库中获取的原文内容和prompt进行回答，并提取为纯文本
const ragChain = RunnableSequence.from([
  {
    context: contextRetriverChain,
    question: (input) => input.question,
  },
  prompt,
  model,
  new StringOutputParser(),
]);

const answer = await ragChain.invoke({
  question: "什么是球状闪电",
});
console.log(answer);

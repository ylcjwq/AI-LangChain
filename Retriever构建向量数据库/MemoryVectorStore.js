// MemoryVectorStore 存储向量和原始文档

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";

const loader = new TextLoader("data/孔乙己.txt");
const docs = await loader.load();
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 20,
});
// 切分文档
const splitDocs = await splitter.splitDocuments(docs);
// 构建VectorStore
const vectorstore = new MemoryVectorStore(embeddings);
// 添加文档
await vectorstore.addDocuments(splitDocs);
// 取出最相似的两项
const retriever = vectorstore.asRetriever(2);
// 提取文档
const res = await retriever.invoke("茴香豆是做什么用的");

console.log(res);

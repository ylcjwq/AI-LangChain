// 使用faiss持久化的向量数据

import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import "dotenv/config";

const directory = "db/kongyiji";
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const vectorstore = await FaissStore.load(directory, embeddings);

const retriever = vectorstore.asRetriever(2);
const res = await retriever.invoke("茴香豆是做什么用的");

console.log(res);

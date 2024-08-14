// MultiQueryRetriever 将用户的输入改写成多个不同写法，从不同的角度来表达同一个意思，来克服因为关键词或者细微措词导致检索效果差的问题。

import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import "dotenv/config";

const directory = "db/kongyiji";
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const vectorstore = await FaissStore.load(directory, embeddings);
const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const retriever = MultiQueryRetriever.fromLLM({
  llm: model, // 传入的 llm 模型
  retriever: vectorstore.asRetriever(3), // 每次会在向量数据库中检索三条数据
  queryCount: 3, // 改写生成三条不同写法和措词
  verbose: true, // 打印出 chain 内部的详细执行过程
});

const res = await retriever.invoke("茴香豆是做什么用的");

console.log(res);

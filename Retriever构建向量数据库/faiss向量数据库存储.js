// FaissStore 把 embedding 的结果持久化

import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import "dotenv/config";

const loader = new TextLoader("data/孔乙己.txt");
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 20,
});
const splitDocs = await splitter.splitDocuments(docs);

const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});

// 将文档转为向量，并持久化到Faiss向量数据库
const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
const directory = "db/kongyiji";
await vectorStore.save(directory);

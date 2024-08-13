// OpenAIEmbeddings 将Document的pageContent转为向量

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

const splitDocs = await splitter.splitDocuments(docs);

console.log(splitDocs[0]);

// 转为向量数组
const res = await embeddings.embedQuery(splitDocs[0].pageContent);
console.log(res);

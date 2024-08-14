// ContextualCompressionRetriever

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import "dotenv/config";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";

process.env.LANGCHAIN_VERBOSE = "true";

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
// 创建一个用与压缩的chain
const compressor = LLMChainExtractor.fromLLM(model);

// 创建对上下文进行压缩的 Retriever
const retriever = new ContextualCompressionRetriever({
  baseCompressor: compressor,
  baseRetriever: vectorstore.asRetriever(2),
});

const res = await retriever.invoke("茴香豆是做什么用的");
console.log(res);

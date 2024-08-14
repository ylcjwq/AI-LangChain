// ScoreThresholdRetriever 通过算法计算应该返回参考文档数量，而不是粗暴的写死

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

process.env.LANGCHAIN_VERBOSE = "true";

const directory = "db/kongyiji";
const embeddings = new OpenAIEmbeddings({
  configuration: {
    baseURL: "https://api.chatanywhere.tech/v1/",
  },
});
const vectorstore = await FaissStore.load(directory, embeddings);

const retriever = ScoreThresholdRetriever.fromVectorStore(vectorstore, {
  minSimilarityScore: 0.4, // 最小的相似度阈值
  maxK: 5, // 最多返回多少条数据
  kIncrement: 1, // 算法的布厂
});
const res = await retriever.invoke("茴香豆是做什么用的");
console.log(res);

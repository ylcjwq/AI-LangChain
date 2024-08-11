// SerpAPILoader 提供接入搜索的能力 需要SerpAPI

import { SerpAPILoader } from "@langchain/community/document_loaders/web/serpapi";
import "dotenv/config";

const apiKey = process.env.SERPAPI_API_KEY;
const question = "什么 github copliot";
const loader = new SerpAPILoader({ q: question, apiKey });
const docs = await loader.load();

console.log(docs);

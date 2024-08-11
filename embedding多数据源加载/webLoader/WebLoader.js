// webLoader 提取网页中静态的信息

import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader(
  "https://kaiyi.cool/blog/github-copilot"
);

const docs = await loader.load();

console.log(docs);

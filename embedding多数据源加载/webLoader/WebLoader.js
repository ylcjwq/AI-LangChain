// webLoader 提取网页中静态的信息

import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader(
  "https://kaiyi.cool/blog/github-copilot"
);

const docs = await loader.load();

// 可以对html元素进行过滤
const loader1 = new CheerioWebBaseLoader(
  "https://kaiyi.cool/blog/github-copilot",
  {
    selector: "h3",
  }
);

const docs1 = await loader1.load();
console.log(docs1[0].pageContent);

console.log(docs, docs1);

// Github loader 基于某个开源项目构建数据库

//! fetch请求报错 pageContent无法获取数据

import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import ignore from "ignore";
import "dotenv/config";

const loader = new GithubRepoLoader(
  "https://github.com/ylcjwq/resume-template",
  {
    branch: "master",
    recursive: false,
    unknown: "warn",
    ignorePaths: ["*.md", "yarn.lock", "*.json"],
    accessToken: process.env.GITHUB_TOKEN,
  }
);
const docs = await loader.load();

console.log(docs);

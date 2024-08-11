import { Document } from "langchain/document";

/**
 * pageContent 文本内容，即文档对象对应的文本数据
 * metadata 元数据，文本数据对应的元数据，例如 原始文档的标题、页数等信息，可以用于后面 Retriver 基于此进行筛选。
 *
 * document 一般由loader自动构建，无需手动构建
 */
const test = new Document({
  pageContent: "test text",
  metadata: { source: "ABC Title" },
});

console.log(test);

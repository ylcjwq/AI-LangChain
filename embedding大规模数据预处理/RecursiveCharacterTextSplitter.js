// RecursiveCharacterTextSplitter 是最常用的切分工具，他根据内置的一些字符对原始文本进行递归的切分，来保持相关的文本片段相邻，保持切分结果内部的语意相关性。

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("data/孔乙己.txt");
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 64, // 切分块的文本大小
  chunkOverlap: 0, // 重叠部分大小
});

const splitDocs = await splitter.splitDocuments(docs);

console.log(splitDocs);

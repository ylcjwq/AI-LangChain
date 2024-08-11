// DirectoryLoader 加载一个文件夹下多种格式的文件
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new DirectoryLoader("./data", {
  ".pdf": (path) => new PDFLoader(path, { splitPages: false }),
  ".txt": (path) => new TextLoader(path),
});

const docs = await loader.load();

console.log(docs);

// TextLoader 对文件所在的路径进行加载
import { TextLoader } from "langchain/document_loaders/fs/text";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const loader = new TextLoader("data/球状闪电.txt");
const docs = await loader.load();
console.log(docs);

// PDFLoader 上传任意 pdf 作为外挂数据库，来让聊天内容和背景知识聚焦在某个 pdf 中。
import * as pdfParse from "pdf-parse";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// PDFLoader 默认会将pdf按页划分输出一个Document数组，splitPages设置为false可以让PDFLoader不分割
const loader = new PDFLoader("data/github-copliot.pdf", { splitPages: false });
const pdfs = await loader.load();

console.log(pdfs);

import {
  PromptTemplate,
  PipelinePromptTemplate,
} from "@langchain/core/prompts";

const getCurrentDateStr = () => {
  return new Date().toLocaleDateString();
};

const fullPrompt = PromptTemplate.fromTemplate(`
  你是一个智能管家，今天是 {date}，你的主人的信息是{info}, 
  根据上下文，完成主人的需求
  {task}`);

const datePrompt = PromptTemplate.fromTemplate("{date}，现在是 {period}");
const periodPrompt = await datePrompt.partial({
  date: getCurrentDateStr,
});

const infoPrompt = PromptTemplate.fromTemplate(
  "姓名是 {name}, 性别是 {gender}"
);

const taskPrompt = PromptTemplate.fromTemplate(`
  我想吃 {period} 的 {food}。 
  再重复一遍我的信息 {info}`);

const composedPrompt = new PipelinePromptTemplate({
  pipelinePrompts: [
    {
      name: "date",
      prompt: periodPrompt,
    },
    {
      name: "info",
      prompt: infoPrompt,
    },
    {
      name: "task",
      prompt: taskPrompt,
    },
  ],
  finalPrompt: fullPrompt,
});

const formattedPrompt = await composedPrompt.format({
  period: "早上",
  name: "张三",
  gender: "男",
  food: "烤面包",
});

console.log(formattedPrompt);

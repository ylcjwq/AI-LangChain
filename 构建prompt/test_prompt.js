import {
  PromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "@langchain/core/prompts";

const multiVariableGreetingPrompt = new PromptTemplate({
  inputVariables: ["timeOfDay", "name"],
  template: "good {timeOfDay}, {name} {{test}}",
});
const formattedMultiVariableGreeting = await multiVariableGreetingPrompt.format(
  {
    timeOfDay: "morning",
    name: "Kai",
  }
);

console.log(formattedMultiVariableGreeting);

const autoInferTemplate = PromptTemplate.fromTemplate(
  "good {timeOfDay}, {name}"
);
console.log(autoInferTemplate.inputVariables);
// ['timeOfDay', 'name']

const formattedAutoInferTemplate = await autoInferTemplate.format({
  timeOfDay: "morning",
  name: "Kai",
});
console.log(formattedAutoInferTemplate);

const initialPrompt = new PromptTemplate({
  template: "这是一个{type}，它是{item}。",
  inputVariables: ["type", "item"],
});

const partialedPrompt = await initialPrompt.partial({
  type: "工具",
});

const formattedPrompt = await partialedPrompt.format({
  item: "锤子",
});

console.log(formattedPrompt);
// 这是一个工具，它是锤子。

const formattedPrompt2 = await partialedPrompt.format({
  item: "改锥",
});

console.log(formattedPrompt2);

const translateInstructionTemplate = SystemMessagePromptTemplate.fromTemplate(
  `你是一个专业的翻译员，你的任务是将文本从{source_lang}翻译成{target_lang}。`
);
const userQuestionTemplate =
  HumanMessagePromptTemplate.fromTemplate("请翻译这句话：{text}");
const chatPrompt = ChatPromptTemplate.fromMessages([
  translateInstructionTemplate,
  userQuestionTemplate,
]);
const formattedChatPrompt = await chatPrompt.formatMessages({
  source_lang: "中文",
  target_lang: "英文",
  text: "你好，世界",
});

console.log(formattedChatPrompt);

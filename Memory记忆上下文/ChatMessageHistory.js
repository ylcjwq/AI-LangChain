// ChatMessageHistory  history对象存储聊天记录

import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// 创建一个 history 对象
const history = new ChatMessageHistory();

// 向history中添加信息
await history.addMessage(new HumanMessage("hi"));
await history.addMessage(new AIMessage("What can I do for you?"));

// 查看历史消息
const messages = await history.getMessages();
console.log(messages);

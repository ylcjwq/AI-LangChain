import { ChatOpenAI } from "@langchain/openai";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import "dotenv/config";
import { AgentExecutor } from "langchain/agents";
import { pull } from "langchain/hub";
import { createOpenAIToolsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Calculator } from "@langchain/community/tools/calculator";

process.env.LANGCHAIN_TRACING_V2 = "true";

async function main() {
  const tools = [new SerpAPI(process.env.SERPAPI_API_KEY), new Calculator()];

  try {
    const prompt = await pull("hwchase17/openai-tools-agent");
    console.log("Prompt loaded:", prompt); // 调试输出

    const llm = new ChatOpenAI({
      temperature: 0,
    });
    const agent = await createOpenAIToolsAgent({
      llm,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    const result = await agentExecutor.invoke({
      input:
        "我有 10000 人民币，可以购买多少股微软股票，注意微软股票一般是以美元计价，需要考虑汇率问题",
    });

    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();

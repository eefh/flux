import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions, ZapierToolKit, OpenApiToolkit } from "langchain/agents";
import { SerpAPI, Calculator, ChainTool, ZapierNLAWrapper, JsonSpec, JsonObject, RequestsGetTool, RequestsPostTool, AIPluginTool } from "langchain/tools";
import { CallbackManager } from "langchain/callbacks";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema";
import { initializeQATool } from './agent/vectorDB.js';
import { WebBrowser } from "langchain/tools/webbrowser";

require('dotenv').config();

export const run = async (message, messages, event, database, zapierKey) => {

  const model = new ChatOpenAI({ temperature: 0.4, modelName: 'gpt-3.5-turbo' });
  const callbackManager = CallbackManager.fromHandlers({
    async handleAgentAction(action) {
      console.log("handleAgentAction", action);
      event.sender.send('agentAction', action);
    }
  });

  console.log(`Database?: ${database ? `True` : `False`}`);
  const qaTool = await initializeQATool(database); 
  const tools = [
    new SerpAPI(),
    qaTool,
    /*new WebBrowser({ model, embeddings }),
    new RequestsGetTool(),
    new RequestsPostTool(),
    await AIPluginTool.fromPluginUrl(
      "https://www.klarna.com/.well-known/ai-plugin.json"
    )*/
  ];
  if (zapierKey) {
    const zapier = new ZapierNLAWrapper({ apiKey: zapierKey });
    const toolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier);
    tools.push(...toolkit.tools);
  }
    
  const executor = await initializeAgentExecutorWithOptions(
    tools,
    model,
    {
        agentType: "chat-conversational-react-description",
        verbose: true,
        callbackManager: callbackManager
    }
  );

  executor.memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
    chatHistory: new ChatMessageHistory([new SystemChatMessage('You are a helpful assistant, when giving tutorials or helping the user with a question, walkthrough the user with step by step numbered directions separated by new line, with ENDLIST at the end of the last numbered item in the list, try doing this without using search if you can. Write all code in a special codeblock using ~~~language ~~~, one-line code snippets should also use ~~~ ~~~'), ...messages.map(msg => {
        return msg.role === 'user' ? new HumanChatMessage(msg.content) : new AIChatMessage(msg.content);
    })]),
  });
  console.log("Loaded agent.");
  try {
    const result0 = await executor.call({ input: message });
    return JSON.parse(JSON.stringify(result0.output));
  } catch (error) {
    console.log(error);
    const result1 = await executor.call({ input: `"${error}" Interpret this error and provide a possible solution.` });
    return result1.output;
  }
};

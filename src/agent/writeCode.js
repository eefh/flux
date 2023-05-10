import { OpenAI } from "langchain";
import { ChainTool } from "langchain/tools";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

export async function initializeCodeTool() {
    console.log('Initialize Code tool');
    const model = new OpenAI({ temperature: 0 });
    const template = "```{language} {code}```";
    const prompt = new PromptTemplate({ template, inputVariables: ["language", "code"] });
    const chain = new LLMChain({ llm: model, prompt });
  
    return new ChainTool({
      name: "write-code",
      description:
        "Write Code - useful for when you to write any code in a codeblock or code snippet.",
      chain: chain,
    });
  }
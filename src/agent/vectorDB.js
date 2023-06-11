import { OpenAI } from "langchain";
import { initializeAgentExecutor } from "langchain/agents";
import { SerpAPI, Calculator, ChainTool } from "langchain/tools";
import { VectorDBQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

export async function initializeQATool(fileContent) {
    console.log('Initialize QA tool');
    const model = new OpenAI({ temperature: 0 });
    const text = fileContent ? fileContent : fs.readFileSync(`${__dirname}/state_of_the_union.txt`, "utf8");
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    const chain = VectorDBQAChain.fromLLM(model, vectorStore);
  
    return new ChainTool({
      name: "user-database-qa",
      description:
        "User-uploaded Database QA - useful for when you need to ask questions about data within a database uploaded by the user.",
      chain: chain,
    });
  }
  
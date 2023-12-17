import line from "@line/bot-sdk";
import express from "express";
import OpenAI from "openai";
import {readUserData,writeUserData} from "./firebaseDb.js"
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



const client = new line.Client(lineConfig);
const app = express();

app.post("/webhook", line.middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;
  const lineId = event.source.userId;
  console.log(userMessage);
  const gptResponse = await getGptResponse(userMessage, lineId);

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: gptResponse,
  });
}

//put question to ai
async function putMessageNew(threadId, content) {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });
}
//create new thread to new user
//return thread id
async function createNewThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}
//run gpt to answer the question
//return run Id to track status of question
async function runGpt(threadId, assistanceId) {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistanceId,
  });
  return run.id;
}
//use for sleep checkStatus function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//query status of question
//return status from query
async function checkStatus(threadId, runId) {
  const check = await openai.beta.threads.runs.retrieve(threadId, runId);
  return check.status;
}

//check status until it complete
//return status
async function checkStatusUntilComplete(thread, runId) {
  let status = await checkStatus(thread, runId);

  // Continue checking status until it becomes "completed"
  while (status !== "completed") {
    await sleep(1000); // Wait for 1 second (adjust the delay as needed)
    status = await checkStatus(thread, runId);
    console.log("status " + status);
  }
  return status;
}

//get data from all conversation
//all conversation
async function recieveData(threadId) {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data;
}

async function getGptResponse(message,lineId) {
  try {
    const userData = await readUserData(lineId);
    let thread;
    if (userData == null) {
        const token = 100;
      const assistant = await openai.beta.assistants.retrieve(
        process.env.ASSISTANT_MODEL
      );

      thread = await createNewThread();
      putMessageNew(thread, message);
      writeUserData(lineId,thread,token);
      const runId = await runGpt(thread, assistant.id);
      //const runId = "run_au6kdniYlwgUyYR5StioYoJp"
      //console.log(runId);

      const status = await checkStatusUntilComplete(thread, runId);
    
      if (status === "completed") {
        // Send the generated response to the user
        const data = await recieveData(thread);
        //console.log(data);
        return data[0].content[0].text.value;
        //console.log(data)
      } else {
        // Handle the case where the task is not yet complete
        console.log("GPT-3.5 task is not yet complete.");
      }
    } else {
        
      const assistant = await openai.beta.assistants.retrieve(
        process.env.ASSISTANT_MODEL
      );
      thread = userData.threadId;
      putMessageNew(thread, message);
      const runId = await runGpt(thread, assistant.id);
      //const runId = "run_au6kdniYlwgUyYR5StioYoJp"
      //console.log(runId);

      const status = await checkStatusUntilComplete(thread, runId);

      if (status === "completed") {
        // Send the generated response to the user
        const data = await recieveData(thread);
        //console.log(data);
        return data[0].content[0].text.value;
        //console.log(data)
      } else {
        // Handle the case where the task is not yet complete
        console.log("GPT-3.5 task is not yet complete.");
      }
    }
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    return "Sorry, I could not understand that.";
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import OpenAI from "openai";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
let thread;
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
  let thread = await openai.beta.threads.create();
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

async function main() {
  const newUser = false;
  if (newUser) {
    const assistant = await openai.beta.assistants.retrieve(
      "asst_2K9cTRZhXnr6Id4aBGkA448X"
    );

    thread = await createNewThread();
    console.log(thread)

    putMessageNew(thread, "my grandmother is missing. who can help me find her");
    const runId = await runGpt(thread, assistant.id);
    //const runId = "run_au6kdniYlwgUyYR5StioYoJp"
    console.log(runId);

    const status = await checkStatusUntilComplete(thread, runId);

    if (status === "completed") {
      // Send the generated response to the user
      const data = await recieveData(thread);
      console.log(data);
      console.log(data[0].content[0].text.value);
      //console.log(data)
    } else {
      // Handle the case where the task is not yet complete
      console.log("GPT-3.5 task is not yet complete.");
    }
  } else {
    const assistant = await openai.beta.assistants.retrieve(
      "asst_2K9cTRZhXnr6Id4aBGkA448X"
    );
    thread = "thread_d9RgeObP9DWaScroeyWD4hTH"
    putMessageNew(thread, "i found king cobra in my house.who can help me??");
    const runId = await runGpt(thread, assistant.id);
    //const runId = "run_au6kdniYlwgUyYR5StioYoJp"
    console.log(runId);

    const status = await checkStatusUntilComplete(thread, runId);

    if (status === "completed") {
      // Send the generated response to the user
      const data = await recieveData(thread);
      console.log(data);
      console.log(data[0].content[0].text.value);
      //console.log(data)
    } else {
      // Handle the case where the task is not yet complete
      console.log("GPT-3.5 task is not yet complete.");
    }
  }

  //console.log(messages.data)
}

main();

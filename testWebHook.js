import line from '@line/bot-sdk';
import express from 'express';
import OpenAI from "openai";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY,
});

const client = new line.Client(lineConfig);
const app = express();

app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  console.log(event.source.userId)
  const userMessage = event.message.text;
  console.log(userMessage);
  //const gptResponse = await getGptResponse(userMessage);

  //return client.replyMessage(event.replyToken, { type: 'text', text: gptResponse });
}

async function getGptResponse(message) {
    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: message }],
            model: "gpt-3.5-turbo",
        });
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
        return 'Sorry, I could not understand that.';
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

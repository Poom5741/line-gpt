import OpenAI from "openai";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY,
});

async function main() {
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "Say this is a test" }],
        model: "gpt-3.5-turbo",
    });
    console.log(chatCompletion.choices[0].message.content)
}
async function callGpt() {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "say some thing good in 3 word" }],
        stream: true,
    });
    console.log(stream)
    for await (const chunk of stream) {
        return chunk.choices[0]?.delta?.content || "";
    }
}
main();
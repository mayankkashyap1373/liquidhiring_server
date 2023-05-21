// Path: helpers/openaiService.js

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: "org-IVap2zEjl4Iw2d2fzxmV4V9H",
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

async function generate(prompt) {
    console.log('Prompt: ', prompt);
    completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: "[You are a resume reviewer and a mentor. You are reviewing a resume and giving detailed feedback to the job seeker. Your name is 'LiquidHiring Bot'.]" + prompt + " suggest improvements to his resume.",
            },
        ],
    })
    return completion.data.choices[0].message;
    console.log((await openai.listModels()).data);
}

module.exports = {
    generate,
};
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

const openai = new OpenAIApi(configuration);

// one action to get response from openAI
async function generateResponse(prompt) {
    const response = await openai.createCompletion({
      model : "text-davinci-003",
      prompt :prompt,
      max_tokens: 2000
    })
    return response.data.choices[0].text.trim();
}

module.exports = {
    generateResponse,
}
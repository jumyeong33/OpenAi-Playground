const readline = require('readline');
const fs = require('fs')
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function readFile(path) {
  return fs.readFileSync(path, 'utf8')
}

// one action to get response from openAI
async function generateResponse(prompt) {
  const response = await openai.createCompletion({
    model : "text-davinci-003",
    prompt :prompt,
    max_tokens: 2000
  })
  return response.data.choices[0].text.trim()
}
const option = `
Options :
a. summary my CV according to Job requirements
b. reason to hire me and against opinion 
c. advice to apply this job and preparation
`

function uploadFile() {
  return new Promise((res) => {
    rl.question('Upload File : ', function(path) {
      console.log('read cv...');
      try {
        const content = readFile(path)
        res(content)
      } catch (err) {
        console.log(err)
        console.log('Upload failed.. try again..');
        uploadFile().then(res);
      }
    })
  })
}

async function prompt() {
  const job = readFile('./assets/job_ad_example.txt', 'utf8');
  const jobPromt = `summarize the key requirements for the following job:
  ===
  ${job}
  ===
  Summary : 
  `
  try{
    console.log('Load.....')
    const jobGenerated = await generateResponse(jobPromt)
  } catch (err) {
    console.log(err)
  }
  const result = await uploadFile()
  
}

const greeting = `
Welcome to example matching world..!
Ai ready to match your cv..
How to use.. 
 1. upload your cv (your local file path)
 2. select number that you want to see
`
console.log(greeting)
prompt()
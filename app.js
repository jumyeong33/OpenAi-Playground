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

async function executeOptions(select, jobGenerated, resume) {
  const options = {
    'a' : async() => {
      const promptForA = `
      Consider the following job requirements, summarize the following candidate
      ===
      JOB requirements : 
      ${jobGenerated}
      ===
      CANDIDATE resume : 
      ${resume}
      `
      return await generateResponse(promptForA);
    },
    'b' : async() => {
      const promptForB =`
      list the top 3 reasons for and against hiring the following candidate for the following job:
      Candidate : 
      ${resume}
      ===
      Job Requirements : 
      ${jobGenerated}
      `
      return await generateResponse(promptForB);
    },
    'c' : async() => {
      const promptForC =`
      give some resume advices according to compare candidate resume to job requrirements 
      ===
      Candidate : 
      ${resume}
      ===
      Job Requirements : 
      ${jobGenerated}
      ===
      Advice :
      `
      return await generateResponse(promptForC);
    },
    'd' : async() => {
      return new Promise((res) => {
        rl.question('Q: ', async function(msg) {
          const promptForD =`
          ${msg}
          ===
          Candidate : 
          ${resume}
          ===
          Job Requirements : 
          ${jobGenerated}
          ===
          `
          const result = await generateResponse(promptForD);
          res(result)
        })
      })
    }
  }
  const selectedOption = options[select];
  if (!selectedOption) {
    throw new Error(`Invalid option: ${select}`);
  }
  return await selectedOption();
}

function showOption(job, resume) {
  const option = `
  Options :
  a. summary my CV according to Job requirements
  b. reason to hire me and against opinion 
  c. advice to apply this job and preparation
  d. make question whatever you want based on your cv and job ad
  `
  console.log(option)
  return new Promise((res) => {
    rl.question('Select: ', async function(select) {
      try{
        const result = await executeOptions(select, job, resume)
        res(result)
      } catch (err) {
        console.log(err)
      }
    })
  })
}


function uploadResume() {
  return new Promise((res) => {
    rl.question('Upload Resume : ', function(path) {
      console.log('read cv...');
      try {
        const content = readFile(path)
        res(content)
      } catch (err) {
        console.log(err)
        console.log('Upload failed.. try again..');
        uploadResume().then(res);
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
  let jobGenerated;
  try{
    console.log('Load.....')
    jobGenerated = await generateResponse(jobPromt)
  } catch (err) {
    console.log(err)
  }
  const resume = await uploadResume()
  const result = await showOption(jobGenerated, resume)
  console.log(result)
  
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
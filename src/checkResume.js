/* eslint-disable no-undef */
const basePath = process.cwd();
const readline = require('readline');
const fs = require('fs');
const { errorMsg, sendMsg, system, yellow } = require('../lib/pretty');
const { generateResponse } =require('../lib/openAi')

function properPath() {
  return basePath.replace('src', '');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function readFile(path) {
  return fs.readFileSync(path, 'utf8')
}

function readFileFromDir() {
  let properBasePath = properPath();
  try {
    const files = fs.readdirSync(`${properBasePath}/assets/job`);
    const path = `${properBasePath}/assets/job/${files[0]}`;
    return readFile(path);
  } catch(err) {
    console.log(errorMsg('Please add job description before start..'));
    process.exit(1);
  }
}

function makePromptMsg(job, resume) {
  return `
  ===
  JOB requirements : 
  ${job}
  ===
  CANDIDATE resume : 
  ${resume}`
}

async function executeOptions(select, jobGenerated, resume) {
  const options = {
    'a' : async() => {
      const promptForA = `Consider the following job requirements, summarize the following candidate`+ makePromptMsg(jobGenerated, resume)
      return await generateResponse(promptForA);
    },
    'b' : async() => {
      const promptForB =`list the top 3 reasons for and against hiring the following candidate for the following job:`+ makePromptMsg(jobGenerated, resume)
      return await generateResponse(promptForB);
    },
    'c' : async() => {
      const promptForC =`give some resume advices according to compare candidate resume to job requrirements`+ makePromptMsg(jobGenerated, resume)
      return await generateResponse(promptForC);
    },
    'd' : async() => {
      return new Promise((res) => {
        rl.question(sendMsg('Q: '), async function(msg) {
          const promptForD =`${msg}`+ makePromptMsg(jobGenerated, resume)
          const result = await generateResponse(promptForD);
          res(result)
        })
      })
    },
    'exit' : () => {
      rl.close();
      return 'Bye~'
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
  a. summary my CV according to Job requirements
  b. reason to hire me and against opinion 
  c. advice to apply this job and preparation
  d. make question whatever you want based on your cv and job ad
  `
  console.log(yellow('Options:'))
  console.log(option)
  console.log(' if you want to out.. write' + system(` 'exit'`))
  return new Promise((res) => {
    rl.question(sendMsg('Select:'), async function(select) {
      try{
        const result = await executeOptions(select, job, resume);
        console.log(result);
        res(showOption(job, resume));
      } catch (err) {
        console.log(errorMsg(err.message));
        showOption(job, resume).then(res);
      }
    })
  })
}

function uploadResume() {
  return new Promise((res) => {
    rl.question(sendMsg('Upload Resume:'), function(path) {
      try {
        const content = readFile(path);
        res(content);
      } catch (err) {
        console.log(errorMsg(err.message));
        console.log('Upload failed.. try again..');
        uploadResume().then(res);
      }
    })
  })
}

async function prompt() {
  let jobGenerated;
  const job = readFileFromDir();
  const jobPromt = `
  summarize the key requirements for the following job:
  ===
  ${job}
  ===
  Summary : 
  `
  try{
    console.log(system('Load.....'));
    jobGenerated = await generateResponse(jobPromt);
  } catch (err) {
    console.log(err);
  }
  const resume = await uploadResume();
  const result = await showOption(jobGenerated, resume);
  console.log(result);
}

const greeting = `
How to use.. 
 1. upload your cv (your local file path)
 2. select number that you want to see
`
console.log(greeting);
prompt();
/* eslint-disable no-undef */
const fs = require('fs');
const basePath = process.cwd();
const { errorMsg, sendMsg, system } = require('../lib/pretty');
const { generateResponse } = require('../lib/openAi');
const readline = require('readline');

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

function readFileAndMakePrompt(jobGenerated) {
    let properBasePath = properPath();
    let index = 1;
    let prompt = `which candidate resume is the most fit when compared the job requirements :
    Job requirements : 
    ${jobGenerated}
    ===`;
    try {
        const files = fs.readdirSync(`${properBasePath}/assets/candidates`);
        for(const file of files) {
            const candidate = readFile(`${properBasePath}/assets/job/${file}`);
            const tempPrompt = `
            Candidate ${index} : 
            ${candidate}
            ===
            `
            prompt = prompt + tempPrompt;
            index++;
        }
        return prompt;
    } catch(err) {
        console.log(errorMsg('Cannot make propmt based on resumes'));
        process.exit(1);
    }

}

async function promptOptimal() {
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
      console.log(jobGenerated);
    } catch (err) {
      console.log(err);
    }
    rl.question(sendMsg('Press enter to Start >>'), async function() {
        readFileAndMakePrompt(jobGenerated)
    })
}
promptOptimal();
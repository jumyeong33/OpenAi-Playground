# Resume Check using openAI

Using openAI model 'text-davinci-003', The client can chat through terminal.

The prompt is set to compare job advertisements and resumes, but clients can upload job advertisements and resumes of any kind.

## Apps

---

### checkResume.js

This app can show you options that you can pick or make a chat with AI.

Before using this app, you need to ...

1. add job_ad.txt file at `assets/job`

Then you can follow up the next step.

### optimalCandidate.js

This app can find the most optimal resume in several reumes.

Before using this app, you need to ...

1. add job_ad.txt file at `assets/job`

2. Add resumes.txt at `assets/candidates`

## Requirememnts

---

- node v 14.19.0

## Start

Download zip file and make directory.

install packages

```
npm install
```

Set OpenAi Api Key at `.env`

```
OPENAI_API_KEY= 'your api key from openAi'
```

Run checkResume.js

```
npm start
```

Run optimalCandidate.js

```
npm run optimal
```

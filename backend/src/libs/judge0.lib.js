import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY ?? "";

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: process.env.JUDGE0_API_URL + "/submissions/batch",
    params: { base64_encoded: "false" },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${JUDGE0_API_KEY}`,  
    },
    data: { submissions },
  };

  const { data } = await axios.request(options);

  console.log("Submission Batch", data);

  return data; // [{tokens}, {tokens}, ...]
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while (true) {
    const options = {
      method: "GET",
      url: process.env.JUDGE0_API_URL + "/submissions/batch",
      params: {
        tokens: tokens.join(","),
        base64_encoded: false,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${JUDGE0_API_KEY}`,
      },
    };

    const { data } = await axios.request(options);

    const results = data.submissions;

    const isAllDone = results.every(
      (result) => result.status.id !== 1 && result.status.id !== 2
    );

    if (isAllDone) {
      return results;
    }

    await sleep(1000);
  }
};

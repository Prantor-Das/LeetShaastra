import { db } from "../libs/db.js";
import { pollBatchResults } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  // going to get all the data from the request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    hints,
    editorial,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;
  // going to check user role once again
  if (req.user !== "ADMIN") {
    return res.status(403).json({
      error: "You are not authorized to create a problem",
    });
  }
  // loop through each reference solution for differnt problem
  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.lenglth; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Test case ${i + 1} failed for language ${language}`,
          });
        }
      }

      // save the problem in the database
      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          hints,
          editorial,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Problem created successfully",
        problem: newProblem,
      });

    }
  } catch (error) {
    console.error("Create problem error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllProblem = async (req, res) => {
  res.send("get all problem");
};

export const getProblemById = async (req, res) => {
  res.send("get problem by id");
};

export const updateProblem = async (req, res) => {
  res.send("update problem");
};

export const deleteProblem = async (req, res) => {
  res.send("delete problem");
};

export const getAllProblemaSolvedByUser = async (req, res) => {
  res.send("get all problem solved by user");
};

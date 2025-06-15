import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  // going to get all the data from the request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  // loop through each reference solution for differnt problem
  // Object.entries(referenceSolutions) is an array of [language, solutionCode]
  // Object.entries is a method that returns an array of [key, value]
  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
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

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        console.log("Result-----", result);

        console.log(
          `Testcase ${
            i + 1
          } and Language ${language} ----- result ${JSON.stringify(
            result.status.description
          )}`
        );

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
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
  } catch (error) {
    console.error("Create problem error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating problem",
    });
  }
};

export const getAllProblem = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (!problems) {
      return res.status(404).json({
        error: "No Problems Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Problems Fetched Successfully",
      problems,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error While Fetching Problems",
    });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Problem Fetched Successfully",
      problem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error While Fetching Problem by id",
    });
  }
};

export const updateProblem = async (req, res) => {
  // going to get problem id
  const { id } = req.params;

  // going to get all the data from the request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  const problem = await db.problem.findUnique({ where: { id } });

  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  // loop through each reference solution for differnt problem
  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
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

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        console.log("Result-----", result);

        console.log(
          `Testcase ${
            i + 1
          } and Language ${language} ----- result ${JSON.stringify(
            result.status.description
          )}`
        );

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }
    }

    // save the problem in the database
    const updateProblem = await db.problem.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Problem updated successfully",
      problem: updateProblem,
    });
  } catch (error) {
    console.error("Create problem error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating problem",
    });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: "Problem not found",
      });
    }

    await db.problem.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting problem",
    });
  }
};

export const getAllProblemaSolvedByUser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          }, // if any one is true use some
        },
      },
      include: { // include is used to fetch the data from the currently logged in user
        solvedBy: {
          where: {
            userId: req.user.id
          }
        },
      }
    });

    // console.log(problems);

    res.status(200).json({
      success: true,
      message: "Problems Fetched Successfully",
      problems,
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error While Fetching Problems",
    });
  }
};

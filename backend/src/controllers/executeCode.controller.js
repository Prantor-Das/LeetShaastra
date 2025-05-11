import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

// run and submit in one only later separate them
// user can add test cases
// hidden test cases, Making sure user can't see them, but can see results. 
// User can see only 3 test cases + the test cases users have added

export const executeCode = async (req, res) => {
  try {
    const { sourceCode, language_id, stdin, expected_output, problemId } =
      req.body;

    const userId = req.user.id;

    try {
      // 1. Validate test cases
      if (
        !Array.isArray(stdin) ||
        stdin.length === 0 ||
        !Array.isArray(expected_outputs) ||
        expected_output.length !== stdin.length
      ) {
        return res.status(400).json({
          error: "Invalid or Missing test cases",
        });
      }

      // 2. Prepare each test cases for judge0 batch submission
      const testCases = stdin.map((input) => ({
        source_code: sourceCode,
        language_id,
        stdin: input,
      }));

      // 3. Send batch of sunmissions to judge0
      const submitResponse = await submitBatch(testCases);
      const tokens = await submitResponse.map((res) => res.token);

      // 4. Poll for results
      const results = await pollBatchResults(tokens);

      console.log("Result-------------");
      console.log(results);

      res.status(200).json({
        success: true,
        message: "Code Executed Successfully",
        results,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error While Executing Code",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error While Executing Code",
    });
  }
};

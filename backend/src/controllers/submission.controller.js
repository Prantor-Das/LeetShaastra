import { db } from "../libs/db.js";

export const getAllSubmission = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submissions Fetched Successfully",
      submissions,
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error While Fetching Submissions",
    });
  }
};

export const getSubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.id;

    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submission Fetched Successfully",
      submissions,
    })


  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error While Fetching Submissions",
    });
  }
};

export const getSubmissionsForProblemCount = async (req, res) => {
  try {
    const problemId = req.params.id;

    const submissions = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submission Count Fetched Successfully",
      submissions,
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error While Fetching Submission Count",
    });
  }
};

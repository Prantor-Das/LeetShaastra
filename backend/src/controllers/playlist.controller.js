import { db } from "../libs/db.js";
// add feature to change name and etc

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    // add more validation like already existing playlist

    res.status(200).json({
      success: true,
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create Playlist",
    });
  }
};

export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      includes: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlists Fetched Successfully",
      playlists,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error While Fetching Playlists",
    });
  }
};

export const getPlayListDetails = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist Fetched Successfully",
      playlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error While Fetching Playlist",
    });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body; // [id1, id2, id3]
  // add feature to add multiple problems to playlist

  try {
    // check if problem already exists in playlist

    if (!Array.isArray(problemIds) ?? problemIds.length === 0) {
      return res.status(400).json({
        error: "Invalid or missing problemId",
      });
    }

    // Create records for each problems in the playlist
    const problemsInPlaylist = await db.problemsInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    res.status(201).json({
      success: true,
      message: "Problem added to playlist successfully",
      problemsInPlaylist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to add problem to playlist",
    });
  }
};

export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to delete playlist",
    });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        error: "Invalid or missing problemId",
      });
    }

    const deletedProblem = await db.problemsInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem removed from playlist successfully",
      deletedProblem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to remove problem from playlist",
    });
  }
};

import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { addProblemToPlaylist, createPlaylist, deletePlaylist, getAllListDetails, getPlayListDetails, removeProblemFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const playlistRoutes = express.Router();

playlistRoutes.post("/create-playlist", isLoggedIn, createPlaylist);
playlistRoutes.put("/:playListId/update-playlist-detail", isLoggedIn, updatePlaylist);
playlistRoutes.get("/", isLoggedIn, getAllListDetails);
playlistRoutes.get("/:playlistId", isLoggedIn, getPlayListDetails);
playlistRoutes.post("/:playlistId/add-problem", isLoggedIn, addProblemToPlaylist);
playlistRoutes.delete("/:playlistId", isLoggedIn, deletePlaylist);
playlistRoutes.delete("/:playlistId/remove-problem", isLoggedIn, removeProblemFromPlaylist);

export default playlistRoutes;

import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createPlaylistSchema,
    updatePlaylistSchema,
    playlistIdParamSchema,
    playlistVideoParamsSchema,
    playlistsQuerySchema
} from "../validations/playlist.validations.js";

const router = Router();

router
    .route("/")
    .post(verifyJWT, validate({ body: createPlaylistSchema }), createPlaylist)
    .get(verifyJWT, validate({ query: playlistsQuerySchema }), getUserPlaylists);

router
    .route("/:playlistId/videos/:videoId")
    .post(verifyJWT, validate({ params: playlistVideoParamsSchema }), addVideoToPlaylist)
    .delete(verifyJWT, validate({ params: playlistVideoParamsSchema }), removeVideoFromPlaylist);

router
    .route("/:playlistId")
    .get(optionalVerifyJWT, validate({ params: playlistIdParamSchema }), getPlaylistById)
    .patch(verifyJWT, validate({ params: playlistIdParamSchema, body: updatePlaylistSchema }), updatePlaylist)
    .delete(verifyJWT, validate({ params: playlistIdParamSchema }), deletePlaylist);

export default router;

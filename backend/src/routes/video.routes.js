import { Router } from "express";
import {
    publishVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
} from "../controllers/video.controller.js";
import { toggleVideoLike } from "../controllers/like.controller.js";
import { videoCommentsRouter } from "./comment.routes.js";
import { upload, uploadVideo } from "../middlewares/multer.middleware.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    publishVideoSchema,
    updateVideoSchema,
    videoIdParamSchema,
    getAllVideosQuerySchema
} from "../validations/video.validations.js";

const router = Router();

router.use("/:videoId/comments", videoCommentsRouter);

router
    .route("/")
    .post(
        verifyJWT,
        uploadVideo.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        validate({ body: publishVideoSchema }),
        publishVideo
    )
    .get(optionalVerifyJWT, validate({ query: getAllVideosQuerySchema }), getAllVideos);

router
    .route("/:videoId/likes")
    .post(verifyJWT, validate({ params: videoIdParamSchema }), toggleVideoLike);

router
    .route("/:videoId")
    .get(optionalVerifyJWT, validate({ params: videoIdParamSchema }), getVideoById)
    .patch(verifyJWT, upload.single("thumbnail"), validate({ params: videoIdParamSchema, body: updateVideoSchema }), updateVideo)
    .delete(verifyJWT, validate({ params: videoIdParamSchema }), deleteVideo);

export default router;

import { Router } from "express";
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";
import { toggleCommentLike } from "../controllers/like.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    addCommentSchema,
    updateCommentSchema,
    videoIdParamSchema,
    commentIdParamSchema,
    commentsQuerySchema
} from "../validations/comment.validations.js";

const videoCommentsRouter = Router({ mergeParams: true });
videoCommentsRouter
    .route("/")
    .post(verifyJWT, validate({ params: videoIdParamSchema, body: addCommentSchema }), addComment)
    .get(optionalVerifyJWT, validate({ params: videoIdParamSchema, query: commentsQuerySchema }), getVideoComments);

const commentActionsRouter = Router();
commentActionsRouter
    .route("/:commentId/likes")
    .post(verifyJWT, validate({ params: commentIdParamSchema }), toggleCommentLike);
commentActionsRouter
    .route("/:commentId")
    .patch(verifyJWT, validate({ params: commentIdParamSchema, body: updateCommentSchema }), updateComment)
    .delete(verifyJWT, validate({ params: commentIdParamSchema }), deleteComment);

export { videoCommentsRouter, commentActionsRouter };

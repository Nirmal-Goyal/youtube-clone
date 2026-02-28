import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        const likesCount = await Like.countDocuments({ video: videoId });

        return res.status(200).json(
            new ApiResponse(
                200,
                { liked: false, likesCount },
                "Video unliked"
            )
        );
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id,
    });

    const likesCount = await Like.countDocuments({ video: videoId });

    return res.status(200).json(
        new ApiResponse(
            200,
            { liked: true, likesCount },
            "Video liked"
        )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        const likesCount = await Like.countDocuments({ comment: commentId });

        return res.status(200).json(
            new ApiResponse(
                200,
                { liked: false, likesCount },
                "Comment unliked"
            )
        );
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    });

    const likesCount = await Like.countDocuments({ comment: commentId });

    return res.status(200).json(
        new ApiResponse(
            200,
            { liked: true, likesCount },
            "Comment liked"
        )
    );
});

export { toggleVideoLike, toggleCommentLike };

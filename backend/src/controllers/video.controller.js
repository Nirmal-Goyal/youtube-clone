import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.model.js";
import {
    uploadOnCloudinary,
    uploadVideoOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body;

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoFile = await uploadVideoOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(400, "Video file upload failed");
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail upload failed");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        videoFilePublicId: videoFile.public_id,
        thumbnail: thumbnail.url,
        thumbnailPublicId: thumbnail.public_id,
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        owner: req.user._id,
    });

    const createdVideo = await Video.findById(video._id);

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while publishing the video");
    }

    return res.status(201).json(
        new ApiResponse(201, createdVideo, "Video published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 },
    });

    if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: videoId },
        });
    }

    const updatedVideo = await Video.findById(videoId).populate(
        "owner",
        "username fullname avatar"
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video fetched successfully")
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    const aggregate = Video.aggregate([
        { $match: { isPublished: true } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
            },
        },
        { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } },
    ]);

    const options = {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(50, Math.max(1, parseInt(limit))),
    };

    const result = await Video.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, result, "Videos fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, isPublished } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    const updateFields = {};

    if (title?.trim() !== undefined) updateFields.title = title.trim();
    if (description?.trim() !== undefined) updateFields.description = description.trim();
    if (typeof isPublished === "boolean") updateFields.isPublished = isPublished;

    if (req.file?.path) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (thumbnail) {
            if (video.thumbnailPublicId) {
                await deleteFromCloudinary(video.thumbnailPublicId, "image");
            }
            updateFields.thumbnail = thumbnail.url;
            updateFields.thumbnailPublicId = thumbnail.public_id;
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    ).populate("owner", "username fullname avatar");

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos");
    }

    if (video.videoFilePublicId) {
        await deleteFromCloudinary(video.videoFilePublicId, "video");
    }
    if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId, "image");
    }

    await Video.findByIdAndDelete(videoId);

    await User.updateMany(
        { watchHistory: videoId },
        { $pull: { watchHistory: videoId } }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

export {
    publishVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
};

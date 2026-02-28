import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const subscribeToChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (existingSubscription) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Already subscribed")
        );
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Subscribed successfully")
    );
});

const unsubscribeFromChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscription = await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (!subscription) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Not subscribed")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Unsubscribed successfully")
    );
});

const getUserSubscribedChannels = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const totalDocs = await Subscription.countDocuments({
        subscriber: req.user._id,
    });

    const subscriptions = await Subscription.find({
        subscriber: req.user._id,
    })
        .populate("channel", "username fullname avatar")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
    const totalPages = Math.ceil(totalDocs / limitNum);

    const result = {
        docs: subscriptions.map((sub) => sub.channel),
        totalDocs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
    };

    return res.status(200).json(
        new ApiResponse(200, result, "Subscribed channels fetched successfully")
    );
});

export {
    subscribeToChannel,
    unsubscribeFromChannel,
    getUserSubscribedChannels,
};

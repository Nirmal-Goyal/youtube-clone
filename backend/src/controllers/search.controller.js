import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";

const escapeRegex = (str) => {
    return str.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const search = asyncHandler(async (req, res) => {
    const { q, type, page = 1, limit = 10 } = req.query;

    const regex = new RegExp(escapeRegex(q), "i");
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    let result;

    if (type === "video") {
        const query = {
            isPublished: true,
            $or: [
                { title: regex },
                { description: regex },
                { tags: regex },
            ],
        };

        const totalDocs = await Video.countDocuments(query);

        const docs = await Video.find(query)
            .populate("owner", "username fullname avatar")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const totalPages = Math.ceil(totalDocs / limitNum);

        result = {
            docs,
            totalDocs,
            limit: limitNum,
            page: pageNum,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum < totalPages ? pageNum + 1 : null,
            prevPage: pageNum > 1 ? pageNum - 1 : null,
        };
    } else if (type === "channel") {
        const query = {
            $or: [
                { username: regex },
                { fullname: regex },
            ],
        };

        const totalDocs = await User.countDocuments(query);

        const docs = await User.find(query)
            .select("username fullname avatar")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const totalPages = Math.ceil(totalDocs / limitNum);

        result = {
            docs,
            totalDocs,
            limit: limitNum,
            page: pageNum,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum < totalPages ? pageNum + 1 : null,
            prevPage: pageNum > 1 ? pageNum - 1 : null,
        };
    } else if (type === "playlist") {
        const query = {
            $or: [
                { name: regex },
                { description: regex },
            ],
        };

        const totalDocs = await Playlist.countDocuments(query);

        const docs = await Playlist.find(query)
            .populate("owner", "username fullname avatar")
            .sort({ updatedAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const totalPages = Math.ceil(totalDocs / limitNum);

        result = {
            docs,
            totalDocs,
            limit: limitNum,
            page: pageNum,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum < totalPages ? pageNum + 1 : null,
            prevPage: pageNum > 1 ? pageNum - 1 : null,
        };
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Search completed successfully")
    );
});

export { search };

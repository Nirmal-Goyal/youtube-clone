import { User } from "../../models/user.model.js"
import { Video } from "../../models/video.models.js"
import { Playlist } from "../../models/playlist.model.js"

export async function createTestUser(overrides = {}) {
    const defaults = {
        fullname: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        avatar: "https://test.com/avatar.png",
        coverImage: "https://test.com/cover.png",
    }
    const user = await User.create({ ...defaults, ...overrides })
    return user
}

export async function getAuthTokens(user) {
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }
}

export async function createTestVideo(ownerId, overrides = {}) {
    const defaults = {
        videoFile: "https://test.com/video.mp4",
        videoFilePublicId: "test_video_id",
        thumbnail: "https://test.com/thumbnail.png",
        thumbnailPublicId: "test_thumb_id",
        title: "Test Video",
        description: "Test description",
        duration: 120,
        owner: ownerId,
    }
    const video = await Video.create({ ...defaults, ...overrides })
    return video
}

export async function createTestChannel(overrides = {}) {
    const defaults = {
        fullname: "Channel Owner",
        username: "channelowner",
        email: "channel@example.com",
        password: "password123",
        avatar: "https://test.com/channel-avatar.png",
        coverImage: "",
    }
    const user = await User.create({ ...defaults, ...overrides })
    return user
}

export async function createTestPlaylist(ownerId, overrides = {}) {
    const defaults = {
        name: "Test Playlist",
        description: "Test playlist description",
        owner: ownerId,
        videos: [],
    }
    const playlist = await Playlist.create({ ...defaults, ...overrides })
    return playlist
}

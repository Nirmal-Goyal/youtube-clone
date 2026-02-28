import { Comment } from "../../models/comment.model.js"

export async function createTestComment(videoId, ownerId, content = "Test comment") {
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: ownerId,
    })
    return comment
}

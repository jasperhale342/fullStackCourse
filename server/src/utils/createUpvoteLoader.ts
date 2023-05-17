import DataLoader from "dataloader";

import { In } from "typeorm";
import { Upvote } from "src/entities/Upvote";

// pass in keys then return data for those keys
// [{postId: 5, userId: 10}]
//[]
export const createUpvoteLoader = () => 
new DataLoader<{postId: number; userId: number}, Upvote | null>  (async (keys)=>{
     console.log("////////////////////////////////////////keys are ", keys)
    const upvotes = await Upvote.findBy({ 
        postId: In(keys as any[]),
        userId: In(keys as any[])
    })
    const UpvoteIdsToUpvote: Record<string, Upvote> = {}

    upvotes.forEach(upvote => {
        UpvoteIdsToUpvote[`${upvote.userId}|${upvote.postId}`] = upvote
    })

    return keys.map(key => UpvoteIdsToUpvote[`${key.userId}|${key.postId}`])
})
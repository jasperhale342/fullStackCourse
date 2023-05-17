import DataLoader from "dataloader";
import { User } from "../entities/User";
import { In } from "typeorm";

// pass in keys then return data for those keys
// [1,2,3,4,5]
//[{id: 1, username: "tim"},{}.{},{}]
export const createUserLoader = () => new DataLoader<number, User>(async (userIds)=>{
    const users = await User.findBy({ id: In(userIds as number[])})
    const userIdToUser: Record<number, User> = {}

    users.forEach(u => {
        userIdToUser[u.id] = u
    })

    return userIds.map(userId => userIdToUser[userId])
})
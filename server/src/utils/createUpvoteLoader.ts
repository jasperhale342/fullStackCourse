import DataLoader from "dataloader";

import { In } from "typeorm";
import { Upvote } from "src/entities/Upvote";

// pass in keys then return data for those keys
// [{postId: 5, userId: 10}]
//[]
// class c {
//   postId: number;
//   userId: number;
//   constructor(postId:number, userId: number) {
//     this.postId = postId
//     this.userId = userId
//   }
// }


// function cacheKeyFn(input: {postId: number, userId: number}) {
//   console.log("########################################################### input ", input)
//   // const arr = new Array(userId, post)
 
//   return `${input.userId}[${input.postId}]`;
// }

export const createUpvoteLoader = () => 
new DataLoader<{postId: number; userId: number}, Upvote | null, String>  (async (keys)=>{

    const upvotes = await Upvote.findBy({ 
        postId: In(keys as any[]),
        userId: In(keys as any[])
    })
    const UpvoteIdsToUpvote: Record<string, Upvote> = {}

    upvotes.forEach(upvote => {
        UpvoteIdsToUpvote[`${upvote.userId}|${upvote.postId}`] = upvote
    })

    return keys.map(key => UpvoteIdsToUpvote[`${key.userId}|${key.postId}`])
}, )



  
//   function createLoaders(db) {
//     const userLoader = new DataLoader(async keys => {
//       // Create a set with all requested fields
//       const fields = keys.reduce((acc, key) => {
//         key.fields.forEach(field => acc.add(field));
//         return acc;
//       }, new Set());
//       // Get all our ids for the DB query
//       const ids = keys.map(key => key.id);
//       // Please be aware of possible SQL injection, don't copy + paste
//       const result = await db.query(`
//         SELECT
//           ${fields.entries().join()}
//         FROM
//           user
//         WHERE
//           id IN (${ids.join()})
//       `);
//     }, { cacheKeyFn });
  
//     return { userLoader };
//   }

// const batchGetStatusById = async ids => {
//     // The goal was to pass down sql
//     return ids.map(({ id, sqlArgs }) => models.Status.findByPk(id, sqlArgs));
//   };
  
//   /**
//    * Input ke is complex object so we can pass down sql parameters :)
//    * however... we need to teach the dataloader that it should cache on the sql options && the id
//    */
// //   const cacheKeyFn = key => {
// //     return JSON.stringify(key);
// //   };
  
//   const options = {
//     cacheKeyFn,
//   };





// new DataLoader(batchGetStatusById, options) { 
    
// }


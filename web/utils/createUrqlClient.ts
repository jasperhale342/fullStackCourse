import { Cache, Resolver, cacheExchange } from "@urql/exchange-graphcache"
import router from "next/router"
import { Exchange, fetchExchange, gql, stringifyVariables } from "urql"
import { pipe, tap } from "wonka"
import { DeletePostMutationVariables, LoginMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from "../src/generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery"
import { isServer } from "./isServer"
require('dotenv').config()

const errorExchange: Exchange = ({forward}) => ops$ =>{
  return pipe(
      forward(ops$),
      tap(({error}) => {
        // (CL) probably better to use http error codes
        if (error?.message.includes("Not Authenticated")) {
          router.replace("/login")
        }
      })
  )
}
export const cursorPagination =(): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey); //get all queries in cache
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName); //could have a bunch of queries so just get the ones we care about
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    //basically reading data from cache then returning it 
    const results: string[] = []
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInCache = cache.resolve(entityKey,fieldKey)
  
    info.partial = !isItInCache; //tell urql when to do a query 
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string 
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore")
      if (!_hasMore){
        hasMore = _hasMore as boolean
      }
      results.push(...data)
    })
    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results}
    
  };
};
function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields("Query")
            const fieldInfos = allFields.filter(
              (info) =>info.fieldName === "posts"
            )
            fieldInfos.forEach((fi) => {
              cache.invalidate("Query", "posts", fi.arguments || {})
            })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => { 
  let cookie = ''
  if (isServer()){
    cookie = ctx?.req?.headers?.cookie
  }
  return {
    fetchOptions: {
      credentials: "include" as const ,
      headers: cookie ? {
        cookie,
      }: undefined
    },
  
    url: process.env.NEXT_PUBLIC_API_URL as string,
    exchanges: [cacheExchange({
      keys: {
          PaginatedPosts: ()=>null, 
      },
      resolvers:{
        Query: { //for client side rendering. will run whenever query is run and then can alter results
          posts: cursorPagination(), //posts should match whats in Posts.graphql file 
        }
      },
      updates: {
        Mutation: {
          deletePost: (_result, args, cache, info) => {
            cache.invalidate({__typename: "Post", 
            id: (args as DeletePostMutationVariables).id})
          },
          vote: (_result, args, cache, info) => {
            const {postId, value} = args as VoteMutationVariables  
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
              
                
         )
         if (data) {
          if (data.voteStatus === value){
            return
          }
          const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value
          cache.writeFragment(
            gql`
              fragment _ on Post {
                points
                voteStatus
              }
            `,
            { id: postId, points: newPoints, voteStatus: value }
          );
          
         }
        },
          createPost: (_result, args, cache, info) => {
            invalidateAllPosts(cache)
            
          },
  
          logout: (_result, args, cache, info)=>{
            //clear cache so that page gets refreshed without user info there
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              () => ({me:null})
            )
          }, 
          login: (_result, args, cache, info) => {
            
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                {query: MeDocument},
                _result,
                (result, query) => {
                  if ( result.login.errors) {
                    return query
                  } else{
                    return {
                      me:result.login.user
                    }
                  }
                }
              )
              invalidateAllPosts(cache)
            
          },
          // for updating the cache. rn for only the MeQuery
          regiser: (_result, args, cache, info) => {
            
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if ( result.register.errors) {
                  return query
                } else{
                  return {
                    me:result.register.user
                  }
                }
              }
            )
          
        },
        }
      }
    }), 
        ssrExchange,
        errorExchange,
        fetchExchange,
        
    ],
    }
};
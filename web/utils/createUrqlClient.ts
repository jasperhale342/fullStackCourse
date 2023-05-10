import { Exchange, dedupExchange, fetchExchange } from "urql"
import { LoginMutation, MeQuery, MeDocument, RegisterMutation } from "../src/generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery"
import {cacheExchange} from "@urql/exchange-graphcache"
import { pipe, tap } from "wonka"
import router from "next/router"

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


export const createUrqlClient = (ssrExchange: any) =>({
    url: 'http://localhost:4000/graphql',
    exchanges: [dedupExchange, cacheExchange({
  
      updates: {
        Mutation: {
  
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
    fetchOptions: {
      credentials: "include" as const ,
    },
  } );
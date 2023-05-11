import { Exchange, dedupExchange, fetchExchange, stringifyVariables } from "urql"
import { LoginMutation, MeQuery, MeDocument, RegisterMutation } from "../src/generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery"
import {Resolver, cacheExchange} from "@urql/exchange-graphcache"
import { pipe, tap } from "wonka"
import router from "next/router"
import { FieldsOnCorrectTypeRule } from "graphql"

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
    console.log("all fields ",allFields)
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName); //could have a bunch of queries so just get the ones we care about
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    //basically reading data from cache then returning it 
    const results: string[] = []
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInCache = cache.resolve(entityKey,fieldKey)
    console.log("fieldArgs: ", fieldArgs)
    console.log("key is ", fieldKey)
    info.partial = !isItInCache; //tell urql when to do a query 
    console.log("info partial: ", !isItInCache)
    fieldInfos.forEach((fi) => {
      const data = cache.resolve(entityKey, fi.fieldKey) as string []
      results.push(...data)
    })
    console.log("result is ", results)
    return results
    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};


export const createUrqlClient = (ssrExchange: any) =>({
    url: 'http://localhost:4000/graphql',
    exchanges: [dedupExchange, cacheExchange({
      resolvers:{
        Query: { //for client side rendering. will run whenever query is run and then can alter results
          posts: cursorPagination(), //posts should match whats in Posts.graphql file 
        }
      },
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
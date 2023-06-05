import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, VoteMutation, useVoteMutation } from '../generated/graphql';
import { gql } from 'urql';
import { ApolloCache } from '@apollo/client';

//can select types that you want
// PostsQuery is just a big object
interface UpvoteSectionProps {
    post: PostSnippetFragment
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => { 
    const data = cache.readFragment< {
        id: number,
        points: number,
        voteStatus: number |null
    }>({
        id: "Post:" + postId,
        fragment: gql`
          fragment _ on Post {
            id
            points
            voteStatus
          }
        `,

        
          
        })
        if (data) {
            if (data.voteStatus === value){
              return
            }
            const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value
            cache.writeFragment({
                id: "Post:" + postId,
                fragment:
            
              gql`
                fragment _ on Post {
                  points
                  voteStatus
                }
              `,
              data: {  points: newPoints, voteStatus: value }
        });
            
           }
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState< "upvote-loading" | "downvote-loading" | "not-loading">("not-loading")
    
    const [vote] = useVoteMutation()     
    return ( 
        // <Flex key={post.id} p={5} shadow='md' borderWidth='1px' >
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
    
            <IconButton icon={<ChevronUpIcon/>} onClick={async ()=> {
                 if (post.voteStatus === 1){
                    return
                }
            setLoadingState("upvote-loading")
            await vote({ variables: {
                postId: post.id,
                value: 1
            },
            update: (cache) => updateAfterVote(1, post.id, cache) 
            })
            setLoadingState("not-loading")

        }} 
        
        color={post.voteStatus === 1 ? 'green' : undefined}
        name="chevron-up" 
        aria-label="upvote post"
        isLoading={loadingState === "upvote-loading"}
        />
        

    
       
        {post.points}
        <IconButton icon={<ChevronDownIcon/>} name="chevron-down" onClick={ async ()=>{
            if (post.voteStatus === -1){
                return
            }
            setLoadingState("downvote-loading")
             vote({ variables: {
                postId: post.id,
                value: -1
             },
             update: (cache) =>  updateAfterVote(-1, post.id, cache) 
            })
            setLoadingState("not-loading")
        }} 
        color={post.voteStatus === -1 ? 'red' : undefined}
        aria-label="downvote post" 
         isLoading={loadingState === "upvote-loading"}
         />
        </Flex>
       
    // </Flex>
    );
}
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, Box, Heading, Skeleton, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react'
import { PostSnippetFragment, PostsQuery, useVoteMutation } from '../generated/graphql';

//can select types that you want
// PostsQuery is just a big object
interface UpvoteSectionProps {
    post: PostSnippetFragment
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState< "upvote-loading" | "downvote-loading" | "not-loading">("not-loading")

    const [, vote] = useVoteMutation()     
    return ( 
        // <Flex key={post.id} p={5} shadow='md' borderWidth='1px' >
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
    
            <IconButton icon={<ChevronUpIcon/>} onClick={async ()=> {
            setLoadingState("upvote-loading")
            await vote({
                postId: post.id,
                value: 1
            })
            setLoadingState("not-loading")
        }} 
        
        // 
        name="chevron-up" 
        aria-label="upvote post"
        isLoading={loadingState === "upvote-loading"}
        />

    
       
        {post.points}
        <IconButton icon={<ChevronDownIcon/>} name="chevron-down" onClick={ async ()=>{
            setLoadingState("downvote-loading")
             vote({
                postId: post.id,
                value: -1
            })
            setLoadingState("not-loading")
        }} aria-label="downvote post" 
         isLoading={loadingState === "upvote-loading"}
         />
        </Flex>
       
    // </Flex>
    );
}
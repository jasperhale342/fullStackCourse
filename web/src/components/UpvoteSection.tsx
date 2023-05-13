import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, Box, Heading } from '@chakra-ui/react';
import React from 'react'
import { PostSnippetFragment, PostsQuery } from '../generated/graphql';

//can select types that you want
// PostsQuery is just a big object
interface UpvoteSectionProps {
    post: PostSnippetFragment
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({post}) => {
        return ( 
        <Flex key={post.id} p={5} shadow='md' borderWidth='1px' >
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
        <ChevronUpIcon name="chevron-up" aria-label="upvote post" />
        {post.points}
        <ChevronDownIcon name="chevron-down" onClick={()=>console.log("o")} aria-label="downvote post" />
        </Flex>
       
    </Flex>);
}
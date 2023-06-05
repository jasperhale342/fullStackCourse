import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react"
import { withApollo } from '../../utils/withApollo';
import NextLink from "next/link"
import { useEffect, useState } from "react"
import { EditDeletePostButtons } from "../components/EditDeletePostButtons"
import { Layout } from "../components/Layout"
import { UpvoteSection } from "../components/UpvoteSection"
import { usePostsQuery } from "../generated/graphql"

const Index = () => {
    const[mounted, setMounted] = useState(false)
    const {data, loading, error, fetchMore, variables} = usePostsQuery({
        variables: {
            limit:10, 
            cursor: null

        }, notifyOnNetworkStatusChange: true
    });

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;




    if (!loading && !data){
        return (
        <div> failed to get stuff 
            <div>{error?.toString()}</div>

        </div>
  
        )
    }

    return (
        <Layout>
            
            {loading && !data ? (
                <div> loading ...</div>
            ): (<Stack spacing={8}>
                {
                    data!.posts.posts.map((p)=> !p ? null: (
                    <Flex key={p.id} p={5} shadow='md' borderWidth='1px' >
                        <UpvoteSection post={p}></UpvoteSection>
                        <Box flex={1}>
                            <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                            <Link>
                                <Heading fontSize='xl'>{p.title}</Heading> 
                            </Link>
                            </NextLink>
                        <Text>posted by {p.creator.username}</Text>
                        <Flex>
                        <Text flex={1} mt={4}>{p.textSnippet}</Text> 
                        
                        <Box ml="auto">
                         <EditDeletePostButtons id={p.id} creatorId={p.creator.id}></EditDeletePostButtons>
                        </Box>
                        
                        </Flex>
                        </Box>
                    </Flex>
                    )
                )}
            </Stack>) }
            { data && data.posts.hasMore?<Flex>
            <Button 
                onClick={()=>{
                    fetchMore({
                        variables: {
                            limit:variables?.limit,
                            cursor: data.posts.posts[data.posts.posts.length-1].createdAt,
                        },
//                         updateQuery: (previousValue, {fetchMoreResult}): PostsQuery => {
//                             if( !fetchMore){
//                                 return previousValue as PostsQuery
//                             }
//                             return {
// __typename: 'Query',
// posts: {
//     __typename: 'PaginatedPosts',
//     hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
//     posts: [
//         ...(previousValue as PostsQuery).posts.posts,
//         ...(fetchMoreResult as PostsQuery).posts.posts
//     ]
// }
//                             }
//                         }
                    },
                    
                    )
                    }} my={8} isLoading={loading}> load more</Button>
            </Flex>: null}
        </Layout>
    )
    
}

export default withApollo({ssr: true})(Index)

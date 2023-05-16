import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../../utils/createUrqlClient"
import { NavBar } from "../components/NavBar"
import { useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql"
import { Layout } from "../components/Layout"
import NextLink from "next/link"
import {Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons"
import { UpvoteSection } from "../components/UpvoteSection"

const Index = () => {
    const[mounted, setMounted] = useState(false)
    const [variables, setVariables] = useState({limit:10, cursor: null as null | string})
    const [{data, fetching}] = usePostsQuery({
        variables,
    });
    const [{data: meData}] = useMeQuery()
    const [, deletePost] = useDeletePostMutation()
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    console.log(variables)


    if (!fetching && !data){
        return <div> failed to get stuff </div>
    }

    return (
        <Layout>
            
            {fetching && !data ? (
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
                        {meData?.me?.id !== p.creator.id ? null : 
                        <Box ml="auto">
                            <NextLink 
                            href='/post/edit/[id]' 
                            as={`/post/edit/${p.id}`}>
                        <IconButton 
                            mr={4}
                            icon={<EditIcon></EditIcon>} 
                            aria-label={"Edit Post"}
                            
                        />
                        </NextLink>
                        <IconButton 
                            icon={<DeleteIcon></DeleteIcon>} 
                            aria-label={"Delete Post"}
                      
                            onClick={()=>{
                                deletePost({id: p.id})
                            }}
                        />
                        </Box>
                        }
                        </Flex>
                        </Box>
                    </Flex>
                    )
                )}
            </Stack>) }
            { data && data.posts.hasMore?<Flex>
            <Button onClick={()=>{setVariables({
                limit:variables.limit,
                cursor: data.posts.posts[data.posts.posts.length-1].createdAt,
            })}} my={8} isLoading={fetching}> load more</Button>
            </Flex>: null}
        </Layout>
    )
    
}

export default withUrqlClient(createUrqlClient, {ssr:true}) (Index)

import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../../utils/createUrqlClient"
import { NavBar } from "../components/NavBar"
import { usePostsQuery } from "../generated/graphql"
import { Layout } from "../components/Layout"
import NextLink from "next/link"
import {Link} from "@chakra-ui/react"

const Index = () => {
    const [{data}] = usePostsQuery({
        variables: {
            limit: 10
        } 
    });
    return (
        <Layout>
            <NextLink href="/create-post">
            <Link>
            create post
            </Link>
            </NextLink>
            <br></br>

            
            <br></br>
            {!data ? null : data.posts.map(p=> <div key={p.id}> {p.title}</div>)}
        </Layout>
    )
    
}

export default withUrqlClient(createUrqlClient, {ssr:true}) (Index)

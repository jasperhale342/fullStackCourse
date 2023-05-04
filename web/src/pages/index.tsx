import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../../utils/createUrqlClient"
import { NavBar } from "../components/NavBar"
import { usePostsQuery } from "../generated/graphql"

const Index = () => {
    const [{data}] = usePostsQuery();
    return (
        <>
            <NavBar />
            <div> why</div>
            <br></br>
            {!data ? null : data.posts.map(p=> <div key={p.id}> {p.title}</div>)}
        </>
    )
    
}

export default withUrqlClient(createUrqlClient, {ssr:true}) (Index)
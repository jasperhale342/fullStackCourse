import { useRouter } from "next/router"
import { usePostQuery } from "../src/generated/graphql"
import { useGetIntId } from "./useGetIntId"

export const useGetPostFromUrl = () => {
   const intId = useGetIntId()
    return usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    })
}
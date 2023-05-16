import { withUrqlClient } from 'next-urql'
import React from 'react'
import { createUrqlClient } from '../../../../utils/createUrqlClient'
import { Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import router, { useRouter } from 'next/router'
import { InputField } from '../../../components/InputField'
import { Layout } from '../../../components/Layout'
import createPost from '../../create-post'
import { useGetPostFromUrl } from '../../../../utils/useGetPostFromUrl'
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql'
import { useGetIntId } from '../../../../utils/useGetIntId'



export const EditPost = ({}) => {
    const router = useRouter()
    const intId = useGetIntId()
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    })
    const [ , updatePost] = useUpdatePostMutation()
    if (fetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        )
    }
    if(!data?.post) {
        return <Layout>
            <Box> could not find post</Box>
        </Layout>
    }
        
    
        return ( <Layout variant='small'>
        <Formik 
        initialValues = {{title: data.post.title , text: data.post.text}}
        onSubmit={async (values) => {
            // const {error} = await createPost({input:values})
            // if(!error){
            //     router.push("/")
            // } 
            await updatePost({id: intId, ...values})
            router.push('/')
        }}
        >
            {({isSubmitting})=>(
                <Form>
                <InputField
                    name="title"
                    placeholder="title"
                    label="Title"
                />
                <Box mt={4}>
                <InputField
                    textarea
                    name="text"
                    placeholder="text..."
                    label="Body"
                
                />
                </Box>
                
                
                
                {/* mt mean margin top */}
                <Button
                 mt={4} 
                 type="submit" 
                 isLoading={isSubmitting} 
                 colorScheme="teal"> update post</Button>
                </Form>
            )}
        </Formik>
        
        </Layout>);
}

export default withUrqlClient(createUrqlClient)(EditPost)
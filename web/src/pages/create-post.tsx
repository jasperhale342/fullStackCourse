import { Button } from '@chakra-ui/button';
import { Box } from '@chakra-ui/layout';
import { Form, Formik } from 'formik';
import { withApollo } from '../../utils/withApollo';
import { useRouter } from 'next/router';
import React from 'react';
import { useIsAuth } from '../../utils/useIsAuth';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';

 const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter()
    useIsAuth()
    const [createPost] = useCreatePostMutation()
    return (
       <Layout variant='small'>
        <Formik 
        initialValues = {{title: "", text: ""}}
        onSubmit={async (values) => {
            const {errors} = await createPost({ variables: {input:values},
            update: (cache) => {
                cache.evict({fieldName: 'posts:{}'})
            }
            
            })
            if(!errors){
                router.push("/")
            } 
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
                    label="body"
                
                />
                </Box>
                
                
                
                {/* mt mean margin top */}
                <Button
                 mt={4} 
                 type="submit" 
                 isLoading={isSubmitting} 
                 colorScheme="teal"> create post</Button>
                </Form>
            )}
        </Formik>
        
        </Layout>
    )
}

export default withApollo({ssr: false})(CreatePost)
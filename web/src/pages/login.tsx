import { Button } from '@chakra-ui/button';
import { Box, Link } from '@chakra-ui/layout';
import { Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withApollo } from '../../utils/withApollo';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { toErrorMap } from '../../utils/toErrorMap';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';

export const Login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [login] = useLoginMutation();
        return (
            <Wrapper variant="small"> 
                <Formik 
                initialValues = {{usernameOrEmail: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const response = await login({variables:values,
                        update:(cache, {data}) => {
                            cache.writeQuery<MeQuery> ({
                                query: MeDocument,
                                data: {
                                    __typename: "Query",
                                    me: data?.login.user
                                }
                            })
                            cache.evict({fieldName:'posts:{}'})
                        }

                    });
                    if (response.data?.login.errors){
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user){
                        if (typeof router.query.next === 'string'){
                            router.push(router.query.next)
                        } else {
                            router.push("/");
                        }
                        
                    }
                }}
                >
                    {({isSubmitting})=>(
                        <Form>
                        <InputField
                            name="usernameOrEmail"
                            placeholder="usernameOrEmail"
                            label="Username or Email"
                        />
                        <Box mt={4}>
                        <InputField
                            name="password"
                            placeholder="password"
                            label="Password"
                            type="password"
                        />
                        </Box>
                        <Flex mt={2}>
                        <NextLink href="/forgot-password">
                            <Link  ml="auto"> forgot password</Link>
                        </NextLink>
                       
                        </Flex>
                        
                        
                        {/* mt mean margin top */}
                        <Button
                         mt={4} 
                         type="submit" 
                         isLoading={isSubmitting} 
                         colorScheme="teal"> login</Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}

export default withApollo({ssr: false})(Login)
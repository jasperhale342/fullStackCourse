import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import NextLink from 'next/link';
import router from "next/router";
import { useState } from "react";
import { toErrorMap } from "../../../utils/toErrorMap";
import { withApollo } from '../../../utils/withApollo';
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { MeDocument, MeQuery, useChangePasswordMutation } from "../../generated/graphql";

//for next js, files have this convention [token] if you want a variable in the url
 const ChangePassword: NextPage = () => {
    const [changePasword] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState(''); // make a state for a token error
    return (  <Wrapper variant="small"> 
    <Formik 
    initialValues = {{newPassword: ''}}
    onSubmit={async (values, {setErrors}) => {
        const response = await changePasword({ variables: {
            newPassword: values.newPassword,
            token: typeof router.query.token === "string" ? router.query.token : ""
        },
        update:(cache, {data}) => {
            cache.writeQuery<MeQuery> ({
                query: MeDocument,
                data: {
                    __typename: "Query",
                    me: data?.changePassword.user
                }
            })
            cache.evict({fieldName:'posts:{}'})
        }
    
    });
        if (response.data?.changePassword.errors){
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if ('token' in errorMap){
                setTokenError(errorMap.token) // pass in error message for token
            }
            setErrors(errorMap);
        } else if (response.data?.changePassword.user){
            router.push("/");
        }
    }}
    >
        {({isSubmitting})=>(
            <Form>
            <InputField
                name="newPassword"
                placeholder="new password"
                label="New Password"
                type="password"            
            />
            { tokenError ?(
                <Flex>
                    <Box mr={4} color='red'>{tokenError}</Box>
                    <NextLink href="/forgot-password">
                        <Link> reset password again</Link>
                    </NextLink>  
                    
                </Flex>
            ) : null}
            {/* mt mean margin top */}
            <Button mt={4} 
            type="submit" 
            isLoading={isSubmitting} 
            colorScheme="teal"> change password</Button>
            </Form>
        )}
    </Formik>
</Wrapper>

    );
}
// getInitialProps is a special function to get the query params
//if you need to server side render pages then you would have to use initial props
export default withApollo({ssr: true})(ChangePassword)
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import router from "next/router";
import { toErrorMap } from "../../../utils/toErrorMap";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import NextLink from 'next/link'

//for next js, files have this convention [token] if you want a variable in the url
 const ChangePassword: NextPage< {token: string}> = ({token}) => {
    const [, changePasword] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState(''); // make a state for a token error
    return (  <Wrapper variant="small"> 
    <Formik 
    initialValues = {{newPassword: ''}}
    onSubmit={async (values, {setErrors}) => {
        const response = await changePasword({
            newPassword: values.newPassword,
            token
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
ChangePassword.getInitialProps = ({query}) =>{
    return {
        token: query.token as string
    }
}
export default withUrqlClient(createUrqlClient)( ChangePassword)
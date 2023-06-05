import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withApollo } from '../../utils/withApollo';
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";

 const ForgotPassword: React.FC<{}> = ({}) => {
    const [ complete, setComplete] = useState(false)
    const [forgotPassword] = useForgotPasswordMutation()
    return (
    <Wrapper variant="small"> 
        <Formik 
        initialValues = {{email: ""}}
        onSubmit={async (values) => {
            await forgotPassword({variables: values})
            setComplete(true)
    }}
    >
        {({isSubmitting})=> 
        complete ? <Box>A reset link has been sent</Box> : (
            <Form>
            <Box mt={4}>
            <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
            />
            </Box>
            <Button
                mt={4} 
                type="submit" 
                isLoading={isSubmitting} 
                colorScheme="teal"> Reset Password</Button>

            </Form>
        )}
    </Formik>
</Wrapper>)
}

export default withApollo({ssr: false})(ForgotPassword)
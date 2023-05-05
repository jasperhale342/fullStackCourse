import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import router from "next/router";
import { toErrorMap } from "../../utils/toErrorMap";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import {useForgotPasswordMutation} from "../generated/graphql"

 const ForgotPassword: React.FC<{}> = ({}) => {
    const [ complete, setComplete] = useState(false)
    const [, forgotPassword] = useForgotPasswordMutation()
    return (
    <Wrapper variant="small"> 
        <Formik 
        initialValues = {{email: ""}}
        onSubmit={async (values) => {
            await forgotPassword(values)
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

export default withUrqlClient(createUrqlClient)(ForgotPassword);
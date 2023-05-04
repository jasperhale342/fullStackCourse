import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import router from "next/router";
import { toErrorMap } from "../../../utils/toErrorMap";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import login from "../login";

//for next js, files have this convention [token] if you want a variable in the url
 const ChangePassword: NextPage< {token: string}> = ({token}) => {
    return (  <Wrapper variant="small"> 
    <Formik 
    initialValues = {{newPassword: ''}}
    onSubmit={async (values, {setErrors}) => {
        // const response = await login(values);
        // if (response.data?.login.errors){
        //     setErrors(toErrorMap(response.data.login.errors));
        // } else if (response.data?.login.user){
        //     router.push("/");
        // }
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
export default ChangePassword
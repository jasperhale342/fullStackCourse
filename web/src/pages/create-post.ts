import  React  from "react";
import {Wrapper} from '../components/Wrapper'
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";


export const CreatePost: React.FC<> = ({}) => {
    return (
        <Wrapper variant='small'>
        <Formik 
        initialValues = {{usernameOrEmail: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
            const response = await login(values);
            if (response.data?.login.errors){
                setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user){
                router.push("/");
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
                    <Link ml="auto"> forgot password</Link>
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
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost)
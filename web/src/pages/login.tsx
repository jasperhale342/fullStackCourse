import React from 'react';
import {Form, Formik} from 'formik'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { valueScaleCorrection } from 'framer-motion/types/render/dom/projection/scale-correction';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';

import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
   
    

export const Login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
        return (
            <Wrapper variant="small"> 
                <Formik 
                initialValues = {{username: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const response = await login({options: values});
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
                            name="username"
                            placeholder="username"
                            label="Username"
                        />
                        <Box mt={4}>
                        <InputField
                            name="password"
                            placeholder="password"
                            label="Password"
                            type="password"
                        />
                        </Box>
                        {/* mt mean margin top */}
                        <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal"> login</Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}

export default withUrqlClient(createUrqlClient)(Login)
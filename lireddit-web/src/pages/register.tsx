import React from 'react';
import {Form, Formik} from 'formik'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { valueScaleCorrection } from 'framer-motion/types/render/dom/projection/scale-correction';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';

interface registerProps {

}



    
      
    

export const Register: React.FC<registerProps> = ({}) => {
        return (
            <Wrapper variant="small"> 
                <Formik 
                initialValues = {{username: "", password: ""}}
                onSubmit={(values) => {
                    console.log(values);
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
                        <Button 
                            mt={4} 
                            type="submit" 
                            isLoading={isSubmitting}
                            variantColor="teal"
                            >
                                register
                        </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}

export default Register
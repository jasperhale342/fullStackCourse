import { FormControl, FormErrorMessage, FormLabel} from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Textarea } from '@chakra-ui/react';
import { StringOrNumber } from '@chakra-ui/utils';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
    textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
    label, 
    textarea,
    size: _, 
    ...props}) => {
        let InputOrTextarea = Input as any //need to change this later (CL)
        if (textarea){
            InputOrTextarea = Textarea
        }
    const [field, {error}] = useField(props);    
    return (
            <FormControl isInvalid={!!error}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <InputOrTextarea {...field} {...props} id={field.name} />
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null }
              </FormControl>
        );
}
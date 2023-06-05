import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from 'next/link' // used for navigating pages. uses client side routing 
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../../utils/isServer';
import {useRouter} from 'next/router'
import { useApolloClient } from '@apollo/client';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [logout, {loading: logoutFetching}, ] = useLogoutMutation();
    const apolloClient = useApolloClient()
    const {data,  loading} = useMeQuery({
        skip: isServer(), // can do request on browser side
    }) 
    let body = null
    //data is loading
    if (loading){

    //user not logged in 
    } else if (!data?.me){
        body = (
            <>
            <NextLink href='/login'>
                <Link mr={2}>login</Link>
            </NextLink>
            <NextLink  href='/register'>
                <Link >register</Link>
            </NextLink>
            </>   
        );
    // user is logged in 
    } else {
        body = (
            <Flex align={"center"}>
                <NextLink href="/create-post">
                    <Button as={Link} mr={4}>
                    create post
                    </Button>
                    
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button 
                    onClick={async () => {
                    await logout({});
                    await apolloClient.resetStore()
                }}
                isLoading={logoutFetching}
                variant='link'> logout</Button>
            </Flex>
        )

    }
    return (
        <Flex  zIndex={1} position="sticky" top={0} bg='tomato' p={4} >
            <Flex flex={1} m={'auto'} align='center' maxW={800}>
            <NextLink href="/">
                <Link>
                <Heading>
                LiReddit
            </Heading>
                </Link>
            </NextLink>
            </Flex>
           
            <Box ml={"auto"}>
                {body}
            </Box>
        </Flex>

    );
};
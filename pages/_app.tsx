import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, extendTheme, StyleFunctionProps, Container, Flex } from '@chakra-ui/react'
import Header from  '../components/Header'
import React from 'react'

const theme = extendTheme({
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: '#FFFFFF',
      }
    })
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>

      <Flex
      flexDirection='column'
      alignItems={'center'}
      padding='40px'
      >
      <Header />
        <Component {...pageProps} />
      </Flex>

    </ChakraProvider>
  )
}

// src/pages/_app.tsx
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { Layout } from 'components/layout'

function MetamaskDemoApp({ Component, pageProps }: AppProps) {
  return (
      <ChakraProvider>
        <Layout>
        <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
  )
}

export default MetamaskDemoApp

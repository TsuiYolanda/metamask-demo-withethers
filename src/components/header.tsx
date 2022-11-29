//src/components/header.tsx
import NextLink from "next/link"
import { Flex, Button, useColorModeValue, Spacer, Heading, LinkBox, LinkOverlay } from '@chakra-ui/react'

const siteTitle="Metamaskノデモ〜"
export default function Header() {

  return (
    <Flex as='header' bg={useColorModeValue('gray.100', 'gray.900')} p={4} alignItems='center'>
      <LinkBox>
        <NextLink href={'/'} passHref>
          <LinkOverlay>
            <Heading size="lg">{siteTitle}</Heading>
          </LinkOverlay>
        </NextLink>
      </LinkBox>      
      <Spacer />
      <Button >Button for Account</Button>
    </Flex>
  )
}

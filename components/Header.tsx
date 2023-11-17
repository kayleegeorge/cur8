import { Flex, Container,Text, Link } from '@chakra-ui/react'
import { Roboto_Mono } from '@next/font/google'

export const font = Roboto_Mono({subsets: ['latin'], weight:'400'})

function HeaderTab(props: any) {
    return (
        <Flex
            borderRadius={8}
            justifyContent='center'
            _hover={{cursor: 'pointer'}}
            width='140px'
            background={props.active ? 'white' : 'transparent'}
            color={props.active ? 'black' : 'white'}
            height='100%'
            alignItems={'center'}
            >
                <Link 
                _hover={{ underline: 'none', opacity: '80'}}
                href={`/${props.link}`}>{props.name}</Link>
            
        </Flex>
    )
} 

export default function Header(props: any) {

  return ( 
    <>
    <Flex
        width='fit-content'
        height='40px'
        display={'flex'}
        flexDirection='row'
        gap='4px'
        background={'#1E1E1E'}
        color='white'
        borderRadius={12}
        textAlign='center'
        className={font.className}
        fontSize='14'
        marginBottom={'60px'}
        padding='5px'
        alignItems={'center'}
        justifyContent='center'
        >

        <HeaderTab name='Home' link="" active/>
        
        <HeaderTab name='Explore' link="explore"/>

    </Flex>
    </>
  )
}

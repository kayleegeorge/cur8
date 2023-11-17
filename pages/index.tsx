import { useEffect, useState } from 'react'
import { Text, Flex, InputGroup, Input, InputRightElement, Button, Box, Divider, Center, Spinner, InputLeftAddon, Stack, Link } from '@chakra-ui/react'
import { font } from '../components/Header'
import React from 'react'
import cors from 'cors'

export default function Home() {
    const [query, setQuery] = useState<string>("")
    const [numvids, setNumVids] = useState<string>("1")
    const [timeEstimate, setTimeEstimate] = useState<string>("1")
    const [loading, setLoading] = useState(false)
    const [searchRes, setSearchRes] = useState<string>("")
    const [vidPath, setVidPath] = useState<string>("")
    const [metaDataReady, setMetaDataReady] = useState(false)
    const [vidReady, setvidReady] = useState(false)
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [summary, setSummary] = useState<string>("")
    const [sumReady, setSumReady] = useState(false)
    const [elapsedTimeSecs, setElapsedTime] = useState<number>(0)
    const [queryIsLink, setQueryIsLink] = useState<boolean>(false)

    const api_url = 'https://enigmatic-thicket-61340.herokuapp.com/vidclip'
    const local_url = 'http://127.0.0.1:5000/vidclip'

    useEffect(() => {
      let timer: NodeJS.Timeout;

      if (startTime) {
        timer = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - startTime.getTime()) / 1000);
          setElapsedTime(elapsedTime);
        }, 1000);
      }

      return () => clearInterval(timer);
    }, [startTime]);

    const handleReset = async () => {
      setSumReady(false)
      setLoading(false)
      setSearchRes("")
      setVidPath("")
      setMetaDataReady(false)
      setvidReady(false)
    }

    function handleStartButtonClick() {
      setStartTime(new Date());
    }

    function handleStopButtonClick() {
      setStartTime(null);
      setElapsedTime(0);
    }  

    function getTimeEstimate(): string {
      return timeEstimate;
    }    

    const handleEverything = async () => {
      // setSumReady(false)
      setLoading(true)

      await handleSummary()
      await handleVid()

      setTimeEstimate(String(Math.floor((parseFloat(numvids) * 3)/1) + ' mins ' 
      + Math.floor((parseFloat(numvids) * 3 * 60) % 60) + ' secs '))
      handleStopButtonClick()
      handleStartButtonClick()
    }

    /* video clipping */
    const handleVid = async () => {
      if (query.includes("=")) {
        setQueryIsLink(true)
      }
      setLoading(true)
      setTimeEstimate(String(Math.floor((parseFloat(numvids) * 2.5)/1) + ' mins ' 
      + Math.floor((parseFloat(numvids) * 2.5 * 60) % 60) + ' secs '))
      handleStopButtonClick()
      handleStartButtonClick()
      fetch(local_url, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "Access-Control-Allow-Headers" : "Content-Type",
          'Access-Control-Allow-Origin' : '*',
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
          // 'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify({
          query: query,
          numVids: numvids
        }) // right now just sending the query string
      }).then(res => {
        if (res.ok) {
          return res.json() 
        } else {
          console.log('something is wrong')
        }
      }).then(data => {
        if (data.error) {
          console.log("no video highlights found")
          return
        }
        setVidPath(data.clipPath)
        console.log("video path", data.clipPath)
        setvidReady(true)
        setSearchRes(data.metadata)
        setLoading(false)
        setMetaDataReady(true)
        
      }).catch((e) => console.error(e))
    }


    /* summary creation */
    const handleSummary = async () => {
      setLoading(true)
      setTimeEstimate(String(Math.floor((parseFloat(numvids) * 0.25)/1) + ' mins ' 
      + Math.floor((parseFloat(numvids) * 0.25 * 60) % 60) + ' secs '))
      handleStopButtonClick()
      handleStartButtonClick()
      console.log('handle summary')
      fetch('http://127.0.0.1:5000/vidsummary', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Access-Control-Allow-Origin' : 'http://localhost:3000',
          // 'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify({
          query: query
        }) // right now just sending the query string
      }).then(res => {
        // console.log(res)
        if (res.ok) {
          return res.json() 
        } else {
          console.log('something is wrong')
        }
      }).then(data => {
        console.log(data)
        setSummary(data.text)
        setSumReady(true)
        // setSearchRes(data.metadata)
        setLoading(false)
        // setMetaDataReady(true)

      }).catch((e) => console.error(e))
    }

    return (
      <Flex width='800px'
      margin='auto'
      direction='column'>
        
        <Text
        color={'black'}
        className={font.className}
        fontWeight='800'
        fontSize='17px'
        marginBottom={'10px'}>
          How Curate works
        </Text>
        <Text
          color={'gray.900'}
          className={font.className}
          fontSize='15px'>
          You give us a query.
        </Text>

        <Text
          color={'gray.900'}
          className={font.className}
          fontSize='15px'>
          We give you a short highlight reel and written summary of a video matching that query. 
        </Text>

        <Center height='50px'>
         <Divider orientation='vertical' />
        </Center>
        <Stack>
        <Stack 
        direction='row' 
        spacing={3} 
        align='center' 
        justify = 'center'>
        <InputGroup size='md'>
        <Input
          focusBorderColor='#797EF6'
          isInvalid
          errorBorderColor='gray.100'
          variant='outline'
          color='black'
          pr='4.5rem'
          type='text'
          placeholder='Enter Youtube search query'
          _placeholder={{ opacity: 1, color: 'gray.500' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* <InputRightElement width='4.5rem' paddingRight='4px'>
          
        </InputRightElement> */}
        </InputGroup>
        <InputGroup>
        <InputLeftAddon children='# source videos' />
        <Input
          focusBorderColor='#797EF6'
          isInvalid
          errorBorderColor='gray.100'
          variant='outline'
          color='black'
          placeholder=''
          _placeholder={{ opacity: 1, color: 'gray.500' }}
            pr='4.5rem'
            type='number'
            min='1'
            max='10'
            defaultValue={1}
            value={numvids}
            onChange={(e) => setNumVids(e.target.value)}
          />
        </InputGroup>
        </Stack>
        <Stack 
        direction='row' 
        spacing={3} 
        align='center' 
        justify = 'center'>
        <Button 
          h='1.75rem' 
          size='sm' onClick={() => handleEverything()}
          background='gray.800'
          color='white'
          _hover={{ transition: '.3s', background:'#797EF6'}}
          >
            {'Highlight & Summarize'}
          </Button>
        <Button 
          h='1.75rem' 
          size='sm' onClick={() => handleVid()}
          background='gray.800'
          color='white'
          _hover={{ transition: '.3s', background:'#797EF6'}}
          >
            {'Highlight only'}
          </Button>
          <Button 
          h='1.75rem' 
          size='sm' onClick={() => handleSummary()}
          background='gray.800'
          color='white'
          _hover={{ transition: '.3s', background:'#797EF6'}}
          >
            {'Summarize only'}
          </Button>
          </Stack>
        </Stack>
        <Flex flexDirection={'column'} gap='40px'>
      <Flex flexDirection={'row'} 
      paddingTop='50px'
      gap='60px'>
        {loading && 
            <Flex 
            gap='12px'
            direction='row'
            color='black'
            className={font.className}>
              <Text>
                {'Query received. Curating your video.'}
              </Text>
              <Text>
              {'Estimated wait time: ' + getTimeEstimate()}
              <br/>
              {'Elapsed time: ' + Math.floor(elapsedTimeSecs/60) + ' mins ' + (elapsedTimeSecs%60) + " secs"}
              </Text>
            <Spinner/>
          </Flex>
        }
        {metaDataReady && <Flex 
        direction='column'
        color='black'
        className={font.className}
        >
        <Text fontWeight='800'>Video Data</Text>
        <Flex
        marginTop='8px'
        padding='10px'
        borderRadius='10px'
        background='gray.50'
        width='250px'
        fontSize='12'
        flexDirection={'column'}
        gap='2'>
          <Text> <Text as='span' fontWeight={600} flexDirection='row'>title: </Text> {JSON.parse(searchRes).title} </Text>
          <Text> <Text as='span' fontWeight={600} flexDirection='row'>channel: </Text> {JSON.parse(searchRes).channel} </Text>
          <Text> <Text as='span' fontWeight={600} flexDirection='row'>view count: </Text> {JSON.parse(searchRes).viewCount} </Text>
          <Text> <Text as='span' fontWeight={600} flexDirection='row'>date: </Text> {JSON.parse(searchRes).publishedAt.slice(0, 10)} </Text>
          <Text> <Text as='span' fontWeight={600} flexDirection='row'>original length: </Text> {JSON.parse(searchRes).originalLength} </Text> 
          <Text> <Text as='span' fontWeight={600} flexDirection='row'>link: </Text> <Link>{`https://youtube.com/watch?v=${JSON.parse(searchRes).id}`}</Link></Text>
        </Flex>
        
        </Flex>}
        {vidReady && <Flex 
        direction='column'
        color='black'
        className={font.className}
        >
          <Text fontWeight='800'>Highlight Video</Text>
            <Center marginTop={'2px'}>
              <video width="550" height="400" controls>
                <source src={`${vidPath}`} type="video/mp4" />
              Your browser does not support the video tag.
              </video>
            </Center>
        </Flex>}
        </Flex>
        {sumReady && <Flex 
        direction='column'
        color='black'
        className={font.className}
        >
          <Text fontWeight='800'>Summary</Text>
            <Center marginTop={'2px'}>
              <Box bg="gray.100" p="4" borderRadius="md" whiteSpace="pre-wrap">
                {summary}
              </Box>
            </Center>
        </Flex>}
        </Flex>
    </Flex>
    )
}

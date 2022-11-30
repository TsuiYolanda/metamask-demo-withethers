// src/components/ReadERC20.tsx
import React, {useEffect, useState } from 'react'
import {Divider, Text} from '@chakra-ui/react'
import {Box} from '@chakra-ui/react'
import {Image} from '@chakra-ui/react'
import {ERC20ABI as abi} from 'abi/ERC20ABI'
import {BigNumber, ethers} from 'ethers'
import { Contract } from "ethers"
import { keyframes, ThemeContext } from '@emotion/react'

interface Props {
    addressContract: string,
    currentAccount: string | undefined
}

declare let window: any

export default function ReadERC20(props:Props){
  const addressContract = props.addressContract
  const currentAccount = props.currentAccount
  const [totalSupply,setTotalSupply]=useState<string | undefined>()
  const [symbol,setSymbol]= useState<string | undefined>()
  const [balance, SetBalance] =useState<number|undefined>(undefined)
  const [TokenID,setTokenID]= useState<string | undefined>()
  const [TokenIDNum,setTokenIDNum]= useState<BigNumber|undefined>(undefined)
  const [TokenURL,setTokenURL]= useState<string | undefined>()
  const [TokenName,setTokenName] = useState<string | undefined>()
  const [TokenImg,setTokenImg] = useState<string | undefined>()
  const [TokenDesp,setTokenDesp] = useState<string | undefined>()
  const [TokenExternalUri,setTokenExternalUri] = useState<string | undefined>()

  useEffect( () => {
    if(!window.ethereum) return

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);

    provider.getCode(addressContract).then((result:string)=>{
      //check whether it is a contract
      if(result === '0x') return
    
      erc20.symbol().then((result:string)=>{
          setSymbol(result)
      }).catch((e:Error)=>console.log(e))

      erc20.totalSupply().then((result:string)=>{
          setTotalSupply(ethers.utils.formatUnits(result,0))
      }).catch((e:Error)=>console.log(e))

    })
    //called only once
  },[])  

  //call when currentAccount change
  useEffect(()=>{
    if(!window.ethereum) return
    if(!currentAccount) return
    console.log("accountchanged:",currentAccount)
    setTokenID(undefined)
    SetBalance(undefined)
    setTokenIDNum(undefined)
    setTokenURL(undefined)
    setTokenName(undefined)
    setTokenImg(undefined)
    setTokenDesp(undefined)
    setTokenExternalUri(undefined)

    queryTokenBalance(window)
    queryTokenID(window)
    // queryTokenData(window)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider)

    provider.getBlockNumber().then((blockNumber)=>{
      console.log("Current block number: " + blockNumber);
      provider.getBlock(blockNumber).then((blockinfo)=>{
      console.log("blockinfor",blockinfo)
      });
      provider.lookupAddress(currentAccount).then(function (address){
        console.log("ENS:"+address)
      })
    })

    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const fromMe = erc20.filters.Transfer(currentAccount, null)
    erc20.on(fromMe, (from, to, amount, event) => {
        console.log('Transfer|sent',  {from, to, amount, event} )
        queryTokenBalance(window)
        queryTokenID(window)
        // queryTokenData(window)
    })

    const toMe = erc20.filters.Transfer(null, currentAccount)
    erc20.on(toMe, (from, to, amount, event) => {
        console.log('Transfer|received',  {from, to, amount, event} )
        queryTokenBalance(window)
        queryTokenID(window)
        // queryTokenData(window)
    })

    // remove listener when the component is unmounted
    return () => {
        erc20.removeAllListeners(toMe)
        erc20.removeAllListeners(fromMe)
    }    
  }, [currentAccount])

  async function queryTokenBalance(window:any){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);
    console.log('currentAccount:'+currentAccount);
    erc20.balanceOf(currentAccount)
    .then((result:string)=>{
        SetBalance(Number(ethers.utils.formatUnits(result,0)))
    }).catch((e:Error)=>console.log(e))
  }

  async function queryTokenID(window:any){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);
    console.log('queryTokenData:currentAccount:'+currentAccount);
    const index : number= 0;
    console.log("tokenIDNum before:",TokenIDNum)
    window.alert("step1 tokenOfOwnerByIndex")
    erc20.tokenOfOwnerByIndex(currentAccount,index)
    .then((result:BigNumber)=>{
        console.log(result);
        setTokenID(ethers.utils.formatUnits(result,0));
        setTokenIDNum(result);
        console.log("tokenIDNum after:",TokenIDNum);
        queryTokenData(window)
  }).catch((e:Error)=>console.log(e))
  }

  async function queryTokenData(window:any){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);
    console.log('queryTokenData:currentAccount:'+currentAccount);
    window.alert("step2 tokenURI")
    erc20.tokenURI(TokenIDNum)
    .then((result:string)=>{
        console.log("tokenuri: "+result);
        console.log(result.replace("ar://","https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/"));
        const url = result.replace("ar://","https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/");
        setTokenURL(result.replace("ar://","https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/"));
        fetchTokenInfo(url);    
      }).catch((e:Error)=>console.log(e))
  }
  
  async function fetchTokenInfo(url:string) {
    window.alert("step3 fetch"+url)
    fetch(url,{method:'get'}).then(res=>res.json())
    .then(data => {
      console.log("result is ",data,data["name"],data["description"],data["image"],data["external_url"]);
      setTokenName(data["name"]);
      setTokenDesp(data["description"]);
      setTokenImg(data["image"].replace("ar://","https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/"));
      setTokenExternalUri(data["external_url"]);
      console.log("setTokenName",TokenName,"setTokenDesp",TokenDesp)
    }).catch(error=>console.log(error))
  }

  return (
    <Box w='100%' my={4}>
        {currentAccount  
          ? 
      <div>
      <Divider/>
        <Text my={4}><b>Contract</b>: {addressContract}</Text>
        <Text><b>Max Total Supply</b>: {totalSupply} {symbol}</Text>
        <Text my={4}><b>BALANCE</b>: {balance} {symbol}</Text>
      <Divider/>
      {TokenName?
      <Box boxSize='sm'>
      <Text my={4}><b>TokenID</b>: {TokenID}</Text>
      <Text my={4}><b>Token Name</b>: {TokenName}</Text>
      <Text my={4}><b>Token Description</b>: {TokenDesp}</Text>
      <Text my={4}><b>Token ExternalURI</b>: {TokenExternalUri}</Text>
      <Image src={(TokenImg)} alt='loading...' />
    </Box>
    :<></>}
    </div>
    : <></>}
    </Box>
  )

}
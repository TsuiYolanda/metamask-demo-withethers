// src/components/ReadERC20.tsx
import React, {useEffect, useState } from 'react'
import {Text} from '@chakra-ui/react'
import {Box} from '@chakra-ui/react'
import {Image} from '@chakra-ui/react'
import {ERC20ABI as abi} from 'abi/ERC20ABI'
import {BigNumber, ethers} from 'ethers'
import { Contract } from "ethers"
import { ThemeContext } from '@emotion/react'

interface Props {
    addressContract: string,
    currentAccount: string | undefined
}

declare let window: any

export default function ReadERC20(props:Props){
  const addressContract = props.addressContract
  const currentAccount = props.currentAccount
  const [totalSupply,setTotalSupply]=useState<string>()
  const [symbol,setSymbol]= useState<string>("")
  const [balance, SetBalance] =useState<number|undefined>(undefined)
  const [TokenID,setTokenID]= useState<string>("")
  const [TokenIDNum,setTokenIDNum]= useState<BigNumber|undefined>(undefined)
  const [TokenURL,setTokenURL]= useState<string>("")

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
          setTotalSupply(ethers.utils.formatEther(result))
      }).catch((e:Error)=>console.log(e))

    })
    //called only once
  },[])  

  //call when currentAccount change
  useEffect(()=>{
    if(!window.ethereum) return
    if(!currentAccount) return

    queryTokenBalance(window)
    queryTokenID(window)
    queryTokenData(window)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider)

    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const fromMe = erc20.filters.Transfer(currentAccount, null)
    erc20.on(fromMe, (from, to, amount, event) => {
        console.log('Transfer|sent',  {from, to, amount, event} )
        queryTokenBalance(window)
    })

    const toMe = erc20.filters.Transfer(null, currentAccount)
    erc20.on(toMe, (from, to, amount, event) => {
        console.log('Transfer|received',  {from, to, amount, event} )
        queryTokenBalance(window)
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
        SetBalance(Number(ethers.utils.formatEther(result)))
    }).catch((e:Error)=>console.log(e))
  }

  // https://goerli.etherscan.io/address/0x15987a0417d14cc6f3554166bcb4a590f6891b18#readContract
  // https://mp7hotepqeejjqfwsagp5be5ugq35nnkqgpfcxpzmcnw2ctwfhrq.arweave.net/Y_53TI-BCJTAtpAM_oSdoaG-taqBnlFd-WCbbQp2KeM
  // https://testnets.opensea.io/zh-CN/assets/goerli/0x15987a0417d14cc6f3554166bcb4a590f6891b18/156102
  async function queryTokenID(window:any){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);
    console.log('queryTokenData:currentAccount:'+currentAccount);
    const index : number= 0;
    erc20.tokenOfOwnerByIndex(currentAccount,index)
    .then((result:BigNumber)=>{
        console.log(result);
        setTokenID(ethers.utils.formatEther(result));
        setTokenIDNum(result);
  }).catch((e:Error)=>console.log(e))
  }

  async function queryTokenData(window:any){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);
    console.log('queryTokenData:currentAccount:'+currentAccount);
    // console.log(ethers.utils.parseEther(TokenID));
    erc20.tokenURI(TokenIDNum)
    .then((result:string)=>{
        // SetBalance(Number(ethers.utils.formatEther(result)))
        console.log("imageurl: "+result);
        console.log(result.replace("ar://","https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/"));
        const url = result.replace("ar://","https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/");
        setTokenURL(result.replace("ar://","https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/"));
        fetchTokenInfo(url);    
      }).catch((e:Error)=>console.log(e))
  }
  
  async function fetchTokenInfo(url:string) {
    fetch(TokenURL,{method:'get'}).then(res=>res.json())
    .then(data => {
      console.log("result is ",data)
      console.log(data[image])
    }).catch(error=>console.log(error))
  }



  return (
    <div>
        <Text><b>ERC20 Contract</b>: {addressContract}</Text>
        <Text><b>ClassToken totalSupply</b>:{totalSupply} {symbol}</Text>
        <Text my={4}><b>ClassToken in current account</b>: {balance} {symbol}</Text>
        <Text my={4}><b>TokenID</b>: {balance} {symbol}</Text>
        <Box boxSize='sm'>
         <Image src={(TokenURL)} alt='test' />
        </Box>
    </div>
  )
}
//  {/* <Image src='https://r6xtd6cyukdv25xoj32pwpjc2gbxqvwej4tbdkwljnx7skm2w4wq.arweave.net/j68x-Fiih1127k70-z0i0YN4VsRPJhGqy0tv-Smaty0' alt='Dan Abramov' /> */}
         
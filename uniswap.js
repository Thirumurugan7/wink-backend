const { ethers } = require("ethers")
const UNISWAP = require("@uniswap/sdk")
const fs = require('fs');
const { Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent} = require("@uniswap/sdk");
const { getAddress } = require("ethers/lib/utils");

const QUICKNODE_HTTP_ENDPOINT = "https://green-palpable-dinghy.base-mainnet.quiknode.pro/bfc937165f25bbb796baa4139261f339b89ba5bf/"
let provider = new ethers.providers.getDefaultProvider(QUICKNODE_HTTP_ENDPOINT)
const privateKey = "2c185c3d25c541d69a7bdeb4f6b9dcbb2a6389d18e0821399bc1e4dea988511c"
const wallet = new ethers.Wallet(privateKey, provider)
UNISWAP_ROUTER_ADDRESS = "0x2626664c2603336E57B271c5C0b26F421741e481"
UNISWAP_ROUTER_ABI = fs.readFileSync("./abi.json").toString()
UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, provider)
const DAI = new Token(
   "8453",
    "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
    18,
    "ULTT",
    "ULTtest"

);
//8453"

const func = () =>{
    console.log("uscsdcs");
    console.log("cont",UNISWAP_ROUTER_CONTRACT);
    console.log(DAI);
}

// func()


async function swapTokens(token1, token2, amount, slippage = "50") {

    try {
        const pair = await Fetcher.fetchPairData(token1, token2, provider); //creating instances of a pair
        const route = await new Route([pair], token2); // a fully specified path from input token to output token
        let amountIn = ethers.utils.parseEther(amount.toString()); //helper function to convert ETH to Wei
        amountIn = amountIn.toString()

        const slippageTolerance = new Percent(slippage, "10000"); // 50 bips, or 0.50% - Slippage tolerance

        const trade = new Trade( //information necessary to create a swap transaction.
            route,
            new TokenAmount(token2, amountIn),
            TradeType.EXACT_INPUT
        );

        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
        const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
        const path = [token2.address, token1.address]; //An array of token addresses
        const to = wallet.address; // should be a checksummed recipient address
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
        const value = trade.inputAmount.raw; // // needs to be converted to e.g. hex
        const valueHex = await ethers.BigNumber.from(value.toString()).toHexString(); //convert to hex string

        //Return a copy of transactionRequest, The default implementation calls checkTransaction and resolves to if it is an ENS name, adds gasPrice, nonce, gasLimit and chainId based on the related operations on Signer.
        const rawTxn = await UNISWAP_ROUTER_CONTRACT.populateTransaction.swapExactETHForTokens(amountOutMinHex, path, to, deadline, {
            value: valueHex
        })

        //Returns a Promise which resolves to the transaction.
        let sendTxn = (await wallet).sendTransaction(rawTxn)


        //Resolves to the TransactionReceipt once the transaction has been included in the chain for x confirms blocks.
        let reciept = (await sendTxn).wait()

        //Logs the information about the transaction it has been mined.
        if (reciept) {
            console.log(" - Transaction is mined - " + '\n' +
                "Transaction Hash:", (await sendTxn).hash +
                '\n' + "Block Number: " +
                (await reciept).blockNumber + '\n' +
                "Navigate to https://etherscan.io/tx/" +
                (await sendTxn).hash, "to see your transaction")
        } else {
            console.log("Error submitting transaction")
        }

    } catch (e) {
        console.log(e)
    }
}

swapTokens(DAI, WETH[DAI.chainId], .00420) //first argument = token we want, second = token we have, the amount we want



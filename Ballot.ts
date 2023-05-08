import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
dotenv.config();
const address="";


function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }
async function main() {
 // console.log(process.argv);
 const wallet=new  ethers.Wallet(process.env.PRIVATE_KEY ?? "");
  console.log(`Using the wallet address: ${wallet.address}`)
 console.log("Alchemy key : " + process.env.ALCHEMY_API_KEY?.length);
 const provider = new ethers.providers.EtherscanProvider("sepolia", process.env.ETHERSCAN_API_KEY);
 //const provider=new ethers.providers.AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);
 const lastBlock=await provider.getBlock("latest");
 console.log(`The last block is ${lastBlock.number}`)
 const signer=wallet.connect(provider);
 const balance=await signer.getBalance();
 console.log(`Balance of ${signer.address}, is ${balance} WEI`);
 
  const voeterAddress = process.argv.slice(2);
  const PROPOSALS = process.argv.slice(3);
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  //const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotFactory=new Ballot__factory(signer);

        const ballotContract=await ballotFactory.deploy(convertStringArrayToBytes32( PROPOSALS));
                await ballotContract.deployed();
        const deployTxn=await ballotContract.deployTransaction.wait();
        console.log(`The Ballot contract is deployed at ${ballotContract.address}`)
        console.log(` deployed block ID: ${deployTxn.blockNumber}`)
        const chairperson=await ballotContract.chairperson();
        console.log(`Chairperson: ${chairperson}`)
        console.log(`Giving right to vote to address: ${voeterAddress}`)
        const giveRightToVote=await ballotContract.giveRightToVote(voeterAddress);
        const giveRightToVoteReceipt= await giveRightToVote.wait();
        console.log(`The giveRightToVoteReceipt txn hash is ${giveRightToVoteReceipt.transactionHash}, included at the block ID: ${giveRightToVoteReceipt.blockNumber}}`)
  // TODO
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

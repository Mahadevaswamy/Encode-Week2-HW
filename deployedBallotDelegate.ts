import { ethers } from "hardhat";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const wallet=new  ethers.Wallet(process.env.PRIVATE_KEY ?? "");
  console.log(`Using the wallet address: ${wallet.address}`)
  
  // const provider = new ethers.providers.EtherscanProvider("sepolia", process.env.ETHERSCAN_API_KEY);
  const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_KEY);
  const lastBlock=await provider.getBlock("latest");
  console.log(`The last block is ${lastBlock.number}`)
  let signer=wallet.connect(provider);
  const balance=await signer.getBalance();
  console.log(`Balance of ${signer.address}, is ${balance} WEI`);

  signer = wallet.connect(provider);

  const jsonString = fs.readFileSync('artifacts/contracts/Ballot.sol/Ballot.json', 'utf-8');
  const abi = JSON.parse(jsonString).abi;
 
  const ballotInstance = await ethers.getContractAt(abi, "0xf614a8a6f7a14713fce9c53382d022fa727696d4", signer );

  // console.log(ballotInstance);

  let chainperson = await ballotInstance.chairperson();
  console.log (`ChairPerson : ${chainperson}`);

  console.log (`Winner : ${await ballotInstance.winnerName()}`);

  let delegatedTo = process.argv[2];
  let tx = await ballotInstance.delegate(delegatedTo);
  let receipt = await tx.wait();
  console.log (`Vote Delegate To : ${delegatedTo}, by ${signer.address} `);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

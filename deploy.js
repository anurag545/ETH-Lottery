const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
 const {interface, bytecode} = require('./compile');
 const provider = new HDWalletProvider (
     'merge axis innocent panda erase action romance leaf kiwi couch else option',
     'https://rinkeby.infura.io/v3/cd80a35d374540f2b9a0988d709e8cd7'
 );

 const web3 = new Web3(provider);

 const deploy = async () => {
    accounts = await web3.eth.getAccounts();
    // Use one of those accounts to deploy the contract
    console.log("attempting to deploy from account"+accounts[0]);
    const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: '0x'+ bytecode})
    .send({from: accounts[0]});
    console.log("interface  " + interface);
    console.log("contract deploy at address " + result.options.address);
 }
 deploy();
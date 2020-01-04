const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

let {interface, bytecode} = require('../compile.js');

let accounts;
let lottery;
beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();
    // Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: '0x'+ bytecode})
    .send({from: accounts[0], gas: 4712388,
        gasPrice: 100000000000});
    // web3.eth.getAccounts()
    // .then(fetchedAccounts => {
    //     console.log(fetchedAccounts);
    // });
    lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        console.log(lottery);
        assert.ok(lottery.options.address);
    });

    it('allows one account to be added', async () => {
        await lottery.methods.enter().send({
            from:accounts[0],
            value:web3.utils.toWei('0.02','ether')
        })

        const players = await lottery.methods.getPlayers().call({
            from:accounts[0]
        })

        assert.equal(accounts[0],players[0]);
        assert.equal(1,players.length);
    });

    it('allows multiple account to be added', async () => {
        await lottery.methods.enter().send({
            from:accounts[0],
            value:web3.utils.toWei('0.02','ether')
        })

        await lottery.methods.enter().send({
            from:accounts[1],
            value:web3.utils.toWei('0.02','ether')
        })

        await lottery.methods.enter().send({
            from:accounts[2],
            value:web3.utils.toWei('0.02','ether')
        })

        const players = await lottery.methods.getPlayers().call({
            from:accounts[0]
        })

        assert.equal(accounts[0],players[0]);
        assert.equal(accounts[1],players[1]);
        assert.equal(accounts[2],players[2]);
        assert.equal(3,players.length);
    });

    it('requires minimum amount of ether',async () => {
        try{
            await lottery.methods.enter().send({
            from: accounts[0],
            value:0
            });
            assert(false);
        } catch(err) {
            assert(err)
        }
    });

    it('only manager can call pickwinner', async () => {
        try{
            await lottery.methods.pickWinner().send({
            from: accounts[1]
            });
            assert(false);
        } catch(err) {
            assert(err)
        }
    });

    it('sends money to the winner and reset the players', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether')
        })
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from:accounts[0]})
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.8','ether'));
    });
})
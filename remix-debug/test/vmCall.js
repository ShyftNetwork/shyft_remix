'use strict'
var utileth = require('@shyftnetwork/shyft_ethereumjs-util')
var Tx = require('@shyftnetwork/shyft_ethereumjs-tx')
var Block = require('@shyftnetwork/shyft_ethereumjs-block')
var BN = require('@shyftnetwork/shyft_ethereumjs-util').BN
var remixLib = require('@shyftnetwork/shyft_remix-lib')

function sendTx (vm, from, to, value, data, cb) {
  var tx = new Tx({
    nonce: new BN(from.nonce++),
    gasPrice: new BN(1),
    gasLimit: new BN(3000000, 10),
    to: to,
    value: new BN(value, 10),
    data: Buffer.from(data, 'hex')
  })
  tx.sign(from.privateKey)
  var block = new Block({
    header: {
      timestamp: new Date().getTime() / 1000 | 0,
      number: 0
    },
    transactions: [],
    uncleHeaders: []
  })
  vm.runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}, function (error, result) {
    setTimeout(() => {
      cb(error, utileth.bufferToHex(tx.hash()))
    }, 500)
  })
}

/*
  Init VM / Send Transaction
*/
function initVM (st, privateKey) {
  var utileth = require('@shyftnetwork/shyft_ethereumjs-util')
  var VM = require('@shyftnetwork/shyft_ethereumjs-vm')
  var Web3Providers = remixLib.vm.Web3Providers
  var address = utileth.privateToAddress(privateKey)
  var vm = new VM({
    enableHomestead: true,
    activatePrecompiles: true
  })
  vm.stateManager.putAccountBalance(address, 'f00000000000000001', function cb () {})
  var web3Providers = new Web3Providers()
  web3Providers.addVM('VM', vm)
  web3Providers.get('VM', function (error, obj) {
    if (error) {
      var mes = 'provider TEST not defined'
      console.log(mes)
      st.fail(mes)
    } else {
      vm.web3 = obj
    }
  })
  return vm
}

module.exports = {
  sendTx: sendTx,
  initVM: initVM
}

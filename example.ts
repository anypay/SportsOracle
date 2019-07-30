let BITBOX = require('bitbox-sdk').BITBOX;
let bitbox = new BITBOX();
const jeton = require('jeton-lib')
const PrivateKey = jeton.PrivateKey
const PublicKey = jeton.PublicKey
const Signature = jeton.Signature
const OutputScript = jeton.escrow.OutputScript
const Transaction = jeton.Transaction

import * as lib from './lib/bet'

( async()=>{

// Create the output script
var refpk = new PublicKey('0279b69db08872406242378595e361f97da0346e317ba4cf8d3cba051ec5132a1b')
var stevenpk = new PublicKey('02ecebefd71a9e5810b6e9eb7c13827aea84264a626e1b09e570623cef156b24a6')
var vinpk = new PublicKey('02ca264cf2494aba22321a0cacad497a165dc40b63eb2e17a963f46ddc61f12397')


var outputScriptData = {
    refereePubKey: refpk,
    parties: [
        {message: 'padreswin', pubKey: stevenpk},
        {message: 'marlinswin', pubKey: vinpk}
    ]
}
let outScript = new OutputScript(outputScriptData)


  let utxos = await lib.getEscrowUTXOS( outScript.toAddress().toString()) 


  var refPriv = new PrivateKey("57bda0164fe2a9832c29b7b3d0ed4fc821255513ac65fd923450baeeaa0133e8")
  var refereeSig = Signature.signCDS('padreswin', refPriv)

  // Make Transaction from escrow UTXO
  let sighash = (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID)

  try{
   for( let i=0; i<utxos.length;i++){

     let amountToSpend = utxos[i].satoshis - 750


     let spendTx = new Transaction()
       .from(utxos[i]) // then another transaction for utxo2
       .to("bitcoincash:qrdsefutwty8u3mxgms7z06lfkwm85y3ave6c5707j", amountToSpend)


     let winnerPriv = new PrivateKey("967f8aee18f1310690aa57340306c092454d98c3544ac6d021915ff6e0cc2581")

     spendTx.signEscrow(0, winnerPriv , 'padreswin', refereeSig, outScript.toScript(), sighash)

     let tx = await bitbox.RawTransactions.sendRawTransaction(spendTx.toString())

     console.log('tx',tx)
   }
   }catch(error){

     console.log(error)
       
   }

})()

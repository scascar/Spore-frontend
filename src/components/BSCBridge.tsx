import React, { useState } from 'react';
import Web3 from 'web3';
//@ts-ignore
import { ethers } from "ethers";

import './BSCBridge.css';
import { useEffect } from 'react';
import { AVAX_SPORE_ABI, AVAX_BRIDGE_ABI, BSC_BRIDGE_ABI, BSC_SPORE_ABI } from '../utils/abis';

const win = window as any
const docu = document as any

const connectMetaMask = async () => {
    if (win.ethereum) {
        win.web3 = new Web3(win.ethereum);
        win.ethereum.enable();
    } else { console.log("Already connected to MetaMask") }
}

const getNetworkId = async () => {
    const networks = new Map();
    networks.set("97", "BSC Testnet")
    networks.set("56", "Binance Smart Chain")
    networks.set("43114", "Avalanche")
    networks.set("43113", "Fuji Testnet")
    return "Network : " + networks.get(win.ethereum.networkVersion);
}

const approve = async () => {
    const SporeAddress = "0x6e7f5C0b9f4432716bDd0a77a3601291b9D9e985";
    const AvaxBridgeAdress = "0x1aFCEF48379ECad5a6D790cE85ad1c87458C0f07";
    const SporeContract = new win.web3.eth.Contract(
        AVAX_SPORE_ABI,
        SporeAddress
    );
    var account = await win.web3.eth.getAccounts();
    account = account[0];
    var amount = ethers.BigNumber.from(docu.getElementById("spores").value).mul(10 ** 9);
    try {
        await SporeContract.methods
            .approve(AvaxBridgeAdress, amount)
            .send({ from: account, gasPrice: 225000000000 });
    } catch (error) {
        alert(error);
    }
}

const swapFromAVAX = async () => {
    const AvaxBridgeAdress = "0x1aFCEF48379ECad5a6D790cE85ad1c87458C0f07";
    const AvaxBridgeContract = new win.web3.eth.Contract(AVAX_BRIDGE_ABI, AvaxBridgeAdress);
    var account = await win.web3.eth.getAccounts();
    account = account[0];
    var amount = ethers.BigNumber.from(docu.getElementById("spores").value).mul(10 ** 9);
    var fees = ethers.BigNumber.from("30000000000000000")
    try {
        await AvaxBridgeContract.methods
            .burn(amount)
            .send({ from: account, gasPrice: 225000000000, value: fees });
    } catch (error) {
        alert(error);
    }
}

const swapFromBSC = async () => {
    const BscBridgeAdress = "0x638E8FE7AD4D9C05735Ecb6b9c66013679276651";
    const BscBridgeContract = new win.web3.eth.Contract(BSC_BRIDGE_ABI, BscBridgeAdress);
    var account = await win.web3.eth.getAccounts();
    account = account[0];
    var amount = ethers.BigNumber.from(docu.getElementById("spores2").value).mul(10 ** 9);
    var fees = ethers.BigNumber.from("5000000000000000")
    try {
        if (docu.getElementById("checkbox").checked) {
            var percent = 10;
            await BscBridgeContract.methods
                .burnAndSwap(account, amount, percent)
                .send({ from: account, value: fees });
        } else {
            await BscBridgeContract.methods
                .burn(account, amount)
                .send({ from: account, value: fees });
        }
    } catch (error) {
        alert(error);
    }
}


const getSporeInWalletAVAX = async () => {
    const SporeAddress = "0x6e7f5C0b9f4432716bDd0a77a3601291b9D9e985";
    const SporeContract = new win.web3.eth.Contract(
        AVAX_SPORE_ABI,
        SporeAddress
    );
    var account = await win.web3.eth.getAccounts();
    account = account[0];
    try {
        var spores = await SporeContract.methods.balanceOf(account).call();
        console.log(spores)
        return spores
    } catch (error) {
        console.log(error);
        return 0
    }
}
const getSporeInWalletBSC = async () => {
    const SporeAddress = "0x33A3d962955A3862C8093D1273344719f03cA17C";
    const SporeContract = new win.web3.eth.Contract(
        BSC_SPORE_ABI,
        SporeAddress
    );
    var account = await win.web3.eth.getAccounts();
    account = account[0];
    try {
        var spores = await SporeContract.methods.balanceOf(account).call();
        console.log(spores)
        return spores
    } catch (error) {
        console.log(error);
        return 0
    }
}

const setMaxSporeAVAX = async () => {
    var maxSpores = await getSporeInWalletAVAX();
    docu.getElementById("spores").value = maxSpores / 10 ** 9;
}

const setMaxSporeBSC = async () => {
    var maxSpores = await getSporeInWalletBSC();
    docu.getElementById("spores2").value = maxSpores / 10 ** 9;
}

const BSCBridge = () => {
    const [numberOfSporeAVAX, setNumberOfSporeAVAX] = useState(0)
    const [numberOfSporeBSC, setNumberOfSporeBSC] = useState(0)
    const [feesBNB] = useState(0.005)
    const [feesAVAX] = useState(0.03)
    const [network, setNetwork] = useState<any>(<button onClick={connectMetaMask} className="btn btn-light">Connect wallet </button>)

    // network: <button onClick={connectMetaMask} className="btn btn-light">Connect wallet </button>,
    useEffect(() => {
        async function startup() {
            const script = document.createElement("script");
            script.src = "/bscbridge.js";
            script.async = true;
            document.body.appendChild(script);
            connectMetaMask();
            var numberOfSporeAVAX = await getSporeInWalletAVAX() / 10 ** 9;
            var numberOfSporeBSC = await getSporeInWalletBSC() / 10 ** 9;
            var nid = await getNetworkId();
            setNumberOfSporeAVAX(numberOfSporeAVAX)
            setNumberOfSporeBSC(numberOfSporeBSC)
            setNetwork(nid)

        }
        startup()

    }, [])

    return (
        <div className="container py-5" id="bridge">
            <div className="row py-5">
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-lg-8">
                            <h2>AVALANCHE / BSC SPORE BRIDGE</h2>
                        </div>
                        <div className="col-lg-4 text-right">
                            {network}
                        </div>
                    </div>
                    <div className="wrapBridge pt-2">
                        <div className="row rowBridge">
                            <div className="col-lg-6 col-coin pr-lg-0">
                                <div className="card px-lg-5 rounded-0 h-100 avalanche">
                                    <div className="card-body">
                                        <h5 className="card-title"><span>FROM</span> Avalanche </h5>
                                        <p className="card-text">Balance : {numberOfSporeAVAX}</p>
                                        <div className="input-group">
                                            <input type="text" className="form-control" id="spores" placeholder="0.0" />
                                            <div className="input-group-append">
                                                <button className="btn btn-outline-secondary white" onClick={setMaxSporeAVAX} type="button">MAX</button>
                                            </div>
                                        </div>
                                        <div className="offset-lg-3 col-lg-6 text-center py-1">
                                            <button onClick={approve} className="btn btn-primary" id="approve-btn">APPROVE</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-coin pr-lg-0 d-none">
                                <div className="card px-lg-5 rounded-0 h-100 avalanche" id="reverted-1">
                                    <div className="card-body">
                                        <h5 className="card-title"><span>TO </span>  Avalanche </h5>
                                    </div>
                                </div>
                            </div>
                            <div className="arrow"><button className="btn btn-outline-light inverted" id="btn-arrow"><i className="fa fa-arrow-right"></i></button></div>
                            <div className="col-lg-6 col-coin pl-lg-0" id="reverted-2">
                                <div className="card px-lg-5 rounded-0 h-100 binance">
                                    <div className="card-body">
                                        <h5 className="card-title"><span>TO</span> Binance Smart Chain </h5>

                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-coin pl-lg-0 d-none">
                                <div className="card px-lg-5 rounded-0 h-100 binance">
                                    <div className="card-body">
                                        <h5 className="card-title"><span>FROM</span> Binance Smart Chain </h5>
                                        <p className="card-text">Balance : <span id="balance">{numberOfSporeBSC}</span></p>
                                        <div className="input-group">
                                            <input type="text" className="form-control" id="spores2" placeholder="0.0" />
                                            <div className="input-group-append">
                                                <button className="btn btn-outline-secondary white" type="button" onClick={setMaxSporeBSC}>MAX</button>
                                            </div>
                                        </div>
                                        <label className="py-2"><input type="checkbox" id="checkbox" name="pay-fees-spore" value="1" /> Swap some SPORE for AVAX (10%) </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="offset-lg-3 col-lg-6 text-center py-4 col-coin">
                                Transfer fees : {feesAVAX} AVAX
                                <button onClick={swapFromAVAX} className="btn btn-primary btn-lg w-100" id="swap-btn">TRANSFER</button>
                            </div>
                            <div className="offset-lg-3 col-lg-6 text-center py-4 col-coin d-none">
                                Transfer fees : {feesBNB} BNB
                                <button onClick={swapFromBSC} className="btn btn-primary btn-lg w-100" id="swap-btn">TRANSFER</button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="offset-lg-3 col-lg-6 text-center py-4">
                                <h3>Disclaimer: this is a version alpha. Use at your own risk</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default BSCBridge
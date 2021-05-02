import React from "react";
import Web3 from "web3";
import { useState, useEffect } from 'react';
import { SPORE_MARKET_ABI } from "../utils/abis";

const win = window as any
const docu = document as any

const putNFTForSale = async () => {

  const SporeMarketv1 = new win.web3.eth.Contract(
    SPORE_MARKET_ABI,
    "0x9BAa8ADD7E43e1ff0Ed60E37782d03C50151c817"
  );
  var _tokenIDforSale = docu.getElementById("_tokenIDforSale").value;
  var _price = docu.getElementById("_price").value;

  var account = await win.web3.eth.getAccounts();
  account = account[0];
  console.log(account);

  try {
    await SporeMarketv1.methods
      .setTokenPrice(_tokenIDforSale, _price)
      .send({ from: account, gasPrice: 225000000000 });
  } catch (error) {
    alert(error);
  }
}

type Props = {
  tokensOfOwner: Array<any>
}

const ReturnTokenURI = (props: Props) => {
  const [data, setData] = useState(new Array<any>())

  useEffect(() => {
    async function startup() {
      ;
      const SporeMarketv1 = new win.web3.eth.Contract(
        SPORE_MARKET_ABI,
        "0x9BAa8ADD7E43e1ff0Ed60E37782d03C50151c817"
      );
      var account = await win.web3.eth.getAccounts();
      account = account[0];
      console.log("returntokenURI component");
      console.log(props.tokensOfOwner);
      const promises = [];

      for (let i = 0; i < props.tokensOfOwner.length; i++) {
        const promisestokenURIs = await SporeMarketv1.methods
          .tokenURI(props.tokensOfOwner[i])
          .call();
        promises.push(promisestokenURIs);
      }
      console.log("hi0");

      Promise.all(promises).then((values) => {
        console.log(values);
        setData(values)
      });
    }
    startup()


  }, [])


  return (
    <>
      {data.map((image) => (
        <div key={image} className="col-md-3 text-center"><img className="rounded shadow" src={image} height="200" /></div>
      ))}
      <div className="col-md-12">
        <p className="pt-5">
          You own the IDs:{" "}
          {props.tokensOfOwner.map((ID) => (
            <>{ID},</>
          ))}
        </p>
        <div className="input-group">
          <input type="text" id="_tokenIDforSale" className="form-control float-left" placeholder="NFT_ID" />
          <input type="text" id="_price" className="form-control float-left" placeholder="Price" />
          <div className="input-group-append">
            <button onClick={putNFTForSale} className="btn btn-primary">Put NFT for Sale</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReturnTokenURI
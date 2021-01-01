import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import metamask from "./metamask_example.png"
import "./App.css";
import { analyseTxData, ArgDecoded } from "@eth_double_checker/utils";
import GnosisSafe from "./abis/GnosisSafe.json";
import ERC20 from "./abis/ERC20.json";

const colors = ["#d4ebc3", "#c3c3eb", "#e0c3eb", "#ebc3c3"];

function Arg({ arg, layer = 0 }: { arg: ArgDecoded; layer?: number }) {
  const functionIndent = layer * 3 + "em";
  return (
    <div className="Arg">
      {layer > 0 && (
        <div>
          <span>
            {arg.type} {arg.name}:{" "}
          </span>
          {ethers.BigNumber.isBigNumber(arg.raw) ? (
            <span>{arg.raw.toString()},</span>
          ) : (
            <span>{JSON.stringify(arg.raw)},</span>
          )}
        </div>
      )}
      {arg.funcFragment && (
        <div
          style={{
            marginLeft: functionIndent,
            marginTop: "1em",
            padding: "0.8em",
            borderRadius: "1em",
            backgroundColor: colors[layer % colors.length],
          }}
        >
          {layer > 0 && <b>Found an encoded function call !</b>}
          <div>
            <b>{arg.funcFragment.name + "("}</b>
            {arg.parsedArgs &&
              arg.parsedArgs.map((arg, i) => (
                <ul key={i}>
                  <li>
                    <Arg arg={arg} layer={layer + 1} />
                  </li>
                </ul>
              ))}
          </div>
          <b>{")"}</b>
        </div>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState<string>(
    "0x6a7612020000000000000000000000004ba1a50aecba077acdf4625bf9adb3fe964eea170000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008b67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000064f8dc5dd90000000000000000000000000532fb8f096decb82ace8b3f67f5c11aebe02c140000000000000000000000004421e2bde12fabbd4306642e8ec73a5d2d87d99a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000821706fbbe2f5021d28a9323e4e804ececb8b4c96f056746f8d50fb1610817ee100ae268c83a04238bc87ad19c1880f2a5f1055e3ee2fe86d5b2a5cbd2c3bfb8ae1b000000000000000000000000e6220257d157ec7b481290fd10d2037cf0e83ea5000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000"
  );
  const [decodedData, setDecodedData] = useState<ArgDecoded>({
    raw: "loading...",
  });

  const [knownInterfaces, ] = useState([
    new ethers.utils.Interface(GnosisSafe.abi),
    new ethers.utils.Interface(ERC20.abi),
  ]);

  useEffect(() => {
    setDecodedData(analyseTxData(data, knownInterfaces));
  }, [data, knownInterfaces]);

  return (
    <div className="App">
      <div className="Title">
        <h1>Ethereum TX input data checker</h1>
        <h3>Double check transaction input data before signing and broadcasting</h3>
        <h4>Gnosis Safe: parse encoded calldata to check token transfers and contract interactions</h4>
        <h4>Supported interfaces: GnosisSafe, ERC20</h4>
      </div>
      <img  src={metamask} alt="Metamask example" height="400"></img>
      <h2>Input data:</h2>
      <textarea value={data} onChange={(e) => setData(e.target.value)} />
      <Arg arg={decodedData} />
    </div>
  );
}

export default App;

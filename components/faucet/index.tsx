"use client"
import React, { useState, useEffect } from 'react';
import {
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { useDebounce } from './useDebounce';

import { Image, Button, Input } from "@nextui-org/react";

export const Faucet = () => {

  const [addressFaucet, setAddressFaucet] = useState<any>(null)
  const debouncedAddressFaucet = useDebounce(addressFaucet, 500)

  const handleChangeAddress = (event: any) => {
    setAddressFaucet(event.target.value);
  };

  const { config: configFaucet } = usePrepareContractWrite({
    address: `0x${process.env.FAUCET_ADDRESS?.slice(2)}`,
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_token",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_to",
            "type": "address"
          }
        ],
        "name": "getJoy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: "getJoy",
    args: [debouncedAddressFaucet],
  });

  const {
    data: faucetData,
    writeAsync: setFaucetAsync,
    error: errorFaucet,
  } = useContractWrite(configFaucet);

  const onFaucet = () => {
    setFaucetAsync?.();
  };
  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          <div className="flex flex-col gap-2">
            
                <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                  <Image
                    width={150}
                    alt="joy gotchi"
                    src="/gotchi/coin.gif"
                  />
                </section>

                <Input
                  type="address"
                  label="Input your Address"
                  className="w-full"
                  color={"primary"}
                  onChange={handleChangeAddress}
                />
                <br />
                <Button color="primary" className="w-full" onPress={onFaucet}>
                  faucet $Joy Token
                </Button>
          </div>
        </div>
      </div>
    </div >
  );
}

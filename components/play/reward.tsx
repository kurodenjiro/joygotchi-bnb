"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Image, Button } from "@nextui-org/react";
import { nftAbi } from './abi';
import { readContracts, watchAccount, writeContract, prepareWriteContract } from '@wagmi/core'

import {
    useAccount,
} from "wagmi";
export const Reward = () => {
    const [ownPet, setOwnPet] = useState<any>(null)
    const [ownPetId, setOwnPetId] = useState<any>(null)
    const { address } = useAccount();

    const fetchMyAPI = async () => {

        const pet = localStorage.getItem('pet');
        let petId: any = null;
        if (pet) {
            petId = BigInt(pet)
            const Info: any = await readContracts({
                contracts: [
                    {
                        address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
                        abi: nftAbi,
                        functionName: 'getPetInfo',
                        args: [petId],
                    }
                ],
            })
            setOwnPet(Info[0].result)
            setOwnPetId(pet);
        }
    }

    useEffect(() => {
        fetchMyAPI()
    }, [])
    
    const onRedeem = async () => {
        const config = await prepareWriteContract({
            address: `0x${address?.slice(2)}`,
            abi: nftAbi,
            functionName: "redeem",
            args: [ownPetId]
        })
        const tx = await writeContract(config);
        if (tx) {
            console.log("tx", tx);
            fetchMyAPI()
        }
    }

    return (
        <div className="pt-20">
            <Card className="pt-3">
                <CardHeader className="flex gap-3">
                    <Image
                        width={250}
                        alt="joy gotchi"
                        src="/gotchi/money.gif"
                    />
                    <div className="flex flex-col">
                        <p className="text-md">BURN PET SCORE </p>
                        <p className="text-md">{ownPet && ownPet[0]}#{ownPetId}</p>
                        <p className="text-small text-default-500"> {ownPet && ownPet[2].toString()}</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <h1>RECEIVE:{ownPet && ownPet[8].toString()} {process.env.SYMBOL}</h1>
                </CardBody>
                <Divider />
            </Card>
            <br />
            <Button color="primary" className="w-full" onPress={onRedeem}>
                Claim
            </Button>
        </div>
    );
}
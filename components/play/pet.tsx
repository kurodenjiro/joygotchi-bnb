"use client"
import React from "react";
import { Progress } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Select, SelectItem, Tooltip, Button } from "@nextui-org/react";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import { button as buttonStyles } from "@nextui-org/theme";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Image } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Checkbox } from "@nextui-org/react";
import { useDebounce } from './useDebounce'
import { nftAbi, tokenAbi } from './abi';

import {
    usePrepareContractWrite,
    useContractWrite,
    useContractRead,
    useWaitForTransaction,
    useAccount,
    useConnect,
    useNetwork,
    useSwitchNetwork
} from "wagmi";
import { readContracts, watchAccount, writeContract, prepareWriteContract } from '@wagmi/core'
import CountDownTimer from "./CountDownTimer";
import Slider from "react-slick";

const MAX_ALLOWANCE = BigInt('20000000000000000000000')



export const Pet = () => {
    const [petData, setPetData] = React.useState<any>(null)
    const [isPet, setIsPet] = React.useState<any>(true)
    const [itemData, setItemData] = React.useState<any>(null)
    const [isAddress, setIsAddress] = React.useState<any>(false)
    const [isChain, setIsChain] = React.useState<any>(false)
    const [selectedPet, setSelectedPet] = React.useState<any>(null)
    const [ownPet, setOwnPet] = React.useState<any>(null)
    const [ownPetAttr, setOwnPetAttr] = React.useState<any>(null)
    const [ownPetEvol, setOwnPetEvol] = React.useState<any>(null)
    const [selectedItem, setSelectedItem] = React.useState<any>(null)
    const [isApprove, setIsApprove] = React.useState(false)
    const [petName, setPetName] = React.useState<any>(null)
    const [connectorsData, setConnectors] = React.useState<any>([])
    const [countDownseconds, setCountDownseconds] = React.useState(0);
    const { address, connector, isConnected } = useAccount()
    
    const { connect, connectors, error: errorConnect, isLoading: isLoadingConnect, pendingConnector } = useConnect()
    const { chain } = useNetwork()

    const SamplePrevArrow = (props: any) => {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{ ...style, display: "block", backgroundImage: "url(/gotchi/Assets/Buy_Arrow_Left.png)", width: "35px", height: "60px", backgroundRepeat: "no-repeat", left: "50px", zIndex: "2" }}
                onClick={onClick}
            />
        );
    }
    const SampleNextArrow = (props: any) => {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{ ...style, display: "block", backgroundImage: "url(/gotchi/Assets/Buy_Arrow_Right.png)", width: "35px", height: "60px", backgroundRepeat: "no-repeat", right: "50px" }}
                onClick={onClick}
            />
        );
    }
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />
    };

    const getNftList = async () => {
        let response: any = await fetch(`${process.env.HOST}/api/bnb/nft?page=1&address=${address}`)
        response = await response.json()
        const nftList: any = [];
        let isPetExist = false;
        let getPetId = await localStorage.getItem('pet')
        if (response?.data) {
            for (const nft of response?.data) {
                    const Info: any = await readContracts({
                        contracts: [
                            {
                                address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
                                abi: nftAbi,
                                functionName: 'getPetInfo',
                                args: [BigInt(nft.id)],
                            }
                        ],
                    })
                    if (nft.id == getPetId) {
                        isPetExist = true
                    }
                    nftList.push({
                        value: nft.id,
                        label: Info[0].result[0]
                    })
            }
        }

        if (nftList[0]) {
            let pet = null;
            let petId: any = null;
            if (isPetExist) {
                pet = getPetId
            }
            if (pet) {
                petId = pet
            } else {
                localStorage.setItem('pet', nftList[0].value);
                petId = nftList[0].value;
            }

            setSelectedPet(petId)
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

            const InfoAttr: any = await readContracts({
                contracts: [
                    {
                        address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
                        abi: nftAbi,
                        functionName: 'getPetAttributes',
                        args: [petId],
                    }
                ],
            })
            setOwnPetAttr(InfoAttr[0].result)
            const InfoEvol: any = await readContracts({
                contracts: [
                    {
                        address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
                        abi: nftAbi,
                        functionName: 'getPetEvolutionInfo',
                        args: [petId],
                    }
                ],
            })
            setOwnPetEvol(InfoEvol[0].result)
            const seconds = parseInt(Info[0].result[4]) * 1000;
            setCountDownseconds(seconds)
            setOwnPet(Info[0].result)
        }
        setPetData(nftList)
        if (nftList.length > 0) {
            setIsPet(true)
        }
        if (nftList.length == 0) {
            setIsPet(false)
        }
        let items: any = [ 1, 2, 3, 4,0];
        let itemArr: any = [];
        for (const element of items) {
            const Info: any = await readContracts({
                contracts: [
                    {
                        address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
                        abi: nftAbi,
                        functionName: 'getItemInfo',
                        args: [element],
                    }
                ],
            })

            itemArr.push({
                id: element,
                name: Info[0].result[0],
                price: Info[0].result[1],
                points: Info[0].result[2],
                timeExtension: Info[0].result[3],
            })
        }
        setItemData(itemArr);
    }

    const { chains, error: errorSwitchNetwork, isLoading: loadingSwingNetwork, pendingChainId, switchNetwork } =
        useSwitchNetwork({
            onMutate(args) {

            },
            onSettled(data, error) {
            },
            onSuccess(data) {
                localStorage.removeItem('pet')
                getNftList()
            }
        })

    const { isOpen: isOpenPetName, onOpen: onOpenPetName, onOpenChange: onOpenChangePetName, onClose: onCloseChangePetName } = useDisclosure();
    const debouncedPetName = useDebounce(petName, 500)
    const debouncedSelectedPet = useDebounce(selectedPet, 500)

    const { config: configPetName } = usePrepareContractWrite({
        address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
        abi: nftAbi,
        functionName: "setPetName",
        args: [debouncedSelectedPet, debouncedPetName],
        onSettled: (e) => {

        },
    });

    const {
        data: petNameResult,
        writeAsync: setPetNameAsync,
        error: errorPetName,

    } = useContractWrite(configPetName);
    const { isLoading: isLoadingPetNameResult } = useWaitForTransaction({
        hash: petNameResult?.hash,
        onSuccess(data) {
            getNftList()
        },
    })

    const handleChangePetName = (event: any) => {
        setPetName(event.target.value);
    };
    const handleChangeSelectPet = async (event: any) => {
        localStorage.setItem('pet', event.target.value);
        getNftList();
    };
    const onChangePetName = () => {
        setPetNameAsync?.();
        onCloseChangePetName()
    }
    const onBuyAccessory = async (itemId: any) => {
        setSelectedItem(itemId);
        const config = await prepareWriteContract({
            address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
            abi: nftAbi,
            functionName: "buyItem",
            args: [selectedPet, itemId]
        })
        const tx = await writeContract(config);
        if (tx) {
            getNftList();
        }

    }

    const {
        config:configEvoleData,
        error: prepareErrorEvol,
        isError: isPrepareErrorEvol,
    } = usePrepareContractWrite({
        address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
        abi: nftAbi,
        args: [debouncedSelectedPet],
        functionName: 'evolve',
    })
    const { data: dataEvole, error: errorEvol, isError: isErrorEvol, write: asyncEvol } = useContractWrite(configEvoleData)

    const { isLoading: isLoadingEvol, isSuccess: isSuccessEvol } = useWaitForTransaction({
        hash: dataEvole?.hash,
        onSuccess(data) {
            getNftList()
        }
    })

    const {
        config,
        error: prepareErrorMint,
        isError: isPrepareErrorMint,
    } = usePrepareContractWrite({
        address: `0x${process.env.NFT_ADDRESS?.slice(2)}`,
        abi: nftAbi,
        functionName: 'mint',
    })
    const { data: dataMint, error: errorMint, isError: isErrorMint, write: mint } = useContractWrite(config)

    const { isLoading: isLoadingMint, isSuccess: isSuccessMint } = useWaitForTransaction({
        hash: dataMint?.hash,
        onSuccess(data) {
            getNftList()
        }
    })

    const { data: allowance, refetch } = useContractRead({
        address: `0x${process.env.TOKEN_ADDRESS?.slice(2)}`,
        abi: tokenAbi,
        functionName: "allowance",
        args: [`0x${address ? address.slice(2) : ''}`, `0x${process.env.NFT_ADDRESS?.slice(2)}`],
    });

    const { config: configAllowance } = usePrepareContractWrite({
        address: `0x${process.env.TOKEN_ADDRESS?.slice(2)}`,
        abi: tokenAbi,
        functionName: "approve",
        args: [`0x${process.env.NFT_ADDRESS?.slice(2)}`, MAX_ALLOWANCE],
    });

    const {
        data: approveResult,
        writeAsync: approveAsync,
        error: errorAllowance,
    } = useContractWrite(configAllowance);

    const { isLoading: isLoadingApprove } = useWaitForTransaction({
        hash: approveResult?.hash,
        onSuccess(data) {
            setIsApprove(true);
        }
    })
    React.useEffect(() => {
        if (connectors) {
            setConnectors(connectors)
        }
        if (allowance) {
            if (allowance >= BigInt(20000)) {
                setIsApprove(true)
            }
        }
        if (address) {
            setIsAddress(true)
        }
        else {
            setIsAddress(false);
        };
        if (chain?.id == process.env.CHAIN_ID) {
            setIsChain(true)
        }
        else {
            setIsChain(false)
        }
        getNftList()
    }, [address, chain])
    return (
        isChain && isAddress && isPet && (
            <>
                <div className="grid grid-cols-6 gap-3 pt-5">
                    <div className="col-start-1 col-end-4 ">
                        <div className="grid grid-rows-2 grid-flow-col gap-0 items-center ">
                            <div className="row-span-2 "> <Image
                                radius={"none"}
                                width={50}
                                src="/gotchi/Assets/Dead.png"
                            /></div>
                            <div className="col-span-2 "><span className="text-lg text-white">TOD</span></div>

                            <div className="row-span-1 col-span-2 "><span className="font-bold text-lg text-white"> <CountDownTimer targetDate={countDownseconds} /></span></div>
                        </div>
                    </div>
                    <div className="col-end-8 col-span-3 ">
                        <div className="grid grid-rows-2 grid-flow-col gap-0 items-center ">

                            <div className="row-span-2 "> <Image
                                radius={"none"}
                                width={60}
                                src="/gotchi/Assets/Heart.png"
                            /></div>
                            <div className="col-span-2 "><span className="text-sm text-white">Healthy</span></div>
                            <div className="row-span-1 col-span-2 "><span className="font-bold text-white text-lg">
                                {ownPet ? ownPet[1] == 0 ? 'HAPPY' : ownPet[1] == 1 ? 'HUNGRY' : ownPet[1] == 2 ? 'STARVING' : ownPet[1] == 3 ? 'DYING' : ownPet[1] == 4 ? 'DEAD' : '' : ''}
                            </span></div>
                        </div>
                    </div>
                    <div className="col-start-1 col-end-7 pt-10">
                    </div>
                    <div className="col-start-1 col-end-7 ">
                        <div className="flex justify-center">
                            <Image
                                radius={"none"}
                                width={ownPetEvol && (ownPetEvol[1] == 0 ? 70 : ownPetEvol[1] == 1 ? 120 : ownPetEvol[1] == 2 ? 200 : 0)}
                                src={`/gotchi/animation/${ownPetAttr && ownPetAttr[1] == 0 ? "black_dragon" : "green_dragon"}/${ownPetEvol && ownPetEvol[1]}.gif`}
                            />
                        </div>
                        <div className="flex justify-center pt-5">
                            {ownPetEvol && ownPetEvol[1] == 0 && ownPet[3] > 1 && ownPet[1] !== 4 && (
                                <Button color="warning" variant="solid" size="sm"  onClick={asyncEvol}>
                                    Evol Now !
                                </Button>
                            )}
                            {ownPetEvol && ownPetEvol[1] == 1 && ownPet[3] > 2 && ownPet[1] !== 4 && (
                                <Button color="warning" variant="solid" size="sm"  onClick={asyncEvol}>
                                    Evol Now !
                                </Button>
                            )}
                            {ownPet && ownPet[1] == 4 && (
                                <Button color="danger" variant="solid" size="sm" >
                                    Use Holy water
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="col-start-1 col-end-4 text-white">Level {ownPet && ownPet[3].toString()} - EVOL {ownPetEvol && ownPetEvol[1] == 0 ? "1" : ownPetEvol && ownPetEvol[1] == 1 ? "2" : ownPetEvol && ownPetEvol[1] == 2 ? "3" : ""}
                    </div>
                    <div className="col-end-7 col-span-3">
                        <div className="grid grid-cols-3">
                            <div className="col-span-1 justify-self-end">
                                <Modal
                                    isOpen={isOpenPetName}
                                    onOpenChange={onOpenChangePetName}
                                    placement="top-center"
                                >
                                    <ModalContent>
                                        {(onCloseChangePetName) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Change Pet Name</ModalHeader>
                                                <ModalBody>
                                                    <Input
                                                        autoFocus
                                                        label="Name"
                                                        onChange={handleChangePetName}
                                                        placeholder="Enter your pet name"
                                                        variant="bordered"
                                                    />
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" variant="flat" onPress={onCloseChangePetName}>
                                                        Close
                                                    </Button>
                                                    <Button color="primary" onPress={onChangePetName}>
                                                        Change
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                                <Button onPress={onOpenPetName} className="text-white" isIconOnly color="default" variant="ghost" size="sm" aria-label="Change name">
                                    <svg enable-background="new 0 0 160 80" id="Layer_1" version="1.1" viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" ><g><rect height="7" width="7" x="97" y="6" /><rect height="7" width="6" x="91" y="6" /><rect height="7" width="7" x="84" y="6" /><rect height="7" width="7" x="77" y="6" /><rect height="7" width="7" x="70" y="6" /><rect height="7" width="6" x="64" y="6" /><rect height="7" width="7" x="57" y="6" /><rect height="7" width="7" x="50" y="6" /><rect height="7" width="6" x="44" y="6" /><rect height="6" width="7" x="37" y="13" /><rect height="7" width="7" x="97" y="19" /><rect height="7" width="6" x="91" y="19" /><rect height="7" width="7" x="84" y="19" /><rect height="7" width="7" x="77" y="19" /><rect height="7" width="7" x="37" y="19" /><rect height="7" width="7" x="37" y="26" /><rect height="6" width="7" x="37" y="33" /><rect height="6" width="7" x="70" y="33" /><rect height="6" width="6" x="64" y="33" /><rect height="6" width="7" x="57" y="33" /><rect height="6" width="7" x="50" y="33" /><rect height="7" width="7" x="37" y="39" /><rect height="7" width="7" x="37" y="46" /><rect height="7" width="7" x="104" y="6" /><rect height="6" width="6" x="111" y="13" /><rect height="7" width="6" x="111" y="19" /><rect height="7" width="6" x="64" y="19" /><rect height="7" width="7" x="57" y="19" /><rect height="7" width="7" x="50" y="19" /><rect height="7" width="7" x="70" y="19" /><rect height="7" width="6" x="111" y="26" /><rect height="6" width="6" x="111" y="33" /><rect height="7" width="6" x="111" y="39" /><rect height="7" width="6" x="111" y="46" /><rect height="7" width="6" x="111" y="53" /><rect height="7" width="7" x="84" y="46" /><rect height="7" width="7" x="77" y="46" /><rect height="7" width="7" x="70" y="46" /><rect height="7" width="6" x="64" y="46" /><rect height="7" width="7" x="57" y="46" /><rect height="7" width="7" x="50" y="46" /><rect height="7" width="7" x="37" y="53" /><rect height="6" width="7" x="97" y="60" /><rect height="6" width="6" x="91" y="60" /><rect height="6" width="7" x="104" y="60" /><rect height="6" width="7" x="84" y="60" /><rect height="6" width="7" x="77" y="60" /><rect height="6" width="7" x="70" y="60" /><rect height="6" width="6" x="64" y="60" /><rect height="6" width="7" x="57" y="60" /><rect height="6" width="7" x="50" y="60" /><rect height="6" width="6" x="44" y="60" /></g></svg>
                                </Button></div>
                            <div className="col-span-2">
                                <Select
                                    fullWidth={false}
                                    className="max-w-xs text-white"
                                    variant="underlined"
                                    color={"secondary"}
                                    size="sm"
                                    selectedKeys={[selectedPet]}
                                    onChange={handleChangeSelectPet}
                                    labelPlacement="outside"
                                >
                                    {petData && petData.map((pet: any) => (
                                        <SelectItem key={pet.value} value={pet.value} >
                                            {pet.label + '#' + pet.value}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="col-start-1 col-end-7 ">
                        <Progress size="sm" color="default" aria-label="" value={100} />
                    </div>
                    <div className="col-start-1 col-end-3 text-white ">{ownPetAttr && ownPetAttr[4] == "0" ? "male" : ownPetAttr && ownPetAttr[4] == "1" ? "female" : ""}</div>
                    <div className="col-end-8 col-span-3  text-white">Reward:{ownPet ? ownPet[8].toString() : ''} ETH</div>
                </div>
                <div className="bg-no-repeat bg-center bg-contain" style={{ backgroundImage: "url(/gotchi/Assets/Buy_MenuBG.png)", height: "300px" }} >
                    <Slider {...settings}>
                        {itemData && itemData.map((item: any) => (
                            <div >

                                <div className="col-start-1 col-end-7 ">

                                    <div className="flex justify-center pt-7">
                                        {item.name == "Beef" && (
                                            <Image
                                                width={100}
                                                radius={"none"}
                                                src="/gotchi/Assets/Item_Beef.png"
                                            />
                                        )}
                                        {item.name == "Shield" && (
                                            <Image
                                                width={80}
                                                radius={"none"}
                                                src="/gotchi/Assets/Item_Shield.png"
                                            />
                                        )}
                                        {item.name == "Water" && (
                                            <Image
                                                width={50}
                                                radius={"none"}
                                                src="/gotchi/Assets/Item_Water.png"
                                            />
                                        )}
                                        {item.name == "Holy Water" && (
                                            <Image
                                                width={80}
                                                radius={"none"}
                                                src="/gotchi/Assets/Item_HolyWater.png"
                                            />
                                        )}
                                        {item.name == "Moon Stone" && (
                                            <Image
                                                width={80}
                                                radius={"none"}
                                                src="/gotchi/Assets/Item_Moonstone.png"
                                            />
                                        )}
                                    </div>
                                    <div className="flex justify-center pt-5 ">

                                        <Card
                                            radius="lg"
                                            className="border-none"
                                        >
                                            <Image
                                                height={240}
                                                src="/gotchi/Assets/Buy_Blue_BG.png"
                                                width={240}
                                            />
                                            <CardFooter className="absolute z-10 flex flex-col justify-center">
                                                <p className="text-small text-white" style={{marginBottom:"0"}}>{item.name}</p>
                                                <p className="text-small text-white" style={{marginBottom:"0"}}>{item.name == "Beef" ? "Increase TOD and PTS" : item.name == "Water" ? "Increase TOD and PTS" : item.name == "Shield" ? "Prevent attack" : item.name == "Holy Water" ? "Revival Pet from Dead" : item.name == "Moon Stone" ? "Evol Pet" : ""}</p>

                                                {(ownPet && ownPet[1] == 4 && item.name == "Holy Water") && (
                                                    <button type="button" style={{ backgroundImage: "url(/gotchi/Assets/Buy_Button.png)" }} className="bg-no-repeat bg-center w-full h-16" onClick={() => onBuyAccessory(item.id)}> </button>
                                                )}
                                                {
                                                    (ownPet && ownPet[1] !== 4 && item.name !== "Holy Water") && (
                                                        <button type="button" style={{ backgroundImage: "url(/gotchi/Assets/Buy_Button.png)" }} className="bg-no-repeat bg-center w-full h-16" onClick={() => onBuyAccessory(item.id)}> </button>
                                                    )}
                                                {(ownPet && ownPet[1] !== 4 && item.name == "Holy Water") && (
                                                    <p className="text-danger">  Can not buy item </p>
                                                )}
                                                {(ownPet && ownPet[1] == 4 && item.name !== "Holy Water") && (
                                                    <p className="text-danger">  Can not buy item </p>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>

                </div>

            </>
        ) ||

        isChain == false && isAddress && (
            <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 ">
                <button
                    key={process.env.CHAIN_ID}
                    onClick={() => switchNetwork?.(process.env.CHAIN_ID as unknown as number)}
                    className="nes-btn w-52 mt-48"
                >
                    Switch Chain
                    {loadingSwingNetwork && pendingChainId === process.env.CHAIN_ID && ' (switching)'}
                </button>
                <span>{errorSwitchNetwork && errorSwitchNetwork.message}</span>
            </div>
        )
    ) || isAddress == false && (
        <div className="mt-3">
            <div className="flex flex-col items-center justify-center gap-3 pt-20 ">
                {connectorsData.map((connector: any) => (

                    <button
                        className="nes-btn w-48  m-2 "
                        disabled={!connector.ready}
                        key={connector.id}
                        onClick={() => connect({ connector })}
                    >
                        {connector.name}
                        {!connector.ready}
                        {isLoadingConnect &&
                            connector.id === pendingConnector?.id &&
                            ' (connecting)'}
                    </button>


                ))}
            </div>
            {errorConnect && <div>{errorConnect.message}</div>}
        </div>
    ) || isPet == false && isChain && isAddress && (
        <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 ">
            <h1 className="mt-48">You Dont Own Any Pet !</h1>
            {(!isApprove) ? (
                <button
                    className="nes-btn w-52"
                    onClick={approveAsync}
                >
                    Approval
                </button>

            ) : (
                <button
                    className="nes-btn w-52"
                    disabled={!mint} onClick={mint}
                >
                    Mint A GotChi
                </button>
            )}
        </div>

    )


        ;


}
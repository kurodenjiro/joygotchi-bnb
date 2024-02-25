"use client";
import React from "react";
import { Link, Card, CardHeader, CardBody, CardFooter, Avatar, Button, Progress, Image } from "@nextui-org/react";
import NextLink from "next/link";
import { readContracts } from '@wagmi/core'
import { nftAbi, tokenAbi, daoAbi } from '../../components/play/abi';
import { usePublicClient } from 'wagmi'
import { decodeFunctionData } from 'viem'

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const Proposals = () => {
  const [proposals, setProposals] = React.useState([])
  const [totalSuplly, setTotalSuplly] = React.useState(0)
  const [block, setBlock] = React.useState()
  const publicClient = usePublicClient()

  React.useEffect(() => {
    publicClient
      .getBlock() // https://viem.sh/docs/actions/public/getBlock.html
      .then((x: any) => { console.log(x.number); setBlock(x.number) })
      .catch(error => console.log(error))
  }, [publicClient])

  const getProposals = async () => {


    const totalProposalData: any = await readContracts({
      contracts: [
        {
          address: `0x${process.env.DAO_ADDRESS?.slice(2)}`,
          abi: daoAbi,
          functionName: 'totalProposal',
        }
      ],
    })
    const totalProposal = totalProposalData[0].result;
    let proposals: any = [];
    //https://op-bnb-testnet-explorer-api.nodereal.io/api/blocks/getBlocksList?page=1&pageSize=1
    for (let index = 0; index < parseInt(totalProposal); index++) {
      const proposal: any = await readContracts({
        contracts: [
          {
            address: `0x${process.env.DAO_ADDRESS?.slice(2)}`,
            abi: daoAbi,
            functionName: 'proposalOf',
            args: [BigInt(index)]
          }
        ],
      })

      const { args } = decodeFunctionData({
        abi: nftAbi,
        data: proposal[0].result.data,
      })
      console.log("value", args)
      proposal[0].result.dataDecoded = args
      proposals.push(proposal[0].result);
    }

    setProposals(proposals)
    console.log("proposals", proposals)
    const totalSupply: any = await readContracts({
      contracts: [
        {
          address: `0x${process.env.TOKEN_ADDRESS?.slice(2)}`,
          abi: tokenAbi,
          functionName: 'totalSupply',
        }
      ],
    })
    setTotalSuplly((parseInt(totalSupply[0].result) / 1e18) * 0.01)
    console.log("totalSupply", (parseInt(totalSupply[0].result) / 1e18) * 0.01)
  }
  React.useEffect(() => {
    getProposals();
  }, [])
  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">
            </h3>
            <div className="flex justify-between flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                Available Proposals
              </div>
              <div className="flex flex-row gap-3.5 flex-wrap">
                <Link href="/create">
                  <Button color="primary">
                    Add Proposal
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid md:grid-cols-3 grid-cols-1 2xl:grid-cols-3 gap-5  justify-center w-full">
              {proposals.map((proposal: any, index: number) => (
                <Link href={`/proposal/${index}`}>
                  <Card className="max-w-max">
                    <CardHeader className="justify-between">
                      <div className="flex gap-5">
                        <Avatar isBordered radius="full" size="md" src="/Assets/EggIcon.png" />
                        <div className="flex flex-col gap-1 items-start justify-center">
                          <h4 className="text-small font-semibold leading-none text-default-600">{proposal && proposal.creator.substring(0, 5)}...{proposal && proposal.creator.substring(proposal.creator.length - 4, proposal.creator.length)}</h4>
                          <h5 className="text-small tracking-tight text-default-400">Block ends:{proposal.deadline.toString()}</h5>
                        </div>
                      </div>
                      <Button
                        className={proposal && block && parseInt(block) < parseInt(proposal.deadline) ? "bg-transparent text-foreground border-default-200" : ""}
                        color="primary"
                        radius="full"
                        size="sm"
                        variant={proposal && block && parseInt(block) < parseInt(proposal.deadline) ? "bordered" : "solid"}
                      >
                        {proposal && block && parseInt(block) < parseInt(proposal.deadline) ? "Open" : "Closed"}
                      </Button>
                    </CardHeader>
                    <CardBody className="px-3 py-0 text-small text-black">
                      <p>
                        {proposal && proposal.description.split("|")[0]}
                      </p>
                      <p>
                        {proposal && proposal.description.split("|")[1]}
                      </p>
                      <p>
                      {proposal && proposal.dataDecoded[0][0].map((pet: any) => (
                            <Card className="py-4 m-4" >
                              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-tiny uppercase font-bold">Name : {pet.name}</p>
                                <small className="text-default-500">Attack Win Rate :{pet.attackWinRate.toString()}</small>
                                <small className="text-default-500">Next Evolution Level:{pet.nextEvolutionLevel.toString()}</small>
                              </CardHeader>
                              <CardBody className="overflow-visible py-2">
                                <Image
                                  alt="Card background"
                                  className="object-cover rounded-xl"
                                  src={pet.image}
                                  width="200px"
                                />
                              </CardBody>
                            </Card>
                          ))}
                      </p>
                      <Progress
                        label="Agreement percent"
                        size="md"
                        value={proposal && parseInt(proposal.total) / totalSuplly}//proposal && proposal.total/( 1000000000 *1%)
                        maxValue={100}
                        color="success"
                        showValueLabel={true}
                        className="max-w-md"
                      />

                    </CardBody>
                    <CardFooter className="gap-3">

                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

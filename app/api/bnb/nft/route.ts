
import {
  NextResponse
} from 'next/server';
import { decodeAbiParameters } from 'viem'
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const page = searchParams.get("page");
    const address = searchParams.get("address");
    if (address) {
      let response: any = await fetch(`${process.env.EXPLORER_URL}/api/tx/getAssetTransferByAddress?page=${page}&type=721&pageSize=20&address=${address}`)
      response = await response.json()
      let nftsList: any = response?.data?.list?.filter((item: any) => item.from == '0x0000000000000000000000000000000000000000');
      let nftRes = [];
      for (const nft of nftsList) {
        const nftDecodeId = decodeAbiParameters(
          [{ name: 'x', type: 'uint32' }],
          nft.erc721TokenId,
        )
        nftRes.push({
          id: nftDecodeId[0].toString(),
          address: nft.to
        })
      }

      return NextResponse.json({ data: nftRes, total: nftRes.length }, {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      },);

    } else {
      let response: any = await fetch(`${process.env.EXPLORER_URL}/api/tx/getAssetTransferByAddress?page=${page}&type=721&pageSize=20&address=${process.env.NFT_ADDRESS}`)
      response = await response.json()
      let nftsList: any = response?.data?.list?.filter((item: any) => item.from == '0x0000000000000000000000000000000000000000');
      let nftRes = [];
      for (const nft of nftsList) {
        const nftDecodeId = decodeAbiParameters(
          [{ name: 'x', type: 'uint32' }],
          nft.erc721TokenId,
        )
        nftRes.push({
          id: nftDecodeId[0].toString(),
          address: nft.to
        })
      }

      return NextResponse.json({ data: nftRes, total: nftRes.length }, {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      },);
    }


  } catch (error) {
    return NextResponse.json(
      { error },
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

}
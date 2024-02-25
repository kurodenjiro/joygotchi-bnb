/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
      CHAIN_ID: 5611,
      CHAIN_NAME: "opBNB Testnet",
      CHAIN_NETWORK: "opBNB",
      TOKEN: "BNB",
      SYMBOL: "tBNB",
      RPC: "https://opbnb-testnet-rpc.bnbchain.org",
      URL_FAUCET: "https://opbnb-testnet-bridge.bnbchain.org/deposit",
      NFT_ADDRESS:'0xe966Dd4DfBc97F37470B8F9C26Fc83EFa15339E5',
      TOKEN_ADDRESS:'0x0B47EEB7290D413D2a51273cf7fd440c6f53E8e4',
      FAUCET_ADDRESS:'0x20449b21e2DDb4a1C335C2e65DD731482450558f',
      DAO_ADDRESS:'0x410EaA07644593d428568eA1B6b435e6f6Ad3C4D',
      EXPLORER_URL:'https://op-bnb-testnet-explorer-api.nodereal.io',
      HOST:'http://localhost:3000'
    },
}

module.exports = nextConfig
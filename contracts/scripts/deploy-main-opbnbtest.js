const {
    Contract,
    ContractFactory,
    utils,
    BigNumber,
    constants,
    getSigners,
} = require("ethers");
const { ethers } = require("hardhat");

const ROUTER_ADDRESS = ethers.ZeroAddress; //"0x5072EA8551efBF96Ad87050563e6BA197A03f34d"; //testnet

async function main() {
    const [deployer] = await ethers.getSigners();
    let nonce = await deployer.getNonce();

    console.log("Deploying contracts with the account:", deployer.address);

    // const Token = await ethers.getContractFactory("JoyGotchiToken");
    // const token = await Token.deploy(ROUTER_ADDRESS, {
    //     gasLimit: "0x5000000",
    //     nonce: nonce++,
    // });

    // await token.waitForDeployment();
    // console.log("JoyGotchiToken:", token.target);

    // const ModeNFT = await ethers.getContractFactory("JoyGotchiV2");
    // const modeNFT = await ModeNFT.deploy(token.target, {
    //     gasLimit: "0x5000000",
    //     nonce: nonce++,
    // });
    // await modeNFT.waitForDeployment();
    // console.log("JoyGotchi:", modeNFT.target);

    // const GameManager = await ethers.getContractFactory("GameManagerV2");
    // const gameManager = await GameManager.deploy(modeNFT.target, {
    //     gasLimit: "0x5000000",
    //     nonce: nonce++,
    // });
    // await gameManager.waitForDeployment();
    // console.log("GameManager:", gameManager.target);

    // const GenePool = await ethers.getContractFactory("GenePool");
    // const genePool = await GenePool.deploy(
    //     modeNFT.target,
    //     2, 2, 2, {
    //     gasLimit: "0x5000000",
    //     nonce: nonce++,
    // });
    // await genePool.waitForDeployment();
    // console.log("GenePool:", genePool.target);

    // const Faucet = await ethers.getContractFactory("JoyGotchiFaucet");
    // const faucet = await Faucet.deploy(token.target, {
    //     gasLimit: "0x5000000",
    //     nonce: nonce++,
    // });
    // await faucet.waitForDeployment();
    // console.log("Faucet:", faucet.target);

    // // JoyGotchiToken: 0x0B47EEB7290D413D2a51273cf7fd440c6f53E8e4
    // // JoyGotchi: 0xe966Dd4DfBc97F37470B8F9C26Fc83EFa15339E5
    // // GameManager: 0x9Ac3005c73A4a0cF80328778E86c6B87e2D50cb8
    // // GenePool: 0x965EF3B3c521788a795EFd86f7316063d4dA0F1F
    // // Faucet: 0x20449b21e2DDb4a1C335C2e65DD731482450558f
    // // DAO: 0x410EaA07644593d428568eA1B6b435e6f6Ad3C4D

    const token = await ethers.getContractAt('JoyGotchiToken', '0x0994c0e04E5fB8D1271106F4E7957274Bf41Ec75');
    const modeNFT = await ethers.getContractAt('JoyGotchiV2', '0x63a21cb4c9d10c06247Ae4BCc624e3464c6F5BB6');
    const gameManager = await ethers.getContractAt('GameManagerV2', '0x9aa75e76963f3cf340C955C60D9958Fc7f4b235D');
    const faucet = await ethers.getContractAt('JoyGotchiFaucet', '0x87a741aC23274EAde3D4497B1f02779173f0AE7F');
    const genePool = await ethers.getContractAt('GenePool', '0x72CC1d5FD1F3626eCFF91797910E92A12732Deaa');

    console.log("Settings");
    await modeNFT.setGameManager(gameManager.target, {
        gasLimit: "0x5000000",
        nonce: nonce++,
    });

    await modeNFT.setGenePool(genePool.target, {
        gasLimit: "0x5000000",
        nonce: nonce++,
    });

    await token.transfer(faucet.target, ethers.parseEther("100000"), {
        gasLimit: "0x5000000",
        nonce: nonce++,
    }); // move 100k to faucet

    await token.enableTrading({
        gasLimit: "0x5000000",
        nonce: nonce++,
    });
    // enable trading

    const DAO = await ethers.getContractFactory('DAO');
    const dao = await DAO.deploy(
        '0xa07445899cB686F304a89bBC3AEbE93Ae78eBeeB',
        await token.getAddress(),
        ethers.parseEther('0.01'), // "1%"

        {
            gasLimit: "0x5000000",
            nonce: nonce++,
        }
    );
    await dao.waitForDeployment();
    console.log("DAO:", dao.target);

    console.log("Done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

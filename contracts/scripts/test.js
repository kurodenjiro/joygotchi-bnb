const {
    Contract,
    ContractFactory,
    utils,
    BigNumber,
    constants,
    getSigners,
    parseUnits,
    N,
} = require("ethers");
const { ethers } = require("hardhat");
const JoyGotchiArtifact = require("../artifacts/contracts/JoyGotchiV2.sol/JoyGotchiV2.json");
const JOY_GOTCHI_ADDRESS = "0xe966Dd4DfBc97F37470B8F9C26Fc83EFa15339E5"; //testnet

async function main() {
    const [deployer] = await ethers.getSigners();

    const joyGotchi = new Contract(
        JOY_GOTCHI_ADDRESS,
        JoyGotchiArtifact.abi,
        deployer
    );

    const owner = await joyGotchi.owner();

    console.log("Owner:", owner);

    // console.log(await joyGotchi.genePool());

    const tx = await joyGotchi.createSpecies(
        [{
            image: "https://bafkreigw3j7bn3yhkbqt2ercytjhghzn462n5pxzyig4lptuyv4zv6gn6y.ipfs.nftstorage.link/",
            name: "1",
            attackWinRate: BigInt("20"),
            nextEvolutionLevel: BigInt("1")
        },
        {
            image: "https://bafkreiaqk7mr45wnjwtb4lyv4gpy5rloma3sxq3fq2t6s43tcy3ovnki4m.ipfs.nftstorage.link/",
            name: "2",
            attackWinRate: BigInt("25"),
            nextEvolutionLevel: BigInt("2")
        },
        {
            image: "https://bafkreiav7btv3nuei6znfpttelgln5tdcz7pfllcio333og4qwnbkwltoa.ipfs.nftstorage.link/",
            name: "3",
            attackWinRate: BigInt("35"),
            nextEvolutionLevel: BigInt("3")
        }
        ],
        BigInt("10"),
        true,
        BigInt("0"),
        { skinColor: BigInt("0"), hornStyle: BigInt("0"), wingStyle: BigInt("0") }
    );

    console.log(tx);

    console.log("Done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

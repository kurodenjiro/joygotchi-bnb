// DAO.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe('DAO', function () {
  let dao, govToken;

  beforeEach(async function () {
    const [, treasury] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('MockGOVToken');
    govToken = await Token.deploy("GOVTOken", "GTK", 
    18, 1000000);

    await govToken.waitForDeployment();
    const MIN_THRESHOLD_VALUE = ethers.parseEther('0.01'); // 1%

    const DAO = await ethers.getContractFactory('DAO');
    dao = await DAO.deploy(
      treasury.address,
      await govToken.getAddress(),
      MIN_THRESHOLD_VALUE
    );
    await dao.waitForDeployment();
  });

  it('should have the correct initial state', async function () {
    expect(await dao.totalProposal()).to.equal(0);
    const [user] = await ethers.getSigners();
    expect(await dao.voteOf(1, user.address)).to.equal(0);
    expect(await dao.govToken()).to.equal(await govToken.getAddress());
    expect(await dao.claimOf(1, user.address)).to.equal(0);
  });

  it('should create a proposal and emit an event', async function () {
    const SC = await ethers.getContractFactory('SimpleOwnerContract');
    const sc = await SC.deploy();
    await sc.waitForDeployment();

    const [owner, user] = await ethers.getSigners();

    await sc.connect(owner).setValue(123);

    await expect(sc.connect(user).setValue(123)).to.be.revertedWith("Only owner can call this function");
    
    await sc.connect(owner).setOwner(await dao.getAddress());
    // now, owner is DAO
    await expect(sc.connect(owner).setValue(123)).to.be.revertedWith("Only owner can call this function");

    const FUND = ethers.parseEther('1000000') * 20n / 100n; // 20%
    await govToken.connect(owner).transfer(user.address, FUND);

    // approve
    await govToken.connect(user).approve(await dao.getAddress(), ethers.MaxUint256);
    
    
    await dao.connect(user).createProposal(
      "test1", // Tạo proposal với tiêu đề là test1
      await sc.getAddress(), // địa chỉ của sc thực thi logic
      sc.interface.encodeFunctionData('setValue', [456]), // sinh payload tham số của DAO
      ethers.parseEther('10') // phần thưởng nhận được khi proposal được chấp thuận
    );

    expect(await dao.reachThreshold(0)).to.be.eq(false);

    expect((await dao.proposalOf(0)).total).to.be.eq(0);

    // vote
    const HAFT_PERCENT = ethers.parseEther('1000000') * 5n / 1000n; // 0.5%
    await dao.connect(user).vote(0, HAFT_PERCENT); // 0.5%
    expect((await dao.proposalOf(0)).total).to.be.eq(HAFT_PERCENT);
    expect((await dao.proposalOf(0)).executed).to.be.eq(false);

    // add more
    const [,, user2] = await ethers.getSigners();
    await govToken.connect(user2).approve(await dao.getAddress(), ethers.MaxUint256);
    await govToken.connect(owner).transfer(user2.address, HAFT_PERCENT + 1000n);

    await dao.connect(user2).vote(0, 1000n + HAFT_PERCENT);

    // auto executed
    expect((await dao.reachThreshold(0))).to.be.eq(true);
    expect((await dao.proposalOf(0)).executed).to.be.eq(true);

    expect(await sc.getValue()).to.be.eq(456);

    // can not call again
    await expect(dao.connect(user).vote(
      0,
      HAFT_PERCENT + 1000n
    )).to.be.revertedWith("Already executed");

    // claim
    await expect(dao.connect(owner).claim(0)).to.be.revertedWith("No votes");
    await expect(dao.connect(user).claim(0)).to.be.revertedWith("Token is locking");
    // increase 200 block
    await mine(200);

    const balanceBeforeClaim2 = await govToken.balanceOf(user2.address);
    const tx = await dao.connect(user2).claim(0);

    // check reward
    // HAFT_PERCENT + 1000n  ~  ethers.parseEther('10')

    const totalLock = (await dao.proposalOf(0)).total;

    const lockOfUser2 = await dao.voteOf(0, user2.address);
    const reward = ethers.parseEther('10');
    
    const rwo = await dao.rewardOf(0, user2.address);
    await expect(tx).to.emit(dao, 'Claimed')
      .withArgs(0, user2.address, lockOfUser2 + lockOfUser2 * reward / totalLock);

    expect(await govToken.balanceOf(user2.address)).to.be.eq(balanceBeforeClaim2 +  lockOfUser2 + rwo);
  });

  it('should create a proposal and emit an event, deline proposal', async function () {
    const SC = await ethers.getContractFactory('SimpleOwnerContract');
    const sc = await SC.deploy();
    await sc.waitForDeployment();

    const [owner, user] = await ethers.getSigners();

    await sc.connect(owner).setValue(123);

    await expect(sc.connect(user).setValue(123)).to.be.revertedWith("Only owner can call this function");
    
    await sc.connect(owner).setOwner(await dao.getAddress());
    // now, owner is DAO
    await expect(sc.connect(owner).setValue(123)).to.be.revertedWith("Only owner can call this function");

    const FUND = ethers.parseEther('1000000') * 20n / 100n; // 20%
    await govToken.connect(owner).transfer(user.address, FUND);

    // approve
    await govToken.connect(user).approve(await dao.getAddress(), ethers.MaxUint256);
    
    await dao.connect(user).createProposal(
      "test1",
      await sc.getAddress(),
      sc.interface.encodeFunctionData('setValue', [456]),
      ethers.parseEther('10')
    );
    const PID = 0;

    expect(await dao.reachThreshold(PID)).to.be.eq(false);

    expect((await dao.proposalOf(PID)).total).to.be.eq(0);

    // vote
    const HAFT_PERCENT = ethers.parseEther('1000000') * 5n / 1000n; // 0.5%

    // add more
    const [,, user2] = await ethers.getSigners();
    await govToken.connect(user2).approve(await dao.getAddress(), ethers.MaxUint256);
    await govToken.connect(owner).transfer(user2.address, HAFT_PERCENT + 1000n);

    await dao.connect(user2).vote(PID, 1000n + HAFT_PERCENT);

    // not executed
    expect((await dao.reachThreshold(PID))).to.be.eq(false);
    expect((await dao.proposalOf(PID)).executed).to.be.eq(false);

    // increase 200 block
    await mine(200);

    // can not vote outdate
    await govToken.connect(user).approve(await dao.getAddress(), ethers.MaxUint256);
    await govToken.connect(owner).transfer(user.address, HAFT_PERCENT + 1000n);

    await expect(dao.connect(user).vote(PID, 1000n + HAFT_PERCENT)).to.be.revertedWith(
      "Already expired"
    );

    const balanceBeforeClaim2 = await govToken.balanceOf(user2.address);
    const tx = await dao.connect(user2).claim(PID);

    // check reward
    // HAFT_PERCENT + 1000n  ~  ethers.parseEther('10')
    const lockOfUser2 = await dao.voteOf(PID, user2.address);
    
    const rwo = await dao.rewardOf(PID, user2.address);
    await expect(tx).to.emit(dao, 'Claimed')
      .withArgs(0, user2.address, lockOfUser2); // no reward

    expect(await govToken.balanceOf(user2.address)).to.be.eq(balanceBeforeClaim2 +  lockOfUser2 + rwo);
  });
});
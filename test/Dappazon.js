const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// global constants for listing an item

const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Cloting";
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Dappazon", () => {
  let dappazon
  let deployer, buyer

  beforeEach(async () => {

    // setup account

    [deployer, buyer] = await ethers.getSigners()
    // console.log(deployer.address, buyer.address);


    // deploy contract
    const Dappazon = await ethers.getContractFactory('Dappazon')
    dappazon = await Dappazon.deploy();
  })

  describe("Deployement", () => {

    it('sets the owner', async () => {
      expect(await dappazon.owner()).to.equal(deployer.address)
    })
  })

  describe("Listing", () => {
    let transaction

    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)

      await transaction.wait()

    })

    it('returs itams attribute', async () => {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rating).to.equal(RATING)
      expect(item.stock).to.equal(STOCK)
    })

    it('emits list events' , async() => {
      expect(transaction).to.emit(dappazon,"List")
    })

  })

  describe("Buying", () => {
    let transaction

    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value : COST })
      await transaction.wait()
    })

    it('update buyes orders count' , async() => {
      const result = await dappazon.orderCount(buyer.address)
      expect(result).to.equal(1)
    })

    it('Add the order' , async() => {
      const order = await dappazon.orders(buyer.address,1)
      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })

    it('update the cortract balance' , async() => {
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(COST)
    })

    it('emits list events' , async() => {
      expect(transaction).to.emit(dappazon,"Buy")
    })

  })

  describe("Withdraw", () => {
    let transaction, balanceBefore

    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value : COST })
      await transaction.wait()

      // get developer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // withdraw
      transaction = await dappazon.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('update the owner balance' , async() => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    })

    it('update the cortract balance' , async() => {
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(0)
    })

  })
})

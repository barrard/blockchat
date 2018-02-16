var BlockChat = artifacts.require("./BlockChat.sol");

module.exports = function(deployer, network, account) {
  // console.log(network)
  // console.log(account)
  deployer.deploy(BlockChat);
};

const PGP = artifacts.require("PGP");

module.exports = function (deployer) {
  deployer.deploy(PGP);
};
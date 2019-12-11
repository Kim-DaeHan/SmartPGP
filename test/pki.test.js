const PGP = artifacts.require("PGP");

contract("PGP", accounts => {
  const [account1] = accounts;

  it("Set/Get User", async () => {
    const instance = await PGP.deployed();
    await instance.setUser.call(account1, '홍길동', 'test@test.com');
    const userInfo = await instance.getUser.call(account1);

    assert.notEqual(userInfo.name, '', 'User does not exist');
  });
});
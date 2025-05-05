import { AccountDAOMemory } from "../../src/AccountDAO";
import sinon from "sinon";
import { randomUUID } from "crypto";
import { Withdraw } from "../../src/Withdraw";

let withdraw: Withdraw;
let accountDAO: AccountDAOMemory;

beforeEach(() => {
  accountDAO = new AccountDAOMemory();
  withdraw = new Withdraw(accountDAO);
});

afterEach(() => {
  sinon.restore();
});

describe("Saque", () => {
  test("Deve realizar um saque", async () => {
    const accountId = randomUUID();
    const accountDaoMock = sinon.mock(AccountDAOMemory.prototype);
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    accountDaoMock
      .expects("getAccountAssetBalance")
      .once()
      .resolves({ account_id: accountId, asset_id: "BTC", quantity: 10 });

    const inputWithdraw = {
      accountId,
      assetId: "BTC",
      quantity: 10,
    };

    await withdraw.execute(inputWithdraw);
    accountDaoMock.verify();
  });

  test("Não deve realizar um saque se não tiver fundos insuficientes", async () => {
    const accountId = randomUUID();
    const accountDaoMock = sinon.mock(AccountDAOMemory.prototype);
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    accountDaoMock
      .expects("getAccountAssetBalance")
      .once()
      .resolves({ account_id: accountId, asset_id: "BTC", quantity: 5 });

    const inputWithdraw = {
      accountId,
      assetId: "BTC",
      quantity: 10,
    };

    await expect(() => withdraw.execute(inputWithdraw)).rejects.toThrow(
      "Insufficient funds"
    );
    accountDaoMock.verify();
  });
});

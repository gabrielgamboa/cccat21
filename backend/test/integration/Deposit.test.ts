import { AccountDAOMemory } from "../../src/AccountDAO";
import sinon from "sinon";
import Deposit from "../../src/Deposit";
import { randomUUID } from "crypto";

let deposit: Deposit;
let accountDAO: AccountDAOMemory;

beforeEach(() => {
  accountDAO = new AccountDAOMemory();
  deposit = new Deposit(accountDAO);
});

afterEach(() => {
  sinon.restore(); 

test("Deve realizar um depósito", async () => {
  const accountId = randomUUID();
  const accountDaoMock = sinon.mock(AccountDAOMemory.prototype);
  accountDaoMock.expects("getAccountById").once().resolves({ accountId });

  const inputDeposit = {
    accountId,
    assetId: "BTC",
    quantity: 10,
  };

  await deposit.execute(inputDeposit);
  accountDaoMock.verify();
});

test("Não deve realizar um depósito com um ASSET inválido", async () => {
  const accountId = randomUUID();
  const accountDaoMock = sinon.mock(AccountDAOMemory.prototype);
  accountDaoMock.expects("getAccountById").once().resolves({ accountId });

  const inputDeposit = {
    accountId,
    assetId: "XXX",
    quantity: 10,
  };

  await expect(() => deposit.execute(inputDeposit)).rejects.toThrow(
    "Invalid asset"
  );
});

test("Não deve realizar um depósito com uma quantidade 0", async () => {
  const accountId = randomUUID();
  const accountDaoMock = sinon.mock(AccountDAOMemory.prototype);
  accountDaoMock.expects("getAccountById").once().resolves({ accountId });

  const inputDeposit = {
    accountId,
    assetId: "BTC",
    quantity: 0,
  };

  await expect(() => deposit.execute(inputDeposit)).rejects.toThrow(
    "Invalid quantity"
  );
});

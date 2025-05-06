import sinon from "sinon";
import { GetDepth } from "../../src/GetDepth";
import { OrderDAOMemory } from "../in-memory-dao/order-dao-memory";
import { AccountDAOMemory } from "../../src/AccountDAO";

describe("GetDepth", () => {
  let getDepth: GetDepth;
  let orderDAO: OrderDAOMemory;
  let accountDAO: AccountDAOMemory;

  const generateAccount = () => ({
    accountId: "id",
    name: "Lucas",
    email: "lucas@gmail.com",
    document: "44789525821",
    password: "123456",
  });

  beforeEach(() => {
    orderDAO = new OrderDAOMemory();
    accountDAO = new AccountDAOMemory();
    getDepth = new GetDepth(orderDAO);
  });

  afterEach(() => {
    sinon.restore();
  });

  test("Não deve obter a profundidade se a precisão for menor que 0", async () => {
    const account = generateAccount();
    accountDAO.saveAccount(account);

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "buy",
      quantity: 1,
      price: 100,
    });

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "buy",
      quantity: 3,
      price: 100,
    });

    const input = {
      marketId: "BTC/USD",
      precision: -1,
    };

    await expect(() => getDepth.execute(input)).rejects.toThrow(
      "Invalid precision"
    );
  });

  test("Deve obter a profundidade com precisão igual a 0", async () => {
    const account = generateAccount();
    accountDAO.saveAccount(account);

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "buy",
      quantity: 1,
      price: 100,
    });

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "buy",
      quantity: 3,
      price: 100,
    });

    const input = {
      marketId: "BTC/USD",
      precision: 0,
    };

    const result = await getDepth.execute(input);

    expect(result).toEqual({
      buys: [
        {
          price: 100,
          quantity: 4,
          marketId: "BTC/USD",
          side: "buy",
        },
      ],
      sells: [],
    });
  });

  test("Deve obter a profundidade agrupado por precisão maior que 0", async () => {
    const account = generateAccount();
    accountDAO.saveAccount(account);

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "sell",
      quantity: 1,
      price: 3600,
    });

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "sell",
      quantity: 3,
      price: 3650,
    });

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "sell",
      quantity: 1,
      price: 3700,
    });

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "buy",
      quantity: 3,
      price: 6000,
    });

    orderDAO.createOrder({
      accountId: account.accountId,
      marketId: "BTC/USD",
      side: "buy",
      quantity: 3,
      price: 6100,
    });

    const input = {
      marketId: "BTC/USD",
      precision: 2,
    };

    const result = await getDepth.execute(input);

    expect(result).toEqual({
      buys: expect.arrayContaining([
        {
          price: 6000,
          quantity: 3,
          marketId: "BTC/USD",
          side: "buy",
        },
        {
          price: 6100,
          quantity: 3,
          marketId: "BTC/USD",
          side: "buy",
        },
      ]),
      sells: expect.arrayContaining([
        {
          price: 3600,
          quantity: 4,
          marketId: "BTC/USD",
          side: "sell",
        },
        {
          price: 3700,
          quantity: 1,
          marketId: "BTC/USD",
          side: "sell",
        },
      ]),
    });
    expect(result.sells).toHaveLength(2);
    expect(result.buys).toHaveLength(2);
  });
});

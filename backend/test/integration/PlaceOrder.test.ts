import { AccountDAOMemory } from "../../src/AccountDAO";
import sinon from "sinon";
import { randomUUID } from "crypto";
import { PlaceOrder } from "../../src/PlaceOrder";
import { OrderDAOMemory } from "../in-memory-dao/order-dao-memory";
import { WebSocketClient } from "../../src/WebSocket";
import { FakeWebsocketAdapter } from "../Fake/fake-websocket-adapter";

let placeOrder: PlaceOrder;
let accountDAO: AccountDAOMemory;
let orderDAO: OrderDAOMemory;
let websocketClient: FakeWebsocketAdapter;

beforeEach(() => {
  accountDAO = new AccountDAOMemory();
  orderDAO = new OrderDAOMemory();
  websocketClient = new FakeWebsocketAdapter();
  placeOrder = new PlaceOrder(orderDAO, accountDAO, websocketClient);
});

afterEach(() => {
  sinon.restore();
});

describe("Ordem", () => {
  test("Deve criar uma ordem de venda", async () => {
    const accountId = randomUUID();
    const accountDaoMock = sinon.mock(AccountDAOMemory.prototype);
    const orderDaoMock = sinon.mock(OrderDAOMemory.prototype);
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    accountDaoMock.expects("getAccountAssetBalance").once().resolves({
      account_id: accountId,
      asset_id: "BTC",
      quantity: 10,
    });

    orderDaoMock.expects("getOpenOrdersByAccountAndAsset").once().resolves([]);

    const inputPlaceOrder = {
      marketId: "BTC/USD",
      accountId,
      side: "sell",
      quantity: 1,
      price: 94000,
    };
    const orderOutput = await placeOrder.execute(inputPlaceOrder);
    expect(orderOutput).toBeDefined();
    accountDaoMock.verify();
  });
});

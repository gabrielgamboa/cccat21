import pgp from "pg-promise";

export default interface OrderDAO {
  getOrdersByAccountId(accountId: any): any;
  getOrderById(orderId: any): any;
  createOrder(order: any): any;
  getOrdersByMarketId(marketId: string): any;
  getOpenOrdersByAccountAndAsset(
    accountId: string,
    assetId: string
  ): Promise<any>;
}

export class OrderDAODatabase implements OrderDAO {
  getOrdersByAccountId(accountId: any) {
    throw new Error("Method not implemented.");
  }
  getOrderById(orderId: any) {
    throw new Error("Method not implemented.");
  }
  async createOrder(order: any) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ccca.order (order_id, market_id, account_id, side, quantity, price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        order.orderId,
        order.marketId,
        order.accountId,
        order.side,
        order.quantity,
        order.price,
        order.status,
        order.timestamp,
      ]
    );
    await connection.$pool.end();
  }
  async getOrdersByMarketId(marketId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const orders = await connection.query(
      "select * from ccca.order where market_id = $1",
      [marketId]
    );
    await connection.$pool.end();
    return orders.map((order: any) => ({
      orderId: order.order_id,
      accountId: order.account_id,
      marketId: order.market_id,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      timestamp: order.timestamp,
    }));
  }
  async getOpenOrdersByAccountAndAsset(
    accountId: string,
    assetId: string
  ): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const openOrders = await connection.query(
      "select * from ccca.order where account_id = $1 and asset_id = $2 and status = 'open'",
      [accountId, assetId]
    );
    await connection.$pool.end();
    return openOrders;
  }
}

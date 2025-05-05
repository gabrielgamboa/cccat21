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
  getOrdersByMarketId(marketId: string) {
    throw new Error("Method not implemented.");
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

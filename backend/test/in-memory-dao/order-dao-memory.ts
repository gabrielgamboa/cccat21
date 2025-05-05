import OrderDAO from "../../src/OrderDAO";

export class OrderDAOMemory implements OrderDAO {
  orders: any = [];

  getOrdersByMarketId(marketId: string): any[] {
    const orderList = this.orders.filter(
      (order: any) => order.marketId === marketId
    );
    return orderList;
  }

  getOrdersByAccountId(accountId: any) {
    const orders = this.orders.filter(
      (order: any) => order.accountId === accountId
    );
    return orders;
  }

  getOrderById(orderId: any) {
    const order = this.orders.find((order: any) => order.orderId === orderId);
    return order;
  }

  createOrder(order: any) {
    const orderId = crypto.randomUUID();
    order.orderId = orderId;
    order.timestamp = new Date();
    order.status = "Created";
    this.orders.push(order);
    return orderId;
  }

  async getOpenOrdersByAccountAndAsset(
    accountId: string,
    assetId: string
  ): Promise<any> {
    return this.orders.filter(
      (order: any) =>
        order.accountId === accountId &&
        order.assetId === assetId &&
        order.status === "open"
    );
  }
}

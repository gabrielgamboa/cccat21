import OrderDAO from "./OrderDAO";

export class GetDepth {
  readonly orderDAO: OrderDAO;

  constructor(orderDAO: OrderDAO) {
    this.orderDAO = orderDAO;
  }

  async execute(input: any) {
    const { marketId, precision } = input;
    if (precision < 0) throw new Error("Invalid precision");
    const orders = await this.orderDAO.getOrdersByMarketId(marketId);

    const orderBuys = orders.filter((order: any) => order.side === "buy");
    const orderSells = orders.filter((order: any) => order.side === "sell");

    const buys = this.aggregateOrdersBySide(orderBuys, precision);
    const sells = this.aggregateOrdersBySide(orderSells, precision);

    return { buys, sells };
  }

  private aggregateOrdersBySide(orders: any[], precision: number): any[] {
    const resultMap = new Map<
      string,
      { quantity: number; marketId: string; side: string }
    >();
    orders.forEach((order) => {
      const priceWithPrecision = this.getPrice(order.price, precision);
      if (!resultMap.has(priceWithPrecision)) {
        resultMap.set(priceWithPrecision, {
          quantity: order.quantity,
          marketId: order.marketId,
          side: order.side,
        });
        return;
      }
      const quantity =
        resultMap.get(priceWithPrecision)?.quantity + order.quantity;
      resultMap.set(priceWithPrecision, {
        quantity,
        marketId: order.marketId,
        side: order.side,
      });
    });
    const result = [];
    for (const [key, value] of resultMap.entries()) {
      const originalPrice = this.getOriginalPrice(key, precision);
      result.push({
        price: originalPrice,
        quantity: value.quantity,
        marketId: value.marketId,
        side: value.side,
      });
    }
    const sortedResultByPrice = result.sort((a, b) => a.price - b.price);
    return sortedResultByPrice;
  }

  //metodo privado pra pegar o valor que preciso garantir nas comparações
  private getPrice(value: number, precision: number): string {
    const stringValue = `${value}`;
    return stringValue.substring(0, stringValue.length - precision);
  }

  //outra função pra devolver o valor original

  private getOriginalPrice(value: string, precision: number): number {
    const valueToNumber = Number(value);
    return valueToNumber * Math.pow(10, precision);
  }
}

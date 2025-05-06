import { WebSocket } from "ws";
import AccountDAO from "./AccountDAO";
import OrderDAO from "./OrderDAO";
import crypto from "crypto";
import WebSocketClientInterface, { WebSocketClient } from "./WebSocket";

export class PlaceOrder {
  private validSides = ["buy", "sell"];

  constructor(
    private readonly orderDAO: OrderDAO,
    private readonly accountDAO: AccountDAO,
    private readonly webSocketClient: WebSocketClientInterface
  ) {}

  async execute(input: any) {
    // Verificar se a conta existe
    const account = await this.accountDAO.getAccountById(input.accountId);
    if (!account) throw new Error("Account not found");

    // Determinar os ativos envolvidos
    const [baseAsset, quoteAsset] = input.marketId.split("/");

    if (!baseAsset || !quoteAsset) throw new Error("Invalid market ID");
    if (!this.validSides.includes(input.side))
      throw new Error("Invalid order side");

    // Verificar saldo suficiente considerando ordens abertas
    if (input.side === "sell") {
      // Venda: verificar saldo do ativo principal (baseAsset)
      const baseAssetBalance = await this.accountDAO.getAccountAssetBalance(
        input.accountId,
        baseAsset
      );
      const openOrders = await this.orderDAO.getOpenOrdersByAccountAndAsset(
        input.accountId,
        baseAsset
      );
      const reservedQuantity = openOrders
        .filter((order: any) => order.side === "sell")
        .reduce((sum: number, order: any) => sum + order.quantity, 0);
      const availableBalance = baseAssetBalance.quantity - reservedQuantity;

      if (availableBalance < input.quantity) {
        throw new Error("Insufficient asset balance for selling");
      }
    } else if (input.side === "buy") {
      // Compra: verificar saldo do ativo de pagamento (quoteAsset)
      const totalCost = input.quantity * input.price;
      const quoteAssetBalance = await this.accountDAO.getAccountAssetBalance(
        input.accountId,
        quoteAsset
      );
      const openOrders = await this.orderDAO.getOpenOrdersByAccountAndAsset(
        input.accountId,
        quoteAsset
      );
      const reservedQuantity = openOrders
        .filter((order: any) => order.side === "buy")
        .reduce(
          (sum: number, order: any) => sum + order.quantity * order.price,
          0
        );
      const availableBalance = quoteAssetBalance.quantity - reservedQuantity;

      if (availableBalance < totalCost) {
        throw new Error("Insufficient asset balance for buying");
      }
    }

    // Criar a ordem
    const order = {
      orderId: crypto.randomUUID(),
      marketId: input.marketId,
      accountId: input.accountId,
      side: input.side,
      quantity: input.quantity,
      price: input.price,
      status: "open",
      timestamp: new Date(),
    };

    // Salvar a ordem no mecanismo de persistência
    await this.orderDAO.createOrder(order);

    await this.webSocketClient.sendMessage(JSON.stringify(order));

    // Retornar o ID da ordem criada
    return order.orderId;
  }
}

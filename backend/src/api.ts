import express, { Request, Response } from "express";
import cors from "cors";
import Signup from "./Signup";
import { AccountDAODatabase } from "./AccountDAO";
import GetAccount from "./GetAccount";
import ws from "ws";
import Deposit from "./Deposit";
import { Withdraw } from "./Withdraw";
import { PlaceOrder } from "./PlaceOrder";
import { OrderDAODatabase } from "./OrderDAO";
import { WebSocketClient } from "./WebSocket";

// Driver

const websocketServer = new ws.Server({ port: 8080 });
const app = express();
app.use(express.json());
app.use(cors());

websocketServer.on("connection", function (socket) {
  // Quando você receber uma mensagem, enviamos ela para todos os sockets
  socket.on("message", function (msg) {
    console.log("Mensagem recebida: " + msg);
  });
});

const websocketClient = new WebSocketClient();
const accountDAO = new AccountDAODatabase();
const orderDAO = new OrderDAODatabase();
const signup = new Signup(accountDAO);
const getAccount = new GetAccount(accountDAO);
const deposit = new Deposit(accountDAO);
const withdraw = new Withdraw(accountDAO);
const placeOrder = new PlaceOrder(orderDAO, accountDAO, websocketClient);

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const output = await signup.execute(input);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.post("/deposit", async (req: Request, res: Response) => {
  const input = req.body;
  await deposit.execute(input);
  res.end();
});

app.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const input = req.body;
    await withdraw.execute(input);
    res.end();
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.post("/place_order", async (req: Request, res: Response) => {
  const input = req.body;
  const output = await placeOrder.execute(input);
  res.json(output);
});

// app.get("/orders/:orderId", async (req: Request, res: Response) => {
//   const orderId = req.params.orderId;
//   const output = await getOrder(orderId);
//   res.json(output);
// });

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const accountId = req.params.accountId;
  const output = await getAccount.execute(accountId);
  res.json(output);
});

app.listen(3000);

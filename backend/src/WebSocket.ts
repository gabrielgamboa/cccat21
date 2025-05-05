import { WebSocket } from "ws";

export default interface WebSocketClientInterface {
  sendMessage(message: string): Promise<void>;
}

export class WebSocketClient implements WebSocketClientInterface {
  readonly client: WebSocket;

  constructor() {
    this.client = new WebSocket("ws://localhost:8080");
  }

  async sendMessage(message: string) {
    this.client.on("open", () => {
      console.log("Conexão WebSocket aberta");

      this.client.send(JSON.stringify(message));
    });
  }
}

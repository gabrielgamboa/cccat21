import WebSocketClientInterface from "../../src/WebSocket";

export class FakeWebsocketAdapter implements WebSocketClientInterface {
  async sendMessage(message: string): Promise<void> {
    console.log(
      "FakeWebsocketAdapter: sendMessage called with message:",
      message
    );
  }
}

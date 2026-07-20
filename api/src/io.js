import { Server } from "socket.io";

let io = null;

export function initIO(httpServer, corsOrigins) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigins, credentials: true },
  });
  return io;
}

export function getIO() {
  return io;
}

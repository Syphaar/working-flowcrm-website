import { Server as SocketServer } from "socket.io";
import { verifyToken } from "../auth/jwt.js";

export function setupNotificationSocket(io: SocketServer): void {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    const token = socket.handshake.auth.token;

    if (token) {
      try {
        const payload = verifyToken(token);
        socket.join(`user:${payload.userId}`);
        console.log(`User ${payload.name} joined their room`);
      } catch {
        console.log("Invalid token for socket connection");
      }
    }

    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

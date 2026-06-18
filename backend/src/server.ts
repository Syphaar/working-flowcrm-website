import http from "http";
import { createApp } from "./app.js";
import { environment } from "./config/environment.js";
import { initializeSocket } from "./config/socket.js";
import { setupNotificationSocket } from "./sockets/notification.socket.js";

async function start() {
  const application = await createApp();
  const server = http.createServer(application);

  const io = initializeSocket(server);
  setupNotificationSocket(io);

  server.listen(environment.port, () => {
    console.log(`FlowCRM backend running on http://localhost:${environment.port}`);
    console.log(`Health check: http://localhost:${environment.port}/api/health`);
    console.log(`WebSocket server is running`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default start;

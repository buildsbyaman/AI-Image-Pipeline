import { Router } from "express";
import { authenticate, sseAuthenticate } from "../auth/auth.middleware";
import { notificationProxy } from "./notification.proxy";
import { sseService } from "./sse.service";

const router = Router();

router.get("/stream", sseAuthenticate, (req: any, res) => {
  const userId = req.user?.userId || req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // CORS headers (Access-Control-Allow-Origin, etc.) are handled by global cors middleware.
  // Adding them manually here causes duplicate headers, which browsers (like Firefox) block.
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  
  res.write("retry: 10000\n\n");

  sseService.addClient(userId, res);

  req.on("close", () => {
    sseService.removeClient(userId, res);
  });
});

router.use("/", authenticate, notificationProxy);

export default router;

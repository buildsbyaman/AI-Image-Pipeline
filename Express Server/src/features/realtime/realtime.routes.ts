import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { notificationProxy } from "./notification.proxy";
import { sseService } from "./sse.service";

const router = Router();

router.get("/stream", authenticate, (req: any, res) => {
  const userId = req.user?.userId || req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
  });
  
  res.write("retry: 10000\n\n");

  sseService.addClient(userId, res);

  req.on("close", () => {
    sseService.removeClient(userId, res);
  });
});

router.use("/", authenticate, notificationProxy);

export default router;

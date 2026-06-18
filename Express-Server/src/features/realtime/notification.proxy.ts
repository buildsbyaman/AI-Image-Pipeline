import proxy from "express-http-proxy";
import { env } from "../../config";
import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const notificationProxy = proxy(env.NOTIFICATION_SERVICE_URL || "http://localhost:5005", {
  proxyReqPathResolver: (req: Request) => {
    const path = req.url;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/api/v1/notifications${cleanPath}`;
  },
  proxyReqOptDecorator: (proxyReqOpts: any, srcReq: AuthRequest) => {
    if (srcReq.user && srcReq.user.id) {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
      proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
    }
    return proxyReqOpts;
  },
});

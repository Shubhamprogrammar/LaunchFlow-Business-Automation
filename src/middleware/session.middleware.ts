import { auth } from "../lib/auth";

export const requireAuth = async (req: any, res: any, next: any) => {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  req.user = session.user;
  req.session = session.session;

  next();
};
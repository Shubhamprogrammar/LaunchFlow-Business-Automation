import { Request, Response } from "express";
import { addClient, removeClient } from "./realtime.store";

export const subscribeEvents = async (
  req: Request,
  res: Response
) => {
  const userId = req.user.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  addClient(userId, res);

  req.on("close", () => {
    removeClient(res);
  });
};
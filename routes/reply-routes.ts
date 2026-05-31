import express from "express";
import { replyController } from "../controllers";
import { authenticateToken } from "../middlewares";

export const replyRouter: express.Router = express.Router();

replyRouter.get("/comment/:commentId", replyController.getByCommentId.bind(replyController));
replyRouter.get("/count/:commentId", replyController.getCountOnComment.bind(replyController));
replyRouter.get("/", replyController.getAll.bind(replyController));
replyRouter.get("/:id", replyController.getById.bind(replyController));
replyRouter.post("/", authenticateToken, replyController.create.bind(replyController));
replyRouter.post("/like", authenticateToken, replyController.like.bind(replyController));
replyRouter.delete("/:id", authenticateToken, replyController.deleteById.bind(replyController));
replyRouter.put("/", authenticateToken, replyController.update.bind(replyController));

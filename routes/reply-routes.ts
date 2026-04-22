import express from "express";
import { replyController } from "../controllers";

export const replyRouter: express.Router = express.Router();

replyRouter.get("/comment/:commentId", replyController.getByCommentId.bind(replyController));
replyRouter.get("/", replyController.getAll.bind(replyController));
replyRouter.get("/:id", replyController.getById.bind(replyController));
replyRouter.post("/", replyController.create.bind(replyController));
replyRouter.delete("/:id", replyController.deleteById.bind(replyController));
replyRouter.put("/", replyController.update.bind(replyController));

import express from "express";
import { commentController } from "../controllers";
import { authenticateToken } from "../middlewares";

export const commentRouter: express.Router = express.Router();

commentRouter.get("/post/:postId", commentController.getByPostId.bind(commentController));
commentRouter.get("/", commentController.getAll.bind(commentController));
commentRouter.get("/:id", commentController.getById.bind(commentController));
commentRouter.post("/", authenticateToken, commentController.create.bind(commentController));
commentRouter.post("/like", authenticateToken, commentController.like.bind(commentController));
commentRouter.delete(
	"/:id",
	authenticateToken,
	commentController.deleteById.bind(commentController),
);
commentRouter.put("/", authenticateToken, commentController.update.bind(commentController));

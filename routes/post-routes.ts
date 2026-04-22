import express from "express";
import { postController } from "../controllers";
import { postUpload, authenticateToken } from "../middlewares";

export const postRouter: express.Router = express.Router();

postRouter.get("/", postController.getAll.bind(postController));
postRouter.get("/:id", postController.getById.bind(postController));
postRouter.post(
	"/",
	authenticateToken,
	postUpload.array("postImgs"),
	postController.create.bind(postController),
);
postRouter.delete("/:id", postController.deleteById.bind(postController));
postRouter.put("/", postController.update.bind(postController));

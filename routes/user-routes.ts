import express from "express";
import { userController } from "../controllers";
import { authenticateToken, restrictToAdmin } from "../middlewares";

export const userRouter: express.Router = express.Router();

userRouter.get("/", userController.getAll.bind(userController));
userRouter.post("/register", userController.create.bind(userController));
userRouter.delete("/", userController.deleteById.bind(userController));
userRouter.put("/profile", userController.update.bind(userController));
userRouter.post("/login", userController.authenticate.bind(userController));
userRouter.get(
	"/count",
	authenticateToken,
	restrictToAdmin,
	userController.getCount.bind(userController),
);
userRouter.get("/:username", userController.getByUsername.bind(userController));

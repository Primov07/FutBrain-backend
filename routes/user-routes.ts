import express from "express";
import { userController } from "../controllers";
import { authenticateToken, restrictToAdmin } from "../middlewares";
import { userUpload } from "../middlewares/multer-config";

export const userRouter: express.Router = express.Router();

userRouter.get("/", userController.getAll.bind(userController));
userRouter.post("/register", userController.create.bind(userController));
userRouter.delete("/", userController.deleteById.bind(userController));
userRouter.put(
	"/profile",
	authenticateToken,
	userUpload.single("avatar"),
	userController.upload.bind(userController),
);
userRouter.post("/login", userController.authenticate.bind(userController));
userRouter.get(
	"/count",
	authenticateToken,
	restrictToAdmin,
	userController.getCount.bind(userController),
);
userRouter.get(
	"/me",
	authenticateToken,
	userController.getCurrentUser.bind(userController),
);
userRouter.put(
	"/:id/role",
	authenticateToken,
	restrictToAdmin,
	userController.updateRole.bind(userController),
);
userRouter.get("/:username", userController.getByUsername.bind(userController));

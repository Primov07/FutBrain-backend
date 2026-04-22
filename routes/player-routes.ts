import express from "express";
import { playerController } from "../controllers";
import {
	playerUpload,
	restrictToAdmin,
	authenticateToken,
} from "../middlewares";

export const playerRouter: express.Router = express.Router();

playerRouter.get(
	"/count",
	authenticateToken,
	restrictToAdmin,
	playerController.getCount.bind(playerController),
);
playerRouter.get("/", playerController.getAll.bind(playerController));
playerRouter.get("/:id", playerController.getById.bind(playerController));

playerRouter.post(
	"/",
	authenticateToken,
	restrictToAdmin,
	playerUpload.single("playerImg"),
	playerController.create.bind(playerController),
);
playerRouter.post(
	"/vote",
	authenticateToken,
	playerController.getAll.bind(playerController),
);

playerRouter.delete(
	"/:id",
	authenticateToken,
	restrictToAdmin,
	playerController.deleteById.bind(playerController),
);
playerRouter.put(
	"/",
	authenticateToken,
	restrictToAdmin,
	playerUpload.single("playerImg"),
	playerController.update.bind(playerController),
);

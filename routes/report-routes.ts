import express from "express";
import { reportController } from "../controllers";
import { authenticateToken, restrictToAdmin } from "../middlewares";

export const reportRouter: express.Router = express.Router();

reportRouter.get(
	"/",
	authenticateToken,
	restrictToAdmin,
	reportController.getAll.bind(reportController),
);
reportRouter.get(
	"/count",
	authenticateToken,
	restrictToAdmin,
	reportController.getCount.bind(reportController),
);
reportRouter.get(
	"/:id",
	authenticateToken,
	restrictToAdmin,
	reportController.getById.bind(reportController),
);
reportRouter.post(
	"/",
	authenticateToken,
	reportController.create.bind(reportController),
);
reportRouter.post(
	"/:id/resolve",
	authenticateToken,
	restrictToAdmin,
	reportController.resolve.bind(reportController),
);

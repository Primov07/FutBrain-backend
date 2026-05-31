import { NextFunction, Request, Response } from "express";
import { ReportService, ModerationService } from ".";
import { CreateReportDTO, UpdateReportStatusDTO } from "../dtos/report";
import { AppError } from "../middlewares/error-handler";

class ReportController {
	constructor(
		private readonly reportService: ReportService,
		private readonly moderationService: ModerationService,
	) {}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const reports = await this.reportService.getAll();
			if (!reports) throw new AppError("Няма налични доклади", 404);
			res.json(reports);
		} catch (error) {
			next(error);
		}
	}

	public async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const report = await this.reportService.getById(id);
			if (!report) throw new AppError("Докладът не е намерен", 404);
			res.json(report);
		} catch (error) {
			next(error);
		}
	}

	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const dto: CreateReportDTO = req.body;

			const isSafe = await this.moderationService.isContentSafe(dto.content);
			if (!isSafe) {
				throw new AppError(
					"Вашият доклад беше отхвърлен от AI модератора поради неподходящо съдържание.",
					400,
				);
			}
			const id = await this.reportService.create(dto);
			res.status(201).json({ id, message: "Докладът е изпратен успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async resolve(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const { action } = req.body;
			const success = await this.reportService.resolveReport(id, action);
			if (!success) throw new AppError("Грешка при обработка на доклада", 500);
			res.json({
				message: `Докладът беше ${action === "Approve" ? "одобрен" : "отхвърлен"} успешно!`,
			});
		} catch (error) {
			next(error);
		}
	}

	public async getCount(req: Request, res: Response, next: NextFunction) {
		try {
			const count = await this.reportService.countPending();
			res.json({ count });
		} catch (error) {
			next(error);
		}
	}
}

export const reportController: ReportController = new ReportController(
	new ReportService(),
	new ModerationService(),
);

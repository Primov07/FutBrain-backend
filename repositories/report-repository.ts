import { ReportModel, Report } from "../models";

export class ReportRepository {
	public async getAll(): Promise<Array<Report> | null> {
		return await ReportModel.find().populate("from", "username").lean().exec();
	}

	public async getById(id: string): Promise<Report | null> {
		return await ReportModel.findById(id).populate("from", "username").lean().exec();
	}

	public async create(report: Partial<Report>): Promise<Report> {
		const model = new ReportModel(report);
		await model.save();
		return model.toObject();
	}

	public async updateStatus(id: string, status: string): Promise<Report | null> {
		const report = await ReportModel.findById(id);
		if (!report) return null;
		report.status = status;
		await report.save();
		return report.toObject();
	}

	public async countPending(): Promise<number> {
		return await ReportModel.countDocuments({ status: "Pending" }).exec();
	}
}

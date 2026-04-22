import { Types } from "mongoose";
import { ReportModel, Report } from ".";
import { DocumentType } from "@typegoose/typegoose";

export class ReportRepository {
	public async getAll(): Promise<Array<Report> | null> {
		const reports: Array<Report> | null = await ReportModel.find()
			.lean()
			.exec();
		return reports;
    }
    
    public async create(report: Report): Promise<string> {
            const model: DocumentType<Report> = new ReportModel(report);
            await model.save();
        return model._id.toString();
    }

   public async update(report: Report): Promise<void | null> {
        const id: string = report.id.toString();
        let found = await ReportModel.findById(new Types.ObjectId(id));
   
        if (!found) return null;
   
        found.status = report.status;
   
        await found.save();
    }
}

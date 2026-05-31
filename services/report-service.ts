import { ReportRepository, UserRepository, PostRepository, CommentRepository, ReplyRepository } from "../repositories";
import { CreateReportDTO, ReportDTO, UpdateReportStatusDTO } from "../dtos/report";
import { Report } from "../models";
import { AppError } from "../controllers";

export class ReportService {
	constructor(
		private readonly reportRepository: ReportRepository = new ReportRepository(),
		private readonly userRepository: UserRepository = new UserRepository(),
		private readonly postRepository: PostRepository = new PostRepository(),
		private readonly commentRepository: CommentRepository = new CommentRepository(),
		private readonly replyRepository: ReplyRepository = new ReplyRepository(),
	) {}

	public async getAll(): Promise<Array<ReportDTO> | null> {
		const reports = await this.reportRepository.getAll();
		if (!reports) return null;
		return reports.map((r) => this.toReportDTO(r));
	}

	public async getById(id: string): Promise<ReportDTO | null> {
		const report = await this.reportRepository.getById(id);
		if (!report) return null;
		return this.toReportDTO(report);
	}

	public async create(dto: CreateReportDTO): Promise<string> {
		const report: Partial<Report> = {
			content: dto.content,
			from: dto.from,
			targetType: dto.targetType,
			targetId: dto.targetId,
			sentDate: new Date(),
			status: "Pending",
		};
		const created = await this.reportRepository.create(report);
		return created.id;
	}

	public async updateStatus(dto: UpdateReportStatusDTO): Promise<boolean> {
		const updated = await this.reportRepository.updateStatus(dto.id, dto.status);
		return updated !== null;
	}

	public async countPending(): Promise<number> {
		return await this.reportRepository.countPending();
	}

	public async resolveReport(id: string, action: "Approve" | "Reject"): Promise<boolean> {
		const report = await this.reportRepository.getById(id);
		if (!report) return false;

		if (action === "Reject") {
			await this.reportRepository.updateStatus(id, "Rejected");
			return true;
		}

		let targetOwnerId: string | null = null;
		if (report.targetType === "Post") {
			const post = await this.postRepository.getById(report.targetId);
			if (post) targetOwnerId = (post.user as any)._id.toString();
		} else if (report.targetType === "Comment") {
			const comment = await this.commentRepository.getById(report.targetId);
			if (comment) targetOwnerId = (comment.user as any)._id.toString();
		} else if (report.targetType === "Reply") {
			const reply = await this.replyRepository.getById(report.targetId);
			if (reply) targetOwnerId = (reply.user as any)._id.toString();
		}

		if (targetOwnerId) {
			const user = await this.userRepository.getById(targetOwnerId);
			if (user) {
				user.strikes = user.strikes + 1;
				await this.userRepository.update(user);
			} else throw new AppError("Потребителят не е намерен", 404);
		} else throw new AppError("Потребителят не е намерен", 404);

		if (report.targetType === "Post") {
			await this.replyRepository.deleteByPostId(report.targetId);
			await this.commentRepository.deleteByPostId(report.targetId);
			await this.postRepository.deleteById(report.targetId);
		} else if (report.targetType === "Comment") {
			await this.replyRepository.deleteByCommentId(report.targetId);
			await this.commentRepository.deleteById(report.targetId);
		} else if (report.targetType === "Reply") {
			await this.replyRepository.deleteById(report.targetId);
		}

		await this.reportRepository.updateStatus(id, "Resolved");
		return true;
	}

	private toReportDTO(report: any): ReportDTO {
		return {
			id: report.id || report._id.toString(),
			content: report.content,
			from: report.from,
			sentDate: report.sentDate,
			targetType: report.targetType,
			targetId: report.targetId,
			status: report.status,
		};
	}
}

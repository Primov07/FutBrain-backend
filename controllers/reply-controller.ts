import { NextFunction, Request, Response } from "express";
import { ReplyService } from "../services/reply-service";
import { ReplyDTO, CreateReplyDTO, UpdateReplyDTO } from "../dtos";
import { AppError } from "../middlewares/error-handler";
import { LikeService } from "../services/like-service";

class ReplyController {
	constructor(
		private readonly replyService: ReplyService,
		private readonly likeService: LikeService,
	) {}

	public async getByCommentId(req: Request, res: Response, next: NextFunction) {
		try {
			const commentId = req.params.commentId?.toString()!;
			const page = parseInt(req.query.page as string) || 1;
			const replies = await this.replyService.getRepliesByComment(commentId, page);
			res.json(replies);
		} catch (error) {
			next(error);
		}
	}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const replies: Array<ReplyDTO> | null = await this.replyService.getAll();
			if (!replies) throw new AppError("Няма намерени отговори", 404);
			res.json(replies);
		} catch (error) {
			next(error);
		}
	}

	public async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const reply: ReplyDTO | null = await this.replyService.getById(id);
			if (!reply) throw new AppError("Отговорът не е намерен", 404);
			res.json(reply);
		} catch (error) {
			next(error);
		}
	}

	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const replyDTO: CreateReplyDTO = req.body;
			await this.replyService.create(replyDTO);
			res.status(201).json({ message: "Отговорът е създаден успешно!" });
		} catch (err) {
			next(err);
		}
	}

	public async deleteById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const ifDeleted: boolean = await this.replyService.deleteById(id);
			if (!ifDeleted) throw new AppError("Отговорът не е намерен", 404);
			res.status(200).json({ message: "Отговорът е изтрит успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const replyDTO: UpdateReplyDTO = req.body;
			const updated = await this.replyService.update(replyDTO);
			if (updated === null) throw new AppError("Отговорът не е намерен", 404);
			res.status(200).json({ message: "Отговорът е актуализиран успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async like(req: Request, res: Response, next: NextFunction) {
		try {
			this.likeService.handleReplyLike(req.body.replyId, req.body.userId);
			res
				.status(201)
				.json({ message: "Харесването на отговора беше успешно!" });
		} catch (err) {
			next(err);
		}
	}
}

export const replyController: ReplyController = new ReplyController(
	new ReplyService(),
	new LikeService(),
);

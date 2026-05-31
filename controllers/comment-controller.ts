import { NextFunction, Request, Response } from "express";
import { CommentService } from "../services/comment-service";
import { LikeService } from "../services/like-service";
import { ModerationService } from "../services/moderation-service";
import { CommentDTO, CreateCommentDTO, UpdateCommentDTO } from "../dtos";
import { AppError } from "../middlewares/error-handler";

class CommentController {
	constructor(
		private readonly commentService: CommentService,
		private readonly likeService: LikeService,
		private readonly moderationService: ModerationService,
	) {}

	public async getByPostId(req: Request, res: Response, next: NextFunction) {
		try {
			const postId = req.params.postId?.toString()!;
			const page = parseInt(req.query.page as string) || 1;
			const comments = await this.commentService.getCommentsByPost(postId, page);
			res.json(comments);
		} catch (error) {
			next(error);
		}
	}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const comments: Array<CommentDTO> | null =
				await this.commentService.getAll();
			if (!comments) throw new AppError("Няма намерени коментари", 404);
			res.json(comments);
		} catch (error) {
			next(error);
		}
	}

	public async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const comment: CommentDTO | null = await this.commentService.getById(id);
			if (!comment) throw new AppError("Коментарът не е намерен", 404);
			res.json(comment);
		} catch (error) {
			next(error);
		}
	}

	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const commentDTO: CreateCommentDTO = req.body;

			const isSafe = await this.moderationService.isContentSafe(commentDTO.content);
			if (!isSafe) {
				throw new AppError("Коментарът беше отхвърлен от AI модератора поради неподходящо съдържание.", 400);
			}

			await this.commentService.create(commentDTO);
			res.status(201).json({ message: "Коментарът е създаден успешно!" });
		} catch (err) {
			next(err);
		}
	}

	public async deleteById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const ifDeleted: boolean = await this.commentService.deleteById(id);
			if (!ifDeleted) throw new AppError("Коментарът не е намерен", 404);
			res.status(200).json({ message: "Коментарът е изтрит успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const commentDTO: UpdateCommentDTO = req.body;

			// AI Модерация
			const isSafe = await this.moderationService.isContentSafe(commentDTO.content);
			if (!isSafe) {
				throw new AppError("Промените в коментара бяха отхвърлени поради неподходящо съдържание.", 400);
			}

			const updated = await this.commentService.update(commentDTO);
			if (updated === null) throw new AppError("Коментарът не е намерен", 404);
			res.status(200).json({ message: "Коментарът е актуализиран успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async like(req: Request, res: Response, next: NextFunction) {
		try {
			await this.likeService.handleCommentLike(req.body.commentId, req.body.userId);
			res.status(201).json({ message: "Харесването на коментара беше успешно!" });
		} catch (err) {
			next(err);
		}
	}
}

export const commentController: CommentController = new CommentController(
	new CommentService(),
	new LikeService(),
	new ModerationService(),
);

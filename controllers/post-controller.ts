import { NextFunction, Request, Response } from "express";
import { PostService } from "../services/post-service";
import { PostDTO, CreatePostDTO, UpdatePostDTO } from "../dtos";
import { AppError } from "../middlewares/error-handler";
import { LikeService } from "../services/like-service";

class PostController {
	constructor(
		private readonly postService: PostService,
		private readonly likeService: LikeService,
	) {}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const page = parseInt(req.query.page as string);
			if (page) {
				const posts: Array<PostDTO> | null = await this.postService.getPostsPaginated(page);
				if (!posts) throw new AppError("Няма намерени публикации", 404);
				res.json(posts);
			} else {
				const posts: Array<PostDTO> | null = await this.postService.getAll();
				if (!posts) throw new AppError("Няма намерени публикации", 404);
				res.json(posts);
			}
		} catch (error) {
			next(error);
		}
	}

	public async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const post: PostDTO | null = await this.postService.getById(id);
			if (!post) throw new AppError("Публикацията не е намерена", 404);
			res.json(post);
		} catch (error) {
			next(error);
		}
	}

	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const postDTO: CreatePostDTO = req.body;
			const result = await this.postService.create(postDTO);
			if (!result) throw new AppError("Грешка при създаването на играча!", 500);
			res.status(201).json({ message: "Публикацията е създадена успешно!" });
		} catch (err) {
			next(err);
		}
	}

	public async deleteById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const ifDeleted: boolean = await this.postService.deleteById(id);
			if (!ifDeleted) throw new AppError("Публикацията не е намерена", 404);
			res.status(200).json({ message: "Публикацията е изтрита успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const postDTO: UpdatePostDTO = req.body;
			const updated = await this.postService.update(postDTO);
			if (updated === null)
				throw new AppError("Публикацията не е намерена", 404);
			res
				.status(200)
				.json({ message: "Публикацията е актуализирана успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async like(req: Request, res: Response, next: NextFunction) {
		try {
			this.likeService.handlePostLike(req.body.postId, req.body.userId);
			res
				.status(201)
				.json({ message: "Харесването на публикацията беше успешно!" });
		} catch (err) {
			next(err);
		}
	}
}

export const postController: PostController = new PostController(
	new PostService(),
	new LikeService(),
);

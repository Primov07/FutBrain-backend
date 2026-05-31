import { NextFunction, Request, Response } from "express";
import { PostService } from "../services/post-service";
import { PostDTO, CreatePostDTO, UpdatePostDTO, CommentDTO } from "../dtos";
import { AppError } from "../middlewares/error-handler";
import { LikeService } from "../services/like-service";
import { ModerationService } from "../services/moderation-service";
import fs from "fs";

class PostController {
	constructor(
		private readonly postService: PostService,
		private readonly likeService: LikeService,
		private readonly moderationService: ModerationService,
	) {}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const page = parseInt(req.query.page as string);
			if (page) {
				const posts: Array<PostDTO> | null =
					await this.postService.getPostsPaginated(page);
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
		const safeRename = (oldPath: string, newPath: string) => {
			try {
				fs.renameSync(oldPath, newPath);
			} catch {
				throw new AppError("Грешка при запазване на снимката", 500);
			}
		};

		const safeCreate = async (dto: CreatePostDTO) => {
			try {
				const id: string = await this.postService.create(dto);
				return id;
			} catch (err) {
				throw new AppError("Грешка при валидацията на поста!", 500);
			}
		};
		try {
			const postDTO: CreatePostDTO = req.body;

			const isSafe = await this.moderationService.isContentSafe(
				postDTO.title + " " + postDTO.content,
			);
			if (!isSafe) {
				throw new AppError(
					"Вашият пост беше отхвърлен от AI модератора поради неподходящо съдържание.",
					400,
				);
			}

			const id: string = await safeCreate(postDTO);

			if (req.file) {
				const oldPath: string = `uploads/posts/${req.file?.filename!}`;
				const newPath: string = `uploads/posts/${id}.webp`;
				safeRename(oldPath, newPath);

				const post = await this.postService.getById(id);
              if (post) {
                 await this.postService.update({
                      id: id,
                      title: post.title,
                      content: post.content,
                      photo: `${id}.webp`
                  });
              }
			}
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

	public async getComments(req: Request, res: Response, next: NextFunction) {
		try {
			const postId: string = req.params.id!.toString();
			const comments: Array<CommentDTO> | null =
				await this.postService.getComments(postId);
			if (!comments) {
				throw new AppError("Няма намерени коментари за тази публикация", 404);
			}
			res.json(comments);
		} catch (error) {
			next(error);
		}
	}

	public async getPostsByUser(req: Request, res: Response, next: NextFunction) {
		try {
			const username: string = req.params.username!.toString();
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const posts: Array<PostDTO> | null =
				await this.postService.getPostsByUser(username, page, limit);
			if (!posts) {
				throw new AppError("Няма намерени публикации за този потребител", 404);
			}
			res.json(posts);
		} catch (error) {
			next(error);
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const postDTO: UpdatePostDTO = req.body;

			const isSafe = await this.moderationService.isContentSafe(
				postDTO.title + " " + postDTO.content,
			);
			if (!isSafe) {
				throw new AppError(
					"Промените бяха отхвърлени от AI модератора поради неподходящо съдържание.",
					400,
				);
			}

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

	public async getCount(req: Request, res: Response, next: NextFunction) {
		try {
			const posts: Array<PostDTO> | null = await this.postService.getAll();
			if (!posts) res.json({ count: 0 });
			else res.json({ count: posts.length });
		} catch (err) {
			next(err);
		}
	}

	public async like(req: Request, res: Response, next: NextFunction) {
		try {
			await this.likeService.handlePostLike(req.body.postId, req.body.userId);
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
	new ModerationService(),
);

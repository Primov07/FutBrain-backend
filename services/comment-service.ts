import { CommentRepository } from "../repositories/comment-repository";
import { PostRepository, UserRepository } from "../repositories";
import { Comment } from "../models/comment";
import {
	CommentDTO,
	CreateCommentDTO,
	UpdateCommentDTO,
} from "../dtos/comment";
import { Types } from "mongoose";
import { AppError } from "../middlewares/error-handler";

export class CommentService {
	private commentRepository: CommentRepository;
	private userRepository: UserRepository;
	private postRepository: PostRepository;

	constructor() {
		this.commentRepository = new CommentRepository();
		this.userRepository = new UserRepository();
		this.postRepository = new PostRepository();
	}

	public async getCommentsByPost(
		postId: string,
		page: number,
	): Promise<CommentDTO[]> {
		const limit = 5;
		const skip = (page - 1) * limit;
		const comments = await this.commentRepository.getByPostId(postId, skip, limit);
		return comments ? comments.map((c) => this.toCommentDTO(c)) : [];
	}

	public async getAll(): Promise<Array<CommentDTO> | null> {
		const comments = await this.commentRepository.getAll();
		if (comments) return comments.map((c) => this.toCommentDTO(c));
		return null;
	}

	public async getById(id: string): Promise<CommentDTO | null> {
		const comment = await this.commentRepository.getById(id);
		if (comment) return this.toCommentDTO(comment);
		return null;
	}

	public async create(commentDTO: CreateCommentDTO): Promise<string> {
		const comment = new Comment();
		comment.content = commentDTO.content;
		comment.photos = commentDTO.photos || [];
		comment.user = commentDTO.user;
		comment.post = new Types.ObjectId(commentDTO.post);

		const commentId = await this.commentRepository.create(comment);

		const user = await this.userRepository.getById(commentDTO.user);
		if (!user) throw new AppError("Не съществува такъв потребител!", 404);

		const post = await this.postRepository.getById(commentDTO.post);
		if (!post) throw new AppError("Не съществува публикацията!", 404);

		user.comments?.push(new Types.ObjectId(commentId));
		post.comments.push(new Types.ObjectId(commentId));

		await this.userRepository.update(user);
		await this.postRepository.update(post);
		return commentId;
	}

	public async deleteById(id: string): Promise<boolean> {
		return await this.commentRepository.deleteById(id);
	}

	public async update(commentDTO: UpdateCommentDTO): Promise<void | null> {
		const comment = new Comment();
		comment.id = commentDTO.id;
		comment.content = commentDTO.content;
		return await this.commentRepository.update(comment);
	}

	private toCommentDTO(comment: any): CommentDTO {
		return {
			id: comment.id,
			content: comment.content,
			photos: comment.photos,
			user: {
				id: comment.user?._id?.toString() || comment.user?.toString() || "",
				username: comment.user?.username || "Анонимен",
				pictureURL: comment.user?.pictureURL || ""
			},
			post: comment.post?.toString() || "",
			publishDate: comment.publishDate,
			likedBy: comment.likedBy?.map((id: any) => id.toString()) || [],
			replies: comment.replies?.map((id: any) => id.toString()) || [],
		};
	}
}

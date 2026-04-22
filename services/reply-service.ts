import { ReplyRepository } from "../repositories/reply-repository";
import { CommentRepository, User, UserRepository } from "../repositories";
import { Reply } from "../models/reply";
import { ReplyDTO, CreateReplyDTO, UpdateReplyDTO } from "../dtos/reply";
import { Types } from "mongoose";
import { AppError } from "../middlewares/error-handler";

export class ReplyService {
	private replyRepository: ReplyRepository;
	private userRepository: UserRepository;
	private commentRepository: CommentRepository;
	constructor() {
		this.replyRepository = new ReplyRepository();
		this.userRepository = new UserRepository();
		this.commentRepository = new CommentRepository();
	}

	public async getRepliesByComment(
		commentId: string,
		page: number,
	): Promise<ReplyDTO[]> {
		const limit = 5;
		const skip = (page - 1) * limit;
		const replies = await this.replyRepository.getByCommentId(commentId, skip, limit);
		return replies ? replies.map((r) => this.toReplyDTO(r)) : [];
	}

	public async getAll(): Promise<Array<ReplyDTO> | null> {
		const replies = await this.replyRepository.getAll();
		if (replies) return replies.map((r) => this.toReplyDTO(r));
		return null;
	}

	public async getById(id: string): Promise<ReplyDTO | null> {
		const reply = await this.replyRepository.getById(id);
		if (reply) return this.toReplyDTO(reply);
		return null;
	}

	public async create(replyDTO: CreateReplyDTO): Promise<string> {
		const reply = new Reply();
		reply.content = replyDTO.content;
		reply.photos = replyDTO.photos || [];
		reply.user = replyDTO.user;
		reply.comment = new Types.ObjectId(replyDTO.comment);

		const replyId = await this.replyRepository.create(reply);

		const comment = await this.commentRepository.getById(replyDTO.comment);
		if (!comment) throw new AppError("Коментарът не съществува", 404);

		const user = await this.userRepository.getById(replyDTO.user);
		if (!user) throw new AppError("Не съществува такъв потребител!", 404);

		comment.replies.push(new Types.ObjectId(replyId));
		user.replies?.push(new Types.ObjectId(replyId));
		await this.commentRepository.update(comment);
		await this.userRepository.update(user);
		return replyId;
	}

	public async deleteById(id: string): Promise<boolean> {
		return await this.replyRepository.deleteById(id);
	}

	public async update(replyDTO: UpdateReplyDTO): Promise<void | null> {
		const reply = new Reply();
		reply.id = replyDTO.id;
		reply.content = replyDTO.content;
		return await this.replyRepository.update(reply);
	}

	private toReplyDTO(reply: Reply): ReplyDTO {
		return {
			id: reply.id,
			content: reply.content,
			photos: reply.photos,
			user: reply.user?.toString() || "",
			comment: reply.comment?.toString() || "",
			publishDate: reply.publishDate,
			likedBy: reply.likedBy?.map(String) || [],
		};
	}
}

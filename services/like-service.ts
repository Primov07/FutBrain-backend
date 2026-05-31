import {
	UserRepository,
	User,
	CommentRepository,
	ReplyRepository,
	PostRepository,
	Reply,
	Post,
	Comment,
} from ".";
import { AppError } from "../middlewares/error-handler";
import { Types } from "mongoose";

export class LikeService {
	private readonly postRepository: PostRepository;
	private readonly commentRepository: CommentRepository;
	private readonly replyRepository: ReplyRepository;
	private readonly userRepository: UserRepository;

	constructor() {
		this.postRepository = new PostRepository();
		this.commentRepository = new CommentRepository();
		this.replyRepository = new ReplyRepository();
		this.userRepository = new UserRepository();
	}

	public async handlePostLike(postId: string, userId: string) {
		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);
		const post: Post | null = await this.postRepository.getById(postId);
		if (!post) throw new AppError("Публикацията не е намерена!", 403);

		const likedPostId = new Types.ObjectId(postId);
		const userLikedIndex = user.likedPosts?.findIndex((id) =>
			(id as any).equals(likedPostId),
		);

		if (userLikedIndex !== undefined && userLikedIndex > -1) {
			// Unlike
			user.likedPosts?.splice(userLikedIndex, 1);
			post.likedBy = post.likedBy?.filter((id) => id !== userId)!;
		} else {
			// Like
			user.likedPosts?.push(likedPostId);
			if (!post.likedBy) post.likedBy = [];
			post.likedBy.push(userId);
		}

		await this.userRepository.update(user);
		await this.postRepository.update(post);
	}

	public async handleCommentLike(commentId: string, userId: string) {
		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);
		const comment: Comment | null = await this.commentRepository.getById(commentId);
		if (!comment) throw new AppError("Коментарът не е намерен!", 403);

		const likedCommentId = new Types.ObjectId(commentId);
		const userLikedIndex = user.likedComments?.findIndex((id) =>
			(id as any).equals(likedCommentId),
		);

		if (userLikedIndex !== undefined && userLikedIndex > -1) {
			// Unlike
			user.likedComments?.splice(userLikedIndex, 1);
			comment.likedBy = comment.likedBy?.filter((id) => id !== userId)!;
		} else {
			// Like
			user.likedComments?.push(likedCommentId);
			if (!comment.likedBy) comment.likedBy = [];
			comment.likedBy.push(userId);
		}

		await this.userRepository.update(user);
		await this.commentRepository.update(comment);
	}

	public async handleReplyLike(replyId: string, userId: string) {
		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);
		const reply: Reply | null = await this.replyRepository.getById(replyId);
		if (!reply) throw new AppError("Отговорът не е намерен!", 403);

		const likedReplyId = new Types.ObjectId(replyId);
		const userLikedIndex = user.likedReplies?.findIndex((id) =>
			(id as any).equals(likedReplyId),
		);

		if (userLikedIndex !== undefined && userLikedIndex > -1) {
			// Unlike
			user.likedReplies?.splice(userLikedIndex, 1);
			reply.likedBy = reply.likedBy?.filter((id) => id !== userId)!;
		} else {
			// Like
			user.likedReplies?.push(likedReplyId);
			if (!reply.likedBy) reply.likedBy = [];
			reply.likedBy.push(userId);
		}

		await this.userRepository.update(user);
		await this.replyRepository.update(reply);
	}
}

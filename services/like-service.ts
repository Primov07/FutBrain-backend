import {
	UserRepository,
	User,
	CommentRepository,
	ReplyRepository,
	PostRepository,
	Reply,
    Post,
    Comment
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
	public async handleReplyLike(replyId: string, userId: string) {
		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);
		const reply: Reply | null = await this.replyRepository.getById(replyId);
		if (!reply) throw new AppError("Отговорът не е намерен!", 403);

		user.likedReplies?.push(new Types.ObjectId(replyId));
		reply.likedBy?.push(userId);

		this.userRepository.update(user);
		this.replyRepository.update(reply);
	}

	public async handlePostLike(postId: string, userId: string) {
		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);
		const post: Post | null = await this.postRepository.getById(postId);
		if (!post) throw new AppError("Публикацията не е намерена!", 403);

		user.likedPosts?.push(new Types.ObjectId(postId));
		post.likedBy?.push(userId);

		this.userRepository.update(user);
		this.postRepository.update(post);
	}

	public async handleCommentLike(commentId: string, userId: string) {
		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);
		const comment: Comment | null = await this.commentRepository.getById(commentId);
		if (!comment) throw new AppError("Коментарът не е намерен!", 403);

		user.likedComments?.push(new Types.ObjectId(commentId));
		comment.likedBy?.push(userId);

		this.userRepository.update(user);
		this.commentRepository.update(comment);
	}
}

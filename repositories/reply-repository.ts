import { Types } from "mongoose";
import { ReplyModel, Reply, CommentModel } from ".";
import { DocumentType } from "@typegoose/typegoose";

export class ReplyRepository {
	public async getByCommentId(
		commentId: string,
		skip: number,
		limit: number,
	): Promise<Array<Reply> | null> {
		const replies: Array<Reply> | null = await ReplyModel.find({
			comment: new Types.ObjectId(commentId),
		})
			.populate("user")
			.skip(skip)
			.limit(limit)
			.sort({ publishDate: -1 })
			.lean()
			.exec();
		return replies;
	}

	public async getAll(): Promise<Array<Reply> | null> {
		const replies: Array<Reply> | null = await ReplyModel.find()
			.lean()
			.exec();
		return replies;
	}

	public async getById(id: string): Promise<Reply | null> {
		const reply: Reply | null = await ReplyModel.findById(new Types.ObjectId(id))
			.lean()
			.exec();
		return reply;
	}

	public async create(reply: Reply): Promise<string> {
		const model: DocumentType<Reply> = new ReplyModel(reply);
		await model.save();
		return model._id.toString();
	}

	public async deleteById(id: string): Promise<boolean> {
		const result: Reply | null = await ReplyModel.findByIdAndDelete(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		if (!result) return false;
		return true;
	}

	public async deleteByCommentId(commentId: string): Promise<void> {
		await ReplyModel.deleteMany({ comment: new Types.ObjectId(commentId) }).exec();
	}

	public async deleteByPostId(postId: string): Promise<void> {
		const commentIds = await CommentModel.find({ post: new Types.ObjectId(postId) }).distinct('_id');
		await ReplyModel.deleteMany({ comment: { $in: commentIds } }).exec();
	}

	public async update(reply: Reply): Promise<void | null> {
		const id: string = reply.id;
		let found = await ReplyModel.findById(new Types.ObjectId(id));

		if (!found) return null;

		found.content = reply.content;
		found.likedBy = reply.likedBy!;
		if (reply.photos) found.photos = reply.photos;

		found.save();
	}
}

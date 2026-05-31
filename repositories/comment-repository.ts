import { CommentModel, Comment } from ".";
import { DocumentType } from "@typegoose/typegoose";
import { Types } from "mongoose";

export class CommentRepository {
	public async getByPostId(
		postId: string,
		skip: number,
		limit: number,
	): Promise<Array<Comment> | null> {
		const comments: Array<Comment> | null = await CommentModel.find({
			post: new Types.ObjectId(postId),
		})
			.populate("user", "username pictureURL")
			.skip(skip)
			.limit(limit)
			.sort({ publishDate: -1 })
			.lean()
			.exec();
		return comments;
	}

	public async getAll(): Promise<Array<Comment> | null> {
		const comments: Array<Comment> | null = await CommentModel.find()
			.lean()
			.exec();
		return comments;
	}

	public async getById(id: string): Promise<Comment | null> {
		const comment: Comment | null = await CommentModel.findById(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		return comment;
	}

	public async create(comment: Comment): Promise<string> {
		const model: DocumentType<Comment> = new CommentModel(comment);
		await model.save();
		return model._id.toString();
	}

	public async deleteById(id: string): Promise<boolean> {
		const result: Comment | null = await CommentModel.findByIdAndDelete(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		if (!result) return false;
		return true;
	}

	public async deleteByPostId(postId: string): Promise<void> {
		await CommentModel.deleteMany({ post: new Types.ObjectId(postId) }).exec();
	}

	public async update(comment: Comment): Promise<void | null> {
		const id: string = comment.id;
		let found = await CommentModel.findById(new Types.ObjectId(id));

		if (!found) return null;

		found.content = comment.content;
		found.replies = comment.replies;
		found.likedBy = comment.likedBy!;
		if (comment.photos) found.photos = comment.photos;

		found.save();
	}
}

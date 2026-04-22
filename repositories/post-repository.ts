import { DocumentType } from "@typegoose/typegoose";
import { PostModel, Post } from ".";
import { Types } from "mongoose";

export class PostRepository {
	public async getAllPaginated(
		skip: number,
		limit: number,
	): Promise<Array<Post> | null> {
		const posts: Array<Post> | null = await PostModel.find()
			.skip(skip)
			.limit(limit)
			.sort({ publishDate: -1 })
			.populate("user", "username pictureURL")
			.lean()
			.exec();
		return posts;
	}

	public async getAll(): Promise<Array<Post> | null> {
		const posts: Array<Post> | null = await PostModel.find()
			.populate("user", "username pictureURL")
			.lean()
			.exec();
		return posts;
	}

	public async getById(id: string): Promise<Post | null> {
		const post: Post | null = await PostModel.findById(new Types.ObjectId(id))
			.populate("user", "username pictureURL")
			.lean()
			.exec();
		return post;
	}

	public async create(post: Post): Promise<string> {
		const model: DocumentType<Post> = new PostModel(post);
		await model.save();
		return model._id.toString();
	}

	public async deleteById(id: string): Promise<boolean> {
		const result: Post | null = await PostModel.findByIdAndDelete(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		if (!result) return false;
		return true;
	}

	public async update(post: Post): Promise<void | null> {
		const id: string = post.id;
		let found = await PostModel.findById(new Types.ObjectId(id));

		if (!found) return null;

		found.title = post.title;
		found.content = post.content;
		found.comments = post.comments;
		
		found.save();
	}
}

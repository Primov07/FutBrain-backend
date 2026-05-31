import { getModelForClass, prop, type Ref, pre } from "@typegoose/typegoose";
import type { User } from "./user";
import type { Comment } from "./comment";
import { Types } from "mongoose";

@pre<Post>("save", async function () {
	this.id = this._id.toString();
})
export class Post {
	@prop()
	public id!: string;

	@prop({
		required: true,
		validate: {
			validator: (v) => {
				return v.length > 5;
			},
		},
		message: "Заглавието трябва да бъде дълго поне 5 знака",
	})
	public title!: string;

	@prop({
		required: true,
		validate: {
			validator: (v) => {
				return v.length >= 10;
			},
		},
		message: "Your post should be at least 10 characters long.",
	})
	public content!: string;

	@prop({ default: Date.now })
	public publishDate!: Date;

	@prop({ default: null })
	public photo?: string;

	@prop({
		default: [],
		ref: "User",
		type: String,
	})
	public likedBy?: Ref<User, string>[];

	@prop({
		default: [],
		ref: "Comment",
		type: Types.ObjectId,
	})
	public comments!: Ref<Comment, Types.ObjectId>[];
	@prop({
		default: null,
		ref: "User",
		type: String,
	})
	public user!: Ref<User, string>;
}
export const PostModel = getModelForClass(Post);

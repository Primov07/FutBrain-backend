import { getModelForClass, prop, type Ref, pre } from "@typegoose/typegoose";
import type { Post } from "./post";
import type { User } from "./user";
import { Types } from "mongoose";
import { Reply } from "./reply";

@pre<Comment>("save", async function () {
	this.id = this._id.toString();
})

export class Comment {
	@prop()
	public id!: string;

	@prop({
		validate: {
			validator: (v) => {
				return v.length >= 10;
			},
		},
		message: "Your comment should be at least 10 characters long.",
	})
	public content!: string;

	@prop({ default: [] })
	public photos!: string[];

	@prop({
		required: true,
		ref: "User",
		type: String,
	})
	public user!: Ref<User, string>;

	@prop({
		required: true,
		ref: "Post",
		type: Types.ObjectId,
	})
	public post!: Ref<Post, Types.ObjectId>;

	@prop({ default: Date.now })
	public publishDate!: Date;

	@prop({
		default: [],
		ref: "User",
		type: String
	})
	public likedBy?: Ref<User, string>[];

	@prop({
		default: [],
		ref: "Reply",
		type: Types.ObjectId
	})
	public replies!: Ref<Reply, Types.ObjectId>[];
}
export const CommentModel = getModelForClass(Comment);

import { getModelForClass, prop, pre, type Ref } from "@typegoose/typegoose";
import type { Accessory } from "./accessory";
import type { Comment } from "./comment";
import type { Player } from "./player";
import type { Post } from "./post";
import type { Reply } from "./reply";
import type { Report } from "./report";
import bcrypt from "bcrypt";
import { randomUUID, randomInt } from "crypto";
import { Types } from "mongoose";
import { BASE_URL } from "../app";
import { AppError } from "../middlewares/error-handler";

@pre<User>("save", async function () {
	if (this.isModified("passwordHash")) {
		const regex : RegExp =
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
		if (regex.test(this.passwordHash)) {
			this.saltRounds = randomInt(1, 11);
			this.passwordHash = await bcrypt.hash(this.passwordHash, this.saltRounds);
		}
		else throw new AppError("Паролата трябва да бъде дълга поне 8 символа, да съдържа поне една буква, цифра и специален символ!", 400);
	}
	if (this.isModified("strikes") && this.strikes == 3) this.isBanned = true;
	if (this.isNew && !this.pictureURL) {
		this.pictureURL = `users/user.png`;
	}
})
export class User {
	@prop({ required: true, unique: true, default: randomUUID })
	public _id!: string;

	@prop({
		required: true,
		unique: true,
		validate: {
			validator: (v) => {
				return v.length >= 7;
			},
			message: "Username should contain at least 7 characters!",
		},
	})
	public username!: string;
	@prop({
		unique: true,
		validate: {
			validator: (v) => {
				return v.includes("@");
			},
			message: "Email is not valid!",
		},
	})
	public email!: string;

	@prop({ default: 10 })
	public saltRounds!: number;

	@prop({ required: true })
	public passwordHash!: string;

	@prop({ default: Date.now })
	public createdAt!: Date;

	@prop({ default: false })
	public isAdmin!: boolean;

	@prop({ default: 0 })
	public futcoins!: number;

	@prop({ default: 0 })
	public strikes!: number;

	@prop({ default: false })
	public isBanned!: boolean;

	@prop({ default: [] })
	public reports!: Ref<Report, Types.ObjectId>;

	@prop({
		default: [],
		ref: "Accessory",
		type: Types.ObjectId,
	})
	public accessories?: Ref<Accessory, Types.ObjectId>[];

	@prop({
		default: [],
		ref: "Comment",
		type: Types.ObjectId,
	})
	public comments?: Ref<Comment, Types.ObjectId>[];

	@prop({
		default: [],
		ref: "Comment",
		type: Types.ObjectId,
	})
	public likedComments?: Ref<Comment, Types.ObjectId>[];

	@prop({
		default: [],
		ref: "Reply",
		type: Types.ObjectId,
	})
	public replies?: Ref<Reply, Types.ObjectId>[];

	@prop({
		default: [],
		ref: "Reply",
		type: Types.ObjectId,
	})
	public likedReplies?: Ref<Reply, Types.ObjectId>[];

	@prop({
		default: [],
		ref: "Post",
		type: Types.ObjectId,
	})
	public posts?: Ref<Post, Types.ObjectId>[];

	@prop({
		default: [],
		ref: "Post",
		type: Types.ObjectId,
	})
	public likedPosts?: Ref<Post, Types.ObjectId>[];

	@prop({
	})
	public pictureURL?: string;

	@prop({
		default: null,
		ref: "Player",
		type: Types.ObjectId,
	})
	public preferredPlayer?: Ref<Player, Types.ObjectId>;

	public async comparePasswords(password: string): Promise<boolean> {
		const isMatch: boolean = await bcrypt.compare(password, this.passwordHash);
		return isMatch;
	}
}

export const UserModel = getModelForClass(User);

import { Types } from "mongoose";

export interface UserDTO {
	id: string;
	username: string;
	email: string;
	pictureURL: string;
	isAdmin: boolean;
	futcoins: number;
	comments: Types.ObjectId[];
	posts: Types.ObjectId[];
	likedPosts: Types.ObjectId[];
	likedComments: Types.ObjectId[];
	replies: Types.ObjectId[];
	likedReplies: Types.ObjectId[];
	accessories:
	{
		id: string;
		photo: string;
	}[];
	isBanned: boolean;
}

export interface CreateUserDTO {
	username: string;
	password: string;
	email: string;
}

export interface UpdateUserDTO {
	id: string;
	username: string;
	password: string;
	email: string;
	pictureURL: string;
}

export interface UpdateRoleDTO {
	id: string;
	isAdmin: boolean;
}

import { Types } from "mongoose";

export interface ReplyDTO {
	id: string;
	content: string;
	photos: string[];
	user: string;
	comment: string;
	publishDate: Date;
	likedBy: string[];
}

export interface CreateReplyDTO {
	content: string;
	photos?: string[];
	user: string;
	comment: string;
}

export interface UpdateReplyDTO {
	id: string;
	content: string;
}

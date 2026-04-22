export interface CommentDTO {
	id: string;
	content: string;
	photos: string[];
	user: string;
	post: string;
	publishDate: Date;
	likedBy: string[];
}

export interface CreateCommentDTO {
	content: string;
	photos?: string[];
	user: string;
	post: string;
}

export interface UpdateCommentDTO {
	id: string;
	content: string;
}

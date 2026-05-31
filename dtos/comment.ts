export interface CommentDTO {
	id: string;
	content: string;
	photos: string[];
	user: 
	{
		id: string;
		username: string;
		pictureURL: string;
	}
	post: string;
	publishDate: Date;
	likedBy: string[];
	replies: string[];
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

export interface PostDTO {
    id: string;
    title: string;
	content: string;
	publishDate: Date;
	likedBy: string[];
	comments: string[];
	user: {
		username: string;
		pictureURL: string;
	};
}

export interface CreatePostDTO {
    title: string;
	content: string;
	user: string;
}

export interface UpdatePostDTO {
    id: string;
    title: string;
    content: string;
}

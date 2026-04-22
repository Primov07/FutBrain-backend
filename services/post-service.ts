import { PostRepository } from "../repositories/post-repository";
import { UserRepository } from "../repositories";
import { Post } from "../models/post";
import { PostDTO, CreatePostDTO, UpdatePostDTO } from "../dtos/post";
import { Types } from "mongoose";
import { AppError } from "../controllers";

export class PostService {
	private postRepository: PostRepository;
	private userRepository: UserRepository;
	constructor() {
		this.postRepository = new PostRepository();
		this.userRepository = new UserRepository();
	}

	public async getPostsPaginated(page: number): Promise<Array<PostDTO> | null> {
		const limit = 10; // Може да се промени според нуждите
		const skip = (page - 1) * limit;
		const posts = await this.postRepository.getAllPaginated(skip, limit);
		return posts ? posts.map((p) => this.toPostDTO(p)) : [];
	}

	public async getAll(): Promise<Array<PostDTO> | null> {
		const posts = await this.postRepository.getAll();
		if (posts) return posts.map((p) => this.toPostDTO(p));
		return null;
	}

	public async getById(id: string): Promise<PostDTO | null> {
		const post = await this.postRepository.getById(id);
		if (post) return this.toPostDTO(post);
		return null;
	}

	public async create(postDTO: CreatePostDTO): Promise<string | null> {
		const post = new Post();
		post.title = postDTO.title;
		post.content = postDTO.content;
		post.user = postDTO.user;

		const postId = await this.postRepository.create(post);
		const user = await this.userRepository.getById(postDTO.user);
		if (!user) return null;
		user.posts?.push(new Types.ObjectId(postId));
		this.userRepository.update(user);
		return postId;
	}

	public async deleteById(id: string): Promise<boolean> {
		return await this.postRepository.deleteById(id);
	}

	public async update(post: UpdatePostDTO): Promise<void | null> {
		const update = new Post();
		update.id = post.id;
		update.title = post.title;
		update.content = post.content;
		return await this.postRepository.update(update);
	}

	private toPostDTO(post: any): PostDTO {
		return {
			id: post.id.toString(),
			title: post.title,
			content: post.content,
			publishDate: post.publishDate,
			likedBy: post.likedBy?.map((id: any) => id.toString()) || [],
			comments: post.comments?.map((id: any) => id.toString()) || [],
			user: {
				username: post.user?.username || "Анонимен",
				pictureURL: post.user?.pictureURL || ""
			}
		};
	}
}

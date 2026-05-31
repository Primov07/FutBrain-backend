import { PostRepository } from "../repositories/post-repository";
import { UserRepository } from "../repositories";
import { Post } from "../models/post";
import { PostDTO, CreatePostDTO, UpdatePostDTO } from "../dtos/post";
import { Types } from "mongoose";
import { AppError } from "../controllers";
import { CommentDTO } from "../dtos";

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

	public async create(postDTO: CreatePostDTO): Promise<string> {
		const post = new Post();
		post.title = postDTO.title;
		post.content = postDTO.content;
		post.user = postDTO.user;

		const postId = await this.postRepository.create(post);
		const user = await this.userRepository.getById(postDTO.user);
		if (!user) throw new AppError("Потребителят не е намерен", 404);
		user.posts?.push(new Types.ObjectId(postId));
		await this.userRepository.update(user);
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
		update.photo = post.photo;
		return await this.postRepository.update(update);
	}

	public async getPostsByUser(username: string, page: number, limit: number): Promise<Array<PostDTO> | null> {
		const user = await this.userRepository.getByUsername(username);
		if (!user) throw new AppError("Потребителят не е намерен", 404);
		const skip = (page - 1) * limit;
		const posts: any = await this.postRepository.getAll();
		const userPosts = posts?.filter((p: any) => p.user._id == user._id) || [];
		return userPosts.map((p: any) => this.toPostDTO(p));
	}

	public async getComments(postId: string): Promise<Array<CommentDTO> | null> {
		const post: any = await this.postRepository.getById(postId);
		if (!post) throw new AppError("Публикацията не е намерена", 404);
		return post.comments as CommentDTO[];
	}

	private toPostDTO(post: any): PostDTO {
		return {
			id: post.id.toString(),
			title: post.title,
			content: post.content,
			publishDate: post.publishDate,
			likedBy: post.likedBy?.map((id: any) => id.toString()) || [],
			comments: post.comments?.map((c: any) => ({
				id: c.id.toString(),
				content: c.content,
				user: {
					id: c.user?._id?.toString() || "",
					username: c.user?.username || "Анонимен",
					pictureURL: c.user?.pictureURL || ""
				},
				publishDate: c.publishDate
			})) || [],
			user: {
				id: post.user?._id?.toString() || post.user?.id?.toString() || "",
				username: post.user?.username || "Анонимен",
				pictureURL: post.user?.pictureURL || ""
			},
			photo: post.photo
		};
	}
}

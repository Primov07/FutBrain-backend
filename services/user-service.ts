import { UserRepository } from ".";
import { User } from ".";
import { UserDTO, CreateUserDTO, UpdateUserDTO, UpdateRoleDTO } from "../dtos/user";;

export class UserService {
	private userRepository: UserRepository;
	constructor() {
		this.userRepository = new UserRepository();
	}

	public async getAll(): Promise<Array<UserDTO> | null> {
		const users: Array<User> | null = await this.userRepository.getAll();
		if (users) {
			return users.map((user) => this.toUserDTO(user));
		}
		return null;
	}
	public async getById(id: string): Promise<UserDTO | null> {
		const user: User | null = await this.userRepository.getById(id);
		if (user) return this.toUserDTO(user);
		return null;
	}

	public async create(user: CreateUserDTO): Promise<UserDTO | null>{
		const newUser: User = new User();
		newUser.username = user.username;
		newUser.passwordHash = user.password;
		newUser.email = user.email;

		const result: User | null = await this.userRepository.create(newUser);
		if (!result) return null;
		return this.toUserDTO(result);
	}

	public async deleteById(id: string) : Promise<UserDTO | null> {
		const result: User | null = await this.userRepository.deleteById(id);
		if (!result) return null;
		return this.toUserDTO(result);
	}

	public async update(user: UpdateUserDTO): Promise<void | null> {
		const newUser: User = new User();
		newUser._id = user.id;
		newUser.username = user.username!;
		newUser.passwordHash = user.password!;
		newUser.email = user.email!;
		newUser.pictureURL = user.pictureURL!;

		const result: void | null = await this.userRepository.update(newUser);
		return result;
	}

	public async updateRole(roleUpdate: UpdateRoleDTO): Promise<void | null> {
		const found = await this.userRepository.getById(roleUpdate.id);
		if (!found) return null;

		const userToUpdate: User = found;
		userToUpdate._id = roleUpdate.id;
		userToUpdate.isAdmin = roleUpdate.isAdmin;

		const result: void | null = await this.userRepository.update(userToUpdate);
		return result;
	}

	public async authenticate(username: string, password: string): Promise<UserDTO | null> {
		const user: User | null = await this.userRepository.authenticate(username, password);
		if (!user) return null;
		return this.toUserDTO(user);
	}

	public async getByUsername(username: string): Promise<UserDTO | null> {
		const user: User | null = await this.userRepository.getByUsername(username);
		if (!user) return null;
		return this.toUserDTO(user);
	}

	public async seedAdmin(): Promise<void> {
		const adminUsername = process.env.ADMIN_USERNAME || "adminUser";
		const adminEmail = process.env.ADMIN_EMAIL || "admin@futbrain.com";
		const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

		const existingAdmin = await this.userRepository.getByUsername(adminUsername);
		if (!existingAdmin) {
			const adminUser = new User();
			adminUser.username = adminUsername;
			adminUser.email = adminEmail;
			adminUser.passwordHash = adminPassword;
			adminUser.isAdmin = true;

			await this.userRepository.create(adminUser);
			console.log(`Default admin user created: ${adminUsername}`);
		}
	}

	public toUserDTO(user: User): UserDTO {
		return {
			id: user._id,
			username: user.username,
			pictureURL: user.pictureURL!,
			email: user.email!,
			isAdmin: user.isAdmin,
			futcoins: user.futcoins,
			comments: user.comments?.map((comment) => comment._id)!,
			posts: user.posts?.map((post) => post._id)!,
			likedPosts: user.likedPosts?.map((post) => post._id)!,
			likedComments: user.likedComments?.map((comment) => comment._id)!,
			replies: user.replies?.map((reply) => reply._id)!,
			likedReplies: user.likedReplies?.map((reply) => reply._id)!,
			accessories: user.accessories?.map((accessory: any) => ({
				id: accessory._id?.toString() || accessory.id?.toString(),
				photo: accessory.photo
			})) || [],
			isBanned: user.isBanned
		};
	}
}

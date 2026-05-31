import { UserModel, User } from ".";
import { DocumentType } from "@typegoose/typegoose";

export class UserRepository {
	public async getAll(): Promise<Array<User> | null> {
		const users: Array<User> | null = await UserModel.find().lean().exec();
		return users;
	}

	public async getById(id: string): Promise<User | null> {
		const user = await UserModel.findOne({
			_id: id,
		})
			.populate("accessories")
			.lean()
			.exec();
		return user;
	}

	public async getByUsername(username: string): Promise<User | null> {
		const user: User | null = await UserModel.findOne({ username: username })
			.populate("accessories")
			.lean()
			.exec();
		return user;
	}

	public async deleteByUsername(username: string): Promise<User | null> {
		const result: User | null = await UserModel.findOneAndDelete({
			username: username,
		})
			.lean()
			.exec();
		return result;
	}

	public async authenticate(
		username: string,
		password: string,
	): Promise<User | null> {
		const user: User | null = await UserModel.findOne({
			username: username,
		}).exec();
		if (!user) return null;

		const verify: boolean = await user.comparePasswords(password);
		if (!verify) return null;

		return user;
	}

	public async create(user: User): Promise<User | null> {
		const ifExists: User | null = await UserModel.exists({
			username: user.username,
		})
			.lean()
			.exec();
		if (ifExists) return null;

		const model: DocumentType<User> = new UserModel(user);
		await model.save();
		return model;
	}

	public async deleteById(id: string): Promise<User | null> {
		const result: User | null = await UserModel.findByIdAndDelete(id)
			.lean()
			.exec();
		return result;
	}

	public async update(user: User): Promise<void | null> {
		const id: string = user._id;
		let found = await UserModel.findById(id);

		if (!found) return null;

		found.username = user.username;
		found.passwordHash = user.passwordHash;
		found.strikes = user.strikes;
		found.isAdmin = user.isAdmin;
		found.email = user.email;
		found.comments = user.comments!;
		found.posts = user.posts!;
		found.replies = user.replies!;
		found.futcoins = user.futcoins!;
		found.strikes = user.strikes!;
		found.accessories = user.accessories!;
		found.preferredPlayer = user.preferredPlayer!;
		found.likedPosts = user.likedPosts!;
		found.likedComments = user.likedComments!;
		found.likedReplies = user.likedReplies!;
		await found.save();
	}

	public async addFutcoinsToUsers(
		userIds: string[],
		amount: number,
	): Promise<void> {
		UserModel.updateMany(
			{ _id: { $in: userIds } },
			{ $inc: { futcoins: amount } },
		).exec();
	}

	public async resetPreferredPlayers(): Promise<void> {
		UserModel.updateMany({}, { preferredPlayer: null }).exec();
	}
}

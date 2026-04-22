import { PlayerRepository, UserRepository, User, Player } from ".";
import { AppError } from "../middlewares/error-handler";
import { Types } from "mongoose";

export class VoteService {
	private readonly playerRepository: PlayerRepository;
	private readonly userRepository: UserRepository;

	constructor() {
		this.playerRepository = new PlayerRepository();
		this.userRepository = new UserRepository();
	}
	public async handleVote(playerId: string, userId: string) {
		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);
		const player: Player | null = await this.playerRepository.getById(playerId);
		if (!player) throw new AppError("Играчът не е намерен!", 403);

		user.preferredPlayer = new Types.ObjectId(playerId);
		player.users.push(userId);

		this.userRepository.update(user);
		this.playerRepository.update(player);
	}
}

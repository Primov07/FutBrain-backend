import {
	PlayerRepository,
	UserRepository,
	User,
	Player,
	GameRepository,
	Game,
} from ".";
import { AppError } from "../middlewares/error-handler";
import { Types } from "mongoose";

export class VoteService {
	private playerRepository: PlayerRepository;
	private userRepository: UserRepository;
	private gameRepository: GameRepository;

	constructor() {
		this.playerRepository = new PlayerRepository();
		this.userRepository = new UserRepository();
		this.gameRepository = new GameRepository();
	}

	private async finalizeGame(currentGame: Game): Promise<void> {
		const players: Array<Player> | null = await this.playerRepository.getAll();
		let winnerId: string | null = null;

		if (players && players.length > 0) {
			let winner: Player = players[0]!;
			players.forEach((p) => {
				if (p.users.length > winner.users.length) winner = p;
			});

			if (winner.users.length > 0) {
				winnerId = winner.id;
				await this.userRepository.addFutcoinsToUsers(
					winner.users.map(String),
					100,
				);
			}
		}

		// Използваме само репозиторито за обновяване на победителя
		await this.gameRepository.updateWinnerAndDeactivate(
			(currentGame as any)._id.toString(),
			winnerId,
		);

		await this.playerRepository.resetAllVotes();
		await this.userRepository.resetPreferredPlayers();
	}

	private async startNewGame(): Promise<void> {
		const newStartDate: Date = new Date();
		const newEndDate: Date = new Date(
			newStartDate.getTime() + 7 * 24 * 60 * 60 * 1000,
		);

		const newGame: Game = new Game();
		newGame.startDate = newStartDate;
		newGame.endDate = newEndDate;
		newGame.isActive = true;

		await this.gameRepository.create(newGame);
	}

	private async checkAndResetGame(): Promise<void> {
		const currentGame: Game | null = await this.gameRepository.getActiveGame();
		const now: Date = new Date();

		if (!currentGame || now > currentGame.endDate) {
			if (currentGame) {
				await this.finalizeGame(currentGame);
			}
			await this.startNewGame();
		}
	}

	public async forceEndGame(): Promise<void> {
		const currentGame: Game | null = await this.gameRepository.getActiveGame();
		if (currentGame) {
			await this.finalizeGame(currentGame);
		}
		await this.startNewGame();
	}

	public async handleVote(playerId: string, userId: string): Promise<void> {
		await this.checkAndResetGame();

		const user: User | null = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Не сте влезли в профила си.", 403);

		if (user.preferredPlayer) {
			throw new AppError(
				"Вече сте гласували за тази седмица и нямате право да променяте гласа си!",
				403,
			);
		}

		const player: Player | null = await this.playerRepository.getById(playerId);
		if (!player) throw new AppError("Играчът не е намерен!", 403);

		user.preferredPlayer = new Types.ObjectId(playerId);
		player.users.push(userId);

		await this.userRepository.update(user);
		await this.playerRepository.update(player);
	}

	public async getUserVote(userId: string): Promise<string | null> {
		await this.checkAndResetGame();
		const user: User | null = await this.userRepository.getById(userId);
		if (!user || !user.preferredPlayer) return null;

		return user.preferredPlayer.toString();
	}

	public async getLastWinner(): Promise<Player | null> {
		const lastGame: Game | null = await this.gameRepository.getLastFinishedGame();
		if (!lastGame || !lastGame.winner) return null;

		const winner: Player | null = await this.playerRepository.getById(
			lastGame.winner.toString(),
		);
		return winner;
	}
}

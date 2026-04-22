import { PlayerRepository } from ".";
import { Player } from ".";
import { CreatePlayerDTO, PlayerDTO, UpdatePlayerDTO } from ".";

export class PlayerService {
	private playerRepository: PlayerRepository;
	constructor() {
		this.playerRepository = new PlayerRepository();
	}

	public async getAll(): Promise<Array<PlayerDTO> | null> {
		const players: Array<Player> | null = await this.playerRepository.getAll();
		if (players) return players.map((p) => this.toPlayerDTO(p));
		return null;
	}

	public async getById(id: string): Promise<PlayerDTO | null> {
		const player = await this.playerRepository.getById(id);
		if (player) return this.toPlayerDTO(player);
		return null;
	}

	public async create(player: CreatePlayerDTO): Promise<string> {
		const newPlayer: Player = new Player();

		newPlayer.name = player.name;
		newPlayer.club = player.club;

		return await this.playerRepository.create(newPlayer);
	}

	public async deleteById(id: string): Promise<boolean> {
		const ifDeleted: boolean = await this.playerRepository.deleteById(id);
		return ifDeleted;
	}

	public async update(player: UpdatePlayerDTO): Promise<void | null> {
		const update: Player = new Player();
		update.id = player.id;
		update.name = player.name;
		update.club = player.club;
		const result = await this.playerRepository.update(update);
		return result;
	}

	private toPlayerDTO(player: Player): PlayerDTO {
		return {
			id: player.id,
			name: player.name,
			club: player.club,
			clubImg: player.clubImg,
			playerImg: player.playerImg,
			users: player.users.map(String),
		};
	}
}

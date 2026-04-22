import { PlayerModel, Player } from ".";
import { DocumentType } from "@typegoose/typegoose";
import { Types } from "mongoose";

export class PlayerRepository {
	public async getAll(): Promise<Array<Player> | null> {
		const players: Array<Player> | null = await PlayerModel.find()
			.lean()
			.exec();
		return players;
	}

	public async getById(id: string): Promise<Player | null> {
		const player: Player | null = await PlayerModel.findById(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		return player;
	}

	public async create(player: Player): Promise<string> {
		const model: DocumentType<Player> = new PlayerModel(player);
		await model.save();
		return model._id.toString();
	}

	public async deleteById(id: string): Promise<boolean> {
		const result: Player | null = await PlayerModel.findByIdAndDelete(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		if (!result) return false;
		return true;
	}

	public async update(player: Player): Promise<void | null> {
		const id: string = player.id;
		let found = await PlayerModel.findById(new Types.ObjectId(id));

		if (!found) return null;

		found.name = player.name;
		found.club = player.club;
		
		found.save();
	}
}

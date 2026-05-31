import { GameModel, Game } from ".";
import { DocumentType } from "@typegoose/typegoose";

export class GameRepository {
	public async getActiveGame(): Promise<Game | null> {
		const game: Game | null = await GameModel.findOne({ isActive: true })
			.lean()
			.exec();
		return game;
	}

	public async create(game: Game): Promise<string> {
		const model: DocumentType<Game> = new GameModel(game);
		await model.save();
		return model._id.toString();
	}

	public async deactivateAll(): Promise<void> {
		await GameModel.updateMany({ isActive: true }, { isActive: false }).exec();
	}

	public async getLastFinishedGame(): Promise<Game | null> {
		const game: Game | null = await GameModel.findOne({ isActive: false })
			.sort({ endDate: -1 })
			.lean()
			.exec();
		return game;
	}

	public async updateWinnerAndDeactivate(
		id: string,
		winnerId: string | null,
	): Promise<void> {
		await GameModel.updateOne(
			{ _id: id },
			{ isActive: false, winner: winnerId },
		).exec();
	}
}

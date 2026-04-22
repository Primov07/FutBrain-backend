import { NextFunction, Request, Response } from "express";
import { PlayerService } from ".";
import { VoteService } from ".";
import { CreatePlayerDTO, PlayerDTO, UpdatePlayerDTO } from ".";
import fs from "fs";
import { AppError } from "../middlewares/error-handler";

class PlayerController {
	constructor(
		private readonly playerService: PlayerService,
		private readonly voteService: VoteService,
	) {}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const players: Array<PlayerDTO> | null =
				await this.playerService.getAll();
			if (!players) throw new AppError("Няма намерени играчи", 404);
			res.json(players);
		} catch (error) {
			next(error);
		}
	}

	public async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const player: PlayerDTO | null = await this.playerService.getById(id);
			if (!player) throw new AppError("Играчът не е намерен", 404);
			res.json(player);
		} catch (error) {
			next(error);
		}
	}

	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const playerDTO: CreatePlayerDTO = {
				name: req.body.playerName,
				club: req.body.club,
			};
			const id: string = await this.playerService.create(playerDTO);
			if (!req.file) throw new AppError("Играчът трябва да има снимка", 400);
			const oldPath: string = `uploads/players/${req.file?.filename!}`;
			const newPath: string = `uploads/players/${id}.webp`;
			fs.rename(oldPath, newPath, (err) => {
				if (err) throw new AppError("Грешка при запазване на снимката", 500);
			});
			res.status(201).json({ message: "Играчът е създаден успешно!" });
		} catch (err) {
			next(err);
		}
	}

	public async deleteById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const ifDeleted: boolean = await this.playerService.deleteById(id);
			if (!ifDeleted) throw new AppError("Играчът не е намерен", 404);
			const path: string = `uploads/players/${id}.webp`;
			fs.unlink(path, (err) => {
				if (err) throw new AppError("Грешка при изтриване на снимката", 500);
			});
			res.status(201).json({ message: "Играчът е изтрит успешно!" });
		} catch (error) {
			next(error);
		}
	}

public async getCount(req: Request, res: Response, next: NextFunction) {
		try {
			const players: Array<PlayerDTO> | null =
				await this.playerService.getAll();
			if (!players) res.json({ count: 0 });
			else res.json({ count: players.length });
		} catch (err) {
			next(err);
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const player: UpdatePlayerDTO = {
				id: req.body.id,
				name: req.body.playerName,
				club: req.body.club,
			};
			const updated: void | null = await this.playerService.update(player);
			if (updated === null) throw new AppError("Играчът не е намерен", 404);
			if (req.file) {
				const path: string = `uploads/players/${player.id}.webp`;
				try {
					fs.unlinkSync(path);
				} catch (err) {
					throw new AppError((err as any).message, 500);
				}

				const oldPath: string = `uploads/players/${req.file?.filename!}`;
				fs.rename(oldPath, path, (err) => {
					if (err)
						throw new AppError(
							"Грешка при обработката на снимката на играча!",
							500,
						);
				});
			}
			res.status(201).json({ message: "Играчът е актуализиран успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async vote(req: Request, res: Response, next: NextFunction) {
		try {
			this.voteService.handleVote(req.body.playerId, req.body.userId);
			res.status(201).json({ message: "Гласуването беше успешно!" });
		} catch (err) {
			next(err);
		}
	}
}

export const playerController: PlayerController = new PlayerController(
	new PlayerService(),
	new VoteService(),
);

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
		const safeRename = (oldPath: string, newPath: string) => {
			try {
				fs.renameSync(oldPath, newPath);
			} catch {
				throw new AppError("Грешка при запазване на снимката", 500);
			}
		};

		const safeCreate = async (dto: CreatePlayerDTO) => {
			try {
				const id: string = await this.playerService.create(dto);
				return id;
			} catch (err) {
				throw new AppError("Грешка при валидацията на играча!", 500);
			}
		};
		try {
			const playerDTO: CreatePlayerDTO = {
				name: req.body.playerName,
				club: req.body.club,
			};
			const id: string = await safeCreate(playerDTO);
			if (!req.file) throw new AppError("Играчът трябва да има снимка", 400);
			const oldPath: string = `uploads/players/${req.file?.filename!}`;
			const newPath: string = `uploads/players/${id}.webp`;
			safeRename(oldPath, newPath);
			res.status(201).json({ message: "Играчът е създаден успешно!" });
		} catch (err) {
			if (req.file) fs.unlinkSync(req.file.path);
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
		const safeRename = (oldPath: string, newPath: string) => {
			try {
				fs.renameSync(oldPath, newPath);
			} catch {
				throw new AppError("Грешка при запазване на снимката", 500);
			}
		};

		const safeUpdate = async (dto: UpdatePlayerDTO) => {
			try {
				return await this.playerService.update(dto);
			} catch (err) {
				throw new AppError("Грешка при валидацията на играча!", 500);
			}
		};

		const safeDelete = (path: string) => {
			try {
				fs.unlinkSync(path);
			} catch (err) {
				throw new AppError("Грешка при изтриването на старата снимка!", 500);
			}
		};

		let path: string = "";
		let oldPath: string = "";
		try {
			const player: UpdatePlayerDTO = {
				id: req.body.id,
				name: req.body.playerName,
				club: req.body.club,
			};
			const updated: void | null = await safeUpdate(player);
			if (updated === null) throw new AppError("Играчът не е намерен", 404);
			if (req.file) {
				path = `uploads/players/${player.id}.webp`;
				oldPath = `uploads/players/${req.file?.filename!}`;
			}
			res.status(201).json({ message: "Играчът е актуализиран успешно!" });
		} catch (error) {
			if (req.file) fs.unlinkSync(req.file.path);
			return next(error);
		}

		try {
			safeDelete(path);
			safeRename(oldPath, path);
		} catch (err) {
			const appError: AppError = new AppError((err as any).message, 500);
			next(appError);
		}
	}

	public async vote(req: Request, res: Response, next: NextFunction) {
		try {
			await this.voteService.handleVote(req.body.playerId, req.body.userId);
			res.status(201).json({ message: "Гласуването беше успешно!" });
		} catch (err) {
			next(err);
		}
	}

	public async getVote(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = (req as any).user.id;
			const playerId = await this.voteService.getUserVote(userId);
			if (!playerId) throw new AppError("Потребителят няма глас", 404);
			res.json({ playerId });
		} catch (err) {
			next(err);
		}
	}

	public async forceEndGame(req: Request, res: Response, next: NextFunction) {
		try {
			await this.voteService.forceEndGame();
			res.json({
				message:
					"Играта беше прекратена предсрочно и наградите бяха раздадени успешно!",
			});
		} catch (err) {
			next(err);
		}
	}

	public async getLastWinner(req: Request, res: Response, next: NextFunction) {
		try {
			const winner = await this.voteService.getLastWinner();
			if (!winner) return res.json(null);

			const winnerDTO: PlayerDTO = {
				id: winner.id,
				name: winner.name,
				club: winner.club,
				clubImg: winner.clubImg,
				playerImg: winner.playerImg,
				users: winner.users.map(String),
			};
			res.json(winnerDTO);
		} catch (err) {
			next(err);
		}
	}
}

export const playerController: PlayerController = new PlayerController(
	new PlayerService(),
	new VoteService(),
);

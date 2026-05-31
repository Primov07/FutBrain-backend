import { NextFunction, Request, Response } from "express";
import { AccessoryService } from ".";
import { CreateAccessoryDTO, UpdateAccessoryDTO, AccessoryDTO } from ".";
import { AppError } from ".";
import fs from "fs";
class AccessoryController {
	constructor(private readonly accessoryService: AccessoryService) {}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const accessories: Array<AccessoryDTO> | null =
				await this.accessoryService.getAll();
			if (!accessories) throw new AppError("Няма намерени аксесоари.", 404);
			res.json(accessories);
		} catch (err) {
			next(err);
		}
	}

	public async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const accessory: AccessoryDTO | null =
				await this.accessoryService.getById(id);
			if (!accessory) throw new AppError("Аксесоарът не е намерен", 404);
			res.json(accessory);
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

		const safeCreate = async (dto: CreateAccessoryDTO) => {
			try {
				const id: string = await this.accessoryService.create(dto);
				return id;
			} catch (err) {
				throw new AppError("Грешка при валидацията на аксесоара!", 500);
			}
		};
		try {
			const accessoryDTO: CreateAccessoryDTO = {
				name: req.body.name,
				price: req.body.price,
				endDate: req.body.endDate,
				type: req.body.type,
			};
			const newPath: string = `uploads/accessories/${await safeCreate(accessoryDTO)}.webp`;
			if (!req.file) throw new AppError("Аксесоарът трябва да има снимка", 400);
			const oldPath: string = `uploads/accessories/${req.file?.filename!}`;
			safeRename(oldPath, newPath);
			res.status(201).json({ message: "Аксесоарът е създаден успешно!" });
		} catch (err) {
			if (req.file) fs.unlinkSync(req.file.path);
			next(err);
		}
	}

	public async deleteById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const ifDeleted: boolean = await this.accessoryService.deleteById(id);
			if (!ifDeleted) throw new AppError("Аксесоарът не е намерен!", 404);
			const path: string = `uploads/accessories/${id}.webp`;
			fs.unlink(path, (err) => {
				if (err) throw new AppError("Грешка при изтриване на снимката.", 500);
			});
			res.status(201).json({ message: "Аксесоарът е изтрит успешно!" });
		} catch (error) {
			next(error);
		}
	}

	public async getCount(req: Request, res: Response, next: NextFunction) {
		try {
			const accessories: Array<AccessoryDTO> | null =
				await this.accessoryService.getAll();
			if (!accessories) res.json({ count: 0 });
			else res.json({ count: accessories.length });
		} catch (err) {
			next(err);
		}
	}

	public async buy(req: Request, res: Response, next: NextFunction) {
		try {
			const accessoryId: string = req.body.accessoryId;
			const userId: string = req.body.userId;
			await this.accessoryService.buy(accessoryId, userId);
			res.status(200).json({ message: "Аксесоарът е закупен успешно!" });
		}
		catch (err)
		{
			next(err);
		}
	}

	public async getByUser(req: Request, res: Response, next: NextFunction) {
		try {
			const userId: string = req.params.userId!.toString();
			const accessories: Array<string> | null = await this.accessoryService.getByUser(userId);
			if (!accessories) throw new AppError("Потребителят няма закупени аксесоари или не е намерен!", 404);
			res.json(accessories);
		}
		catch (err)
		{
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

		const safeUpdate = async (dto: UpdateAccessoryDTO) => {
			try {
				return await this.accessoryService.update(dto);
			} catch (err) {
				throw new AppError("Грешка при валидацията на аксесоара!", 500);
			}
		};

		const safeDelete = (path: string) => {
			try {
				fs.unlinkSync(path);
			} catch (err) {
				throw new AppError("Грешка при изтриването на старата снимка!", 500);
			}
		};

		let path: string = "",
			oldPath: string = "";

		try {
			const accessory: UpdateAccessoryDTO = {
				id: req.body.id,
				name: req.body.name,
				price: req.body.price,
				endDate: req.body.endDate,
				type: req.body.type,
			};
			const updated: void | null = await safeUpdate(accessory);
			if (updated === null) throw new AppError("Аксесоарът не е намерен", 404);
			if (req.file) {
				path = `uploads/accessories/${accessory.id}.webp`;
				oldPath = `uploads/accessories/${req.file?.filename!}`;
				safeRename(oldPath, path);
			}
			res.status(201).json({ message: "Аксесоарът е актуализиран успешно! " });
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
}

export const accessoryController: AccessoryController = new AccessoryController(
	new AccessoryService(),
);

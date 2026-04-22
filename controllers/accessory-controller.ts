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
		try {
			const accessoryDTO: CreateAccessoryDTO = {
				name: req.body.name,
				price: req.body.price,
				endDate: req.body.endDate,
				type: req.body.type,
			};
			const id: string = await this.accessoryService.create(accessoryDTO);
			if (!req.file) throw new AppError("Аксесоарът трябва да има снимка", 400);
			const oldPath: string = `uploads/accessories/${req.file?.filename!}`;
			const newPath: string = `uploads/accessories/${id}.webp`;
			try {
				fs.renameSync(oldPath, newPath);
			} catch (err) {
				throw new AppError("Грешка при запазване на снимката", 500);
			}
			res.status(201).json({ message: "Аксесоарът е създаден успешно!" });
		} catch (err) {
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

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const accessory: UpdateAccessoryDTO = {
				id: req.body.id,
				name: req.body.name,
				price: req.body.price,
				endDate: req.body.endDate,
				type: req.body.type,
			};
			const updated: void | null =
				await this.accessoryService.update(accessory);
			if (updated === null) throw new AppError("Аксесоарът не е намерен", 404);
			if (req.file) {
				const path: string = `uploads/accessories/${accessory.id}.webp`;
				try {
					fs.unlinkSync(path);
				} catch (err) {
					throw new AppError((err as any).message, 500);
				}

				const oldPath: string = `uploads/accessories/${req.file?.filename!}`;
				fs.rename(oldPath, path, (err) => {
					if (err)
						throw new AppError(
							"Грешка при обработката на снимката на аксесоара!",
							500,
						);
				});
			}
			res.status(201).json({ message: "Аксесоарът е актуализиран успешно! " });
		} catch (error) {
			next(error);
		}
	}
}

export const accessoryController: AccessoryController = new AccessoryController(
	new AccessoryService(),
);

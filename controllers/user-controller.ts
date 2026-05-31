import { NextFunction, Request, Response } from "express";
import { UserService } from ".";
import { UserDTO, CreateUserDTO, UpdateUserDTO, UpdateRoleDTO } from "../dtos/user";
import { AppError } from "../middlewares/error-handler";
import jwt from "jsonwebtoken";
import fs from "fs";
import { BASE_URL } from "../app";

class UserController {
	constructor(private readonly userService: UserService) {}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const users: Array<UserDTO> | null = await this.userService.getAll();
			if (!users) throw new AppError("Няма налични потребители", 404);
			res.json(users);
		} catch (error) {
			next(error);
		}
	}

	public async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			const user: UserDTO | null = await this.userService.getById(id);
			res.json(user);
		} catch (error) {
			next(error);
		}
	}

	public async create(req: Request, res: Response) {
		const user: CreateUserDTO = req.body;
		const result = await this.userService.create(user);
		if (!result)
			throw new AppError("Това потребителско име вече съществува!", 422);
		res.status(201).json({ message: "User created successfully" });
	}

	public async deleteById(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id!.toString();
			await this.userService.deleteById(id);
			res.json({ message: "User deleted successfully" });
		} catch (error) {
			next(error);
		}
	}

	public async update(req: Request, res: Response, next: NextFunction) {
		try {
			const user: UpdateUserDTO = req.body;
			await this.userService.update(user);
			res.json({ message: "User updated successfully" });
		} catch (error) {
			next(error);
		}
	}

	public async upload(req: Request, res: Response, next: NextFunction) {
		if (req.file) {
			const id = (req as any).user?.id;
			const oldPath: string = `uploads/users/${req.file?.filename!}`;
			const newPath: string = `uploads/users/${id}.webp`;
			try {
				fs.renameSync(oldPath, newPath);
				res.json({ message: "Профилната снимка е качена успешно!" });
			} catch (err) {
				console.error("DEBUG ERROR:", err);
				throw new AppError("Грешка при запазване на снимката", 500);
			}
		}
	}

	public async authenticate(req: Request, res: Response, next: NextFunction) {
		try {
			const { username, password } = req.body;
			const user: UserDTO | null = await this.userService.authenticate(
				username,
				password,
			);

			if (!user)
				throw new AppError("Грешно потребителско име или парола!", 401);

			if (user.isBanned) throw new AppError("Вашият акаунт е блокиран!", 403);

			const token = jwt.sign(
				{
					id: user.id,
					username: user.username,
					isAdmin: user.isAdmin,
					pictureURL: user.pictureURL,
					futcoins: user.futcoins,
				},
				process.env.SECRET_KEY!.toString(),
			);

			res
				.cookie("token", token, {
					httpOnly: true,
					secure: true,
					sameSite: "strict",
				})
				.status(200)
				.json({
					message: "Успешен вход!",
					token: token,
					user: {
						id: user.id,
						username: user.username,
						isAdmin: user.isAdmin,
						pictureURL: user.pictureURL,
						futcoins: user.futcoins,
					},
				});
		} catch (error) {
			next(error);
		}
	}

	public async getCurrentUser(req: Request, res: Response, next: NextFunction) {
		try {
			const id = (req as any).user?.id;
			const user: UserDTO | null = await this.userService.getById(id);

			if (!user) throw new AppError("Потребителят не е намерен!", 404);

			const reqUser = (req as any).user;

			if (
				user.username != reqUser.username ||
				user.futcoins != reqUser.futcoins ||
				user.isAdmin != reqUser.isAdmin
			) {
				const newToken = jwt.sign(
					{
						id: user.id,
						username: user.username,
						isAdmin: user.isAdmin,
						pictureURL: user.pictureURL,
						futcoins: user.futcoins,
					},
					process.env.SECRET_KEY!.toString(),
				);
				res
					.cookie("token", newToken, {
						httpOnly: true,
						secure: true,
						sameSite: "strict",
					})
					.status(200)
					.json({
						message: "Успешен вход!",
						token: newToken,
						user: {
							id: user.id,
							username: user.username,
							isAdmin: user.isAdmin,
							pictureURL: user.pictureURL,
							futcoins: user.futcoins,
						},
					});
			}
			else res.json(reqUser);
		} catch (error) {
			next(error);
		}
	}

	public async getCount(req: Request, res: Response, next: NextFunction) {
		try {
			const users: Array<UserDTO> | null = await this.userService.getAll();
			if (!users) res.json({ count: 0 });
			else res.json({ count: users.length });
		} catch (err) {
			next(err);
		}
	}
	public async getByUsername(req: Request, res: Response, next: NextFunction) {
		try {
			const username: string = req.params.username!.toString();
			const user: UserDTO | null =
				await this.userService.getByUsername(username);
			res.json(user);
		} catch (error) {
			next(error);
		}
	}

	public async updateRole(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } : any = req.params;
			const { isAdmin } = req.body;
			const roleUpdate: UpdateRoleDTO = { id, isAdmin };
			await this.userService.updateRole(roleUpdate);
			res.json({ message: "Ролята на потребителя е актуализирана успешно!" });
		} catch (error) {
			next(error);
		}
	}
}

export const userController: UserController = new UserController(
	new UserService(),
);

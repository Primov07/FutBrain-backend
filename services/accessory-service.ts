import { Types } from "mongoose";
import { AccessoryRepository, UserRepository } from ".";
import { Accessory } from ".";
import { AccessoryDTO, CreateAccessoryDTO, UpdateAccessoryDTO } from ".";
import { AppError } from "../controllers";

export class AccessoryService {
	private accessoryRepository: AccessoryRepository;
	private userRepository: UserRepository;

	constructor() {
		this.accessoryRepository = new AccessoryRepository();
		this.userRepository = new UserRepository();
	}

	public async getAll(): Promise<Array<AccessoryDTO> | null> {
		const accessories: Array<Accessory> | null =
			await this.accessoryRepository.getAll();
		if (accessories) return accessories.map((a) => this.toAccessoryDTO(a));
		return null;
	}

	public async getById(id: string): Promise<AccessoryDTO | null> {
		const accessory = await this.accessoryRepository.getById(id);
		if (accessory) return this.toAccessoryDTO(accessory);
		return null;
	}

	public async buy(accessoryId: string, userId: string): Promise<void> {
		const accessory = await this.accessoryRepository.getById(accessoryId);
		if (!accessory) throw new AppError("Аксесоарът не е намерен", 404);

		const user = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Потребителят не е намерен", 404);

		if (user.futcoins < accessory.price)
			throw new AppError("Недостатъчно средства!", 400);

		// Проверка дали потребителят вече притежава аксесоара (отчитаме, че е попълнен обект)
		const ownsAccessory = user.accessories?.some(
			(a: any) =>
				(a._id?.toString() || a.id?.toString() || a.toString()) === accessoryId,
		);

		if (ownsAccessory)
			throw new AppError("Вече притежавате този аксесоар!", 400);

		user.futcoins -= accessory.price;
		if (!user.accessories) user.accessories = [];
		user.accessories.push(new Types.ObjectId(accessoryId) as any);
		await this.userRepository.update(user);
	}

	public async getByUser(userId: string): Promise<Array<string> | null> {
		const user = await this.userRepository.getById(userId);
		if (!user) throw new AppError("Потребителят не е намерен", 404);

		return user.accessories?.map((a: any) => a.id?.toString()) || null;
	}

	public async create(accessory: CreateAccessoryDTO): Promise<string> {
		const newAccessory = new Accessory();

		newAccessory.endDate = accessory.endDate;
		newAccessory.name = accessory.name;
		newAccessory.price = accessory.price;
		newAccessory.type = accessory.type;

		return await this.accessoryRepository.create(newAccessory);
	}

	public async deleteById(id: string): Promise<boolean> {
		const ifDeleted: boolean = await this.accessoryRepository.deleteById(id);
		return ifDeleted;
	}

	public async update(accessory: UpdateAccessoryDTO): Promise<void | null> {
		const update = new Accessory();

		update.id = accessory.id;
		update.endDate = accessory.endDate;
		update.name = accessory.name;
		update.price = accessory.price;
		update.type = accessory.type;

		const result = await this.accessoryRepository.update(update);
		return result;
	}

	private toAccessoryDTO(accessory: Accessory): AccessoryDTO {
		return {
			id: accessory.id,
			name: accessory.name,
			price: accessory.price,
			endDate: accessory.endDate,
			photo: accessory.photo,
			type: accessory.type,
		};
	}
}

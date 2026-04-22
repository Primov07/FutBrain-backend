import { AccessoryRepository } from ".";
import { Accessory } from ".";
import { AccessoryDTO, CreateAccessoryDTO, UpdateAccessoryDTO } from ".";

export class AccessoryService {
	private accessoryRepository: AccessoryRepository;

	constructor() {
		this.accessoryRepository = new AccessoryRepository();
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

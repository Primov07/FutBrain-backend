import { AccessoryModel, Accessory } from ".";
import { DocumentType } from "@typegoose/typegoose";
import { Types } from "mongoose";

export class AccessoryRepository {
	public async getAll(): Promise<Array<Accessory> | null> {
		const accessories: Array<Accessory> | null = await AccessoryModel.find()
			.lean()
			.exec();
		return accessories;
	}

	public async getById(id: string): Promise<Accessory | null> {
		const accessory: Accessory | null = await AccessoryModel.findById(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		return accessory;
	}

	public async create(accessory: Accessory): Promise<string> {
		const model: DocumentType<Accessory> = new AccessoryModel(accessory);
		await model.save();
		return model._id.toString();
	}

	public async deleteById(id: string): Promise<boolean> {
		const result: Accessory | null = await AccessoryModel.findByIdAndDelete(
			new Types.ObjectId(id),
		)
			.lean()
			.exec();
		if (!result) return false;
		return true;
	}

	public async update(accessory: Accessory): Promise<void | null> {
		const id: string = accessory.id;
		let found = await AccessoryModel.findById(new Types.ObjectId(id));

		if (!found) return null;

		found.name = accessory.name;
		found.photo = accessory.photo;
		found.type = accessory.type;
		found.endDate = accessory.endDate;
		found.price = accessory.price;

		found.save();
	}
}

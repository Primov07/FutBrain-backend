import { getModelForClass, prop, pre } from "@typegoose/typegoose";
import { accessoriesUrl } from "../app";

enum Type {
	Ball = 1,
	Badge = 2,
	Shoes = 3,
}

@pre<Accessory>("save", async function () {
	this.id = this._id.toString();
	this.photo = `accessories/${this.id}.webp`
})
	

export class Accessory {
	@prop()
	public id!: string;

	@prop({
		required: true,
		unique: true,
	})
	public name!: string;

	@prop({ })
	public photo!: string;

	@prop({
		validate: {
			validator: (v) => {
				return Number.isInteger(v) && v > 0;
			},
			message: "Price should be positive integer!",
		},
	})
	public price!: number;

	@prop({ required: true })
	public endDate!: Date;

	@prop({ required: true, enum: Type })
	public type!: number;
}
export const AccessoryModel = getModelForClass(Accessory);

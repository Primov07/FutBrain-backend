import { getModelForClass, prop, type Ref } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { Player } from ".";

export class Game {
	@prop({ default: Date.now })
	public startDate!: Date;

	@prop({ required: true })
	public endDate!: Date;

	@prop({ ref: "Player", type: Types.ObjectId, default: null })
	public winner?: Ref<Player, Types.ObjectId>;

	@prop({ default: true })
	public isActive!: boolean;
}

export const GameModel = getModelForClass(Game);

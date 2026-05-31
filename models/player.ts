import { getModelForClass, prop, type Ref, pre } from "@typegoose/typegoose";
import type { User } from "./user";
import { playersUrl, clubsUrl, BASE_URL } from "../app";

@pre<Player>("save", async function () {
	if (this.isModified("club")) {
		if (this.club || this.club == "")
			this.clubImg = `${clubsUrl}/${this.club}.png`;
		else this.clubImg = `${BASE_URL}/club.png`;
	}
	this.id = this._id.toString();
	this.playerImg = `${playersUrl}/${this.id}.webp`;
})
export class Player {
	@prop()
	public id!: string;

	@prop({
		required: true,
		validate: {
			validator: (v) => {
				return v.length > 0;
			},
		},
		message: "Името на играча не може да бъде празно.",
	})
	public name!: string;

	@prop()
	public club!: string;

	@prop()
	public clubImg!: string;

	@prop()
	public playerImg!: string;

	@prop({
		default: [],
		ref: "User",
		type: String,
	})
	public users!: Ref<User, string>[];
}
export const PlayerModel = getModelForClass(Player);

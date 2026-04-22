import { getModelForClass, prop, type Ref, pre } from "@typegoose/typegoose";
import type { User } from "./user";
import { playersUrl, clubsUrl } from "../app";

@pre<Player>("save", async function () {
	if (this.isModified("club")) {
		this.clubImg = `${clubsUrl}/${this.club}.png`;
	}
	this.id = this._id.toString();
	this.playerImg= `${playersUrl}/${this.id}.webp`
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
		message: "Player name cannot be empty.",
	})
	public name!: string;

	@prop({
		required: true,
		validate: {
			validator: (v) => {
				return v.length > 0;
			},
		},
		message: "Club name cannot be empty.",
	})
	public club!: string;

	@prop({
		default: "../../uploads/club.png",
	})
	public clubImg!: string;

	@prop({
		default: "/players/player.png",
		validate: {
			validator: (v) => {
				return v.length > 0;
			},
		},
		message: "Player image cannot be empty.",
	})
	public playerImg!: string;

	@prop({
		default: [],
		ref: "User",
		type: String,
	})
	public users!: Ref<User, string>[];
}
export const PlayerModel = getModelForClass(Player);

import { getModelForClass, prop, pre, type Ref } from "@typegoose/typegoose";
import { User } from "./user";

@pre<Report>("save", async function () {
	this.id = this._id.toString();
})
export class Report {
	@prop()
	public id!: string;

	@prop({
		required: true,
	})
    public content!: string;
    
	@prop({ 
		ref: "User",
		type: String,
		required: true
	})
    public from!: Ref<User, string>;

	@prop({ required: true })
	public sentDate!: Date;

	@prop({
		required: true,
		enum: ["Post", "Reply", "Comment"],
	})
	public targetType!: string;

	@prop({
		required: true,
	})
	public targetId!: string;

	@prop({
		enum: ["Pending", "Resolved", "Rejected"],
		default: "Pending",
	})
	public status!: string;
}
export const ReportModel = getModelForClass(Report);

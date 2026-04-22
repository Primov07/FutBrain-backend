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
    
    @prop({ required: true })
    public from!: Ref<User, string>;

    @prop({ required: true })
    public to!: Ref<User, string>;

	@prop({ required: true })
	public sentDate!: Date;

	@prop({
		default: [],
		enum: ["Post", "Reply", "Comment"],
	})
	public targetType!: string;

	@prop({
		required: true,
		refPath: "targetType",
	})
	public targetId!: Ref<any>;

	@prop({
		enum: ["Pending", "Resolved", "Rejected"],
		default: "pending",
	})
	public status!: string;
}
export const ReportModel = getModelForClass(Report);

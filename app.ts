import express from "express";
import { connect } from "mongoose";
import dotenv from "dotenv";
import { accessoryRouter } from "./routes/accessory-routes";
import { userRouter } from "./routes/user-routes";
import { commentRouter } from "./routes/comment-routes";
import { playerRouter } from "./routes/player-routes";
import { postRouter } from "./routes/post-routes";
import { replyRouter } from "./routes/reply-routes";
import { reportRouter } from "./routes/report-routes";
import path from "path";
import fs from "fs";
import cors from "cors";
import { errorHandler } from "./middlewares/error-handler";
import { authenticateToken } from "./middlewares/auth-middleware";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import { UserService } from "./services";

dotenv.config();

const connectionString: string = process.env.MONGO_URI!;
connect(connectionString).then(() => {
	console.log("Connected to MongoDB");
	new UserService().seedAdmin();
}).catch(err => {
	console.error("MongoDB connection error:", err);
});
const HOST: string = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
export const app: express.Application = express();

const PORT: number = parseInt(process.env.PORT!);
export const BASE_URL: string = `http://${HOST}:${PORT}`;
export const clubsUrl: string = `${BASE_URL}/clubs`;
export const playersUrl: string = `${BASE_URL}/players`;
export const accessoriesUrl: string = `${BASE_URL}/accessories`;

const viteUrl: string = process.env.VITE_FRONTEND_URL!;

app.use(
	cors({
		origin: viteUrl,
		credentials: true,
	}),
);

app.use("/", express.static(path.join(__dirname, "../uploads/")));
app.use("/clubs", express.static(path.join(__dirname, "../uploads/clubs")));
app.use("/players", express.static(path.join(__dirname, "../uploads/players")));
app.use("/accessories", express.static(path.join(__dirname, "../uploads/accessories")));
app.use("/users", express.static(path.join(__dirname, "../uploads/users")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/accessories", accessoryRouter);
app.use("/users", userRouter);
app.use("/comments", commentRouter);
app.use("/players", playerRouter);
app.use("/posts", postRouter);
app.use("/replies", replyRouter);
app.use("/reports", reportRouter);

app.get("/clubs", (req: express.Request, res: express.Response) => {
	const clubsFolder = path.resolve(__dirname, "../../src/uploads/clubs");

	fs.readdir(clubsFolder, (err: Error | null, files: string[]) => {
		if (err) {
			console.error("Error reading clubs directory:", err.message);
			return res.status(500).json({ error: "Failed to read clubs directory" });
		}

		const clubImages: { name: string; url: string }[] = files
			.filter(
				(file) =>
					file.toLowerCase().endsWith(".png") ||
					file.toLowerCase().endsWith(".jpg") ||
					file.toLowerCase().endsWith(".jpeg"),
			)
			.map((file) => ({
				name: path.parse(file).name,
				url: `${clubsUrl}/${file}`,
			}));
		res.json(clubImages);
	});
});

app.get(
	"/me",
	authenticateToken,
	(req: express.Request, res: express.Response) => {
		res.json((req as any).user);
	},
);
app.get("/logout", (req: express.Request, res: express.Response) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
	});

	res.status(200).json({ message: "Успешно излязохте от профила си!" });
});

app.post("/contact", async (req: express.Request, res: express.Response) => {
	const { name, email, subject, message } = req.body;

	if (!name || !email || !subject || !message) {
		res.status(400).json({ message: "Моля, попълнете абсолютно всички полета!" });
		return;
	}

	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		const mailOptions = {
			from: email,
			to: process.env.EMAIL_USER,
			subject: subject,
			text: `Име: ${name}\n\n${message}`,
		};

		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: "Вашето съобщение беше изпратено успешно!" });
	} catch (error) {
		console.error("Email error:", error);
		res.status(500).json({ message: "Грешка при изпращането на имейла." });
	}
});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}!`);
});

import multer from "multer";
import path from "path";
import { AppError } from "./error-handler";

const playerStorage: multer.StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "../src/uploads/players");
	},
    filename: (req, file, cb) => {
		const extName = path.extname(file.originalname);
		if (extName != ".webp") return cb(new AppError("Снимките трябва да бъдат в .webp формат!", 500), "");
		cb(null, Date.now() + extName);
	},
});

const postStorage: multer.StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "../src/uploads/posts");
	},
	filename: (req, file, cb) => {
		const extName = path.extname(file.originalname);
		cb(null, Date.now() + extName);
	},
});


export const playerUpload: multer.Multer = multer({
	storage: playerStorage,
	limits: {
		fileSize: 1 * 1024 * 1024, // 1 MB
	},
});

export const postUpload: multer.Multer = multer({
	storage: playerStorage,
	limits: {
		fileSize: 1 * 1024 * 1024, // 1 MB
	},
});

const accessoryStorage: multer.StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "../src/uploads/accessories");
	},
	filename: (req, file, cb) => {
		const extName = path.extname(file.originalname);
		if (extName != ".webp")
			return cb(new AppError("Снимките трябва да бъдат в .webp формат!", 500), "");
		cb(null, Date.now() + extName);
	},
});

export const accessoryUpload: multer.Multer = multer({
	storage: accessoryStorage,
	limits: {
		fileSize: 1 * 1024 * 1024, // 1 MB
	},
});

const commentStorage: multer.StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "../uploads/comments");
	},
	filename: (req, file, cb) => {
		const id = req.body.id;
		cb(null, id);
	},
});

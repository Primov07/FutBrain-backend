import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { AppError } from "../controllers";

dotenv.config();

export class ModerationService {
	private genAI: GoogleGenerativeAI;

	constructor() {
		this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
	}

	public async isContentSafe(content: string): Promise<boolean> {
		if (!content || content.trim().length < 5) return true;

		try {
			const model = this.genAI.getGenerativeModel({
				model: "gemini-2.5-flash-lite",
			});

			const prompt = `Ти си модератор на българския футболен форум "FutBrain". Твоята роля 
			е изключително важна за поддържането на ползотворна, позитивна и безопасна среда за всички потребители.
			Трябва да провериш дали даден текст съдържа обиди, реч на омразата, нецензурни думи или спам. Ако текстът е
			безопасен, отговори с "SAFE". Ако съдържа неподходящо съдържание, отговори с "REJECTED". Не предоставяй
			никакви допълнителни обяснения или контекст, а само една от двете думи. Провери дали следният текст съдържа
			нецензурно, расистко, дискриминационно или политическо съдържание, както и виден опит за спам или
			целенасочено заяждане. Също така следи за смислено съдържание - публикацията не съдържа безсмислени думи
			или думи, съставени от произволна вариация на символи. 
            Текст: "${content}"
            Отговори само с една дума: "SAFE" или "REJECTED".`;

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text().trim().toUpperCase();

			return text.includes("SAFE");
		} catch (error: any) {
			console.error("AI Moderation Error:", error.message);
			throw new AppError("Грешка при проверката на съдържанието!", 500);
		}
		return true;
	}
}

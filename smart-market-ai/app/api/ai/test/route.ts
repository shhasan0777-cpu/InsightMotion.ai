import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "GROQ_API_KEY не найден в .env.local",
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const chat = await groq.chat.completions.create({
  messages: [{ role: "user", content: "Напиши только одно слово: работает" }],
  model: "llama-3.3-70b-versatile",
});

    return NextResponse.json({
      success: true,
      text: chat.choices[0]?.message?.content,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Ошибка подключения",
      keyTail: process.env.GROQ_API_KEY?.slice(-6),
    });
  }
}
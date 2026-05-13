import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const models = await groq.models.list();

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message,
      keyTail: process.env.GROQ_API_KEY?.slice(-6),
    });
  }
}
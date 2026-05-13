import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.WB_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "WB_API_KEY не найден в .env.local",
      });
    }

    const response = await fetch("https://content-api.wildberries.ru/content/v2/get/cards/list", {
      method: "POST",
      headers: {
        Authorization: process.env.WB_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settings: {
          cursor: {
            limit: 10,
          },
          filter: {
            withPhoto: -1,
          },
        },
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Ошибка WB API",
    });
  }
}
import { NextResponse } from "next/server";
export const runtime = "nodejs";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("eventdb");
    const eventCollection = db.collection("events");

    const result = await eventCollection
      .find({})
      .sort({ createAt: -1 })
      .limit(6)
      .toArray();

    return NextResponse.json({ events: result });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

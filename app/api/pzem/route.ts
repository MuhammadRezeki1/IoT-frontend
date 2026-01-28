import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    phaseR: 420,
    phaseS: 380,
    phaseT: 450,
    voltage: 220,
  });
}

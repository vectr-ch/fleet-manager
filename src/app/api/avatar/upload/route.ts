import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "@/lib/auth/cookies";
import { ensureValidToken, decodeJwtPayload } from "@/lib/auth/refresh";

const FMS_URL = process.env.FMS_URL ?? "http://fms:4000";

export async function POST(request: NextRequest) {
  const tokens = await getTokens();
  const accessToken = await ensureValidToken(tokens);

  if (!accessToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { sub } = decodeJwtPayload(accessToken);
  if (!sub) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "missing_avatar_file" }, { status: 400 });
  }

  const fmsForm = new FormData();
  fmsForm.append("avatar", file);

  const res = await fetch(`${FMS_URL}/users/${sub}/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fmsForm,
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

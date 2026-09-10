import { NextResponse } from "next/server";
import { uploadAttachment } from "../../../../../lib/airtable";
import { INVENTORY_FIELDS } from "../../../../../lib/airtable";

export async function POST(request, { params }) {
  try {
    const { base64, contentType, filename } = await request.json();
    if (!base64 || !contentType) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }
    const result = await uploadAttachment(
      params.id,
      INVENTORY_FIELDS.photo,
      base64,
      contentType,
      filename || "photo.jpg"
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

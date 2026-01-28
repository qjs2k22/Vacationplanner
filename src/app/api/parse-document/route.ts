import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const apiKey = formData.get("apiKey") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Claude API key required. Add it in Settings." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Determine media type
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";
    if (file.type === "application/pdf") {
      mediaType = "application/pdf";
    } else if (file.type === "image/png") {
      mediaType = "image/png";
    } else if (file.type === "image/gif") {
      mediaType = "image/gif";
    } else if (file.type === "image/webp") {
      mediaType = "image/webp";
    } else {
      mediaType = "image/jpeg";
    }

    // Initialize Anthropic client with user's API key
    const anthropic = new Anthropic({ apiKey });

    // Parse the document with Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: mediaType === "application/pdf" ? "document" : "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            } as Anthropic.DocumentBlockParam | Anthropic.ImageBlockParam,
            {
              type: "text",
              text: `Extract booking/travel information from this document. Return a JSON object with these fields (use null for missing info):

{
  "type": "flight" | "hotel" | "restaurant" | "activity" | "other",
  "name": "Name/title of the booking",
  "confirmationNumber": "Confirmation or booking number",
  "date": "YYYY-MM-DD format",
  "startTime": "HH:MM format (24h)",
  "endTime": "HH:MM format (24h) if applicable",
  "location": "Address or location name",
  "notes": "Any other relevant details"
}

Return ONLY the JSON object, no other text.`,
            },
          ],
        },
      ],
    });

    // Extract the text response
    const firstContent = message.content[0];
    const responseText =
      firstContent && firstContent.type === "text" ? firstContent.text : "";

    // Try to parse as JSON
    let parsedData;
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedData = JSON.parse(cleanedResponse);
    } catch {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        success: true,
        parsed: false,
        raw: responseText,
      });
    }

    return NextResponse.json({
      success: true,
      parsed: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Document parsing error:", error);

    // Check for API key errors
    if (error instanceof Error && error.message.includes("401")) {
      return NextResponse.json(
        { error: "Invalid Claude API key. Check your key in Settings." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to parse document" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// Try to extract LinkedIn headline from public profile page
async function scrapeLinkedInHeadline(linkedinUrl: string): Promise<string | null> {
  try {
    const res = await fetch(linkedinUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Try og:description meta tag — LinkedIn puts headline here for public profiles
    const ogMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

    if (ogMatch?.[1]) {
      // og:description format is often "headline · location · company"
      // or "headline - location - company - connections"
      const desc = ogMatch[1].replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
      // Take everything before " · " or " - " location part, or first sentence
      const parts = desc.split(/\s[·|]\s|\s-\s/);
      if (parts[0] && parts[0].length > 3 && parts[0].length < 120) {
        return parts[0].trim();
      }
    }

    // Try twitter:description or description meta tag
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);

    if (descMatch?.[1]) {
      const desc = descMatch[1].replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
      const parts = desc.split(/\s[·|]\s|\s-\s/);
      if (parts[0] && parts[0].length > 3 && parts[0].length < 120) {
        return parts[0].trim();
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { name, company, location, links } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Check if there's a LinkedIn URL — try scraping headline first
  const linkedinLink = (links || []).find((l: { label: string; url: string }) =>
    l.url?.includes("linkedin.com/in/")
  );

  if (linkedinLink?.url) {
    const headline = await scrapeLinkedInHeadline(linkedinLink.url);
    if (headline) {
      return NextResponse.json({ oneliner: headline, source: "linkedin" });
    }
  }

  // Fallback: AI-generate from context
  const linkContext = (links || [])
    .map((l: { label: string; url: string }) => `${l.label}: ${l.url}`)
    .join("\n");

  const prompt = `Generate a short, catchy professional one-liner / headline for this person's digital voice card.

Name: ${name}
${company ? `Company: ${company}` : ""}
${location ? `Location: ${location}` : ""}
${linkContext ? `Their links:\n${linkContext}` : ""}

Rules:
- Maximum 8 words
- Professional but warm tone
- If you can infer their role from links (LinkedIn headline, GitHub bio, etc.), use that context
- Examples: "AI Growth Leader & Community Builder", "Full-Stack Developer | Open Source Enthusiast", "Marketing Strategist Connecting Tech & People"
- Return ONLY the one-liner text, nothing else`;

  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const oneliner = data.choices[0].message.content.trim().replace(/^["']|["']$/g, "");
    return NextResponse.json({ oneliner, source: "ai" });
  } catch (err) {
    console.error("Generate oneliner error:", err);
    return NextResponse.json({ error: "Failed to generate one-liner" }, { status: 500 });
  }
}

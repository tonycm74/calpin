import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface EventInfo {
  title: string | null;
  description: string | null;
  date: string | null;
  time: string | null;
  timezone: string | null;
  location: string | null;
  venue: string | null;
  image_url: string | null;
  ticket_url: string | null;
}

interface PerplexityImage {
  image_url: string;
  origin_url?: string;
  height?: number;
  width?: number;
  title?: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  images?: (string | PerplexityImage)[]; // Images can be strings or objects
}

// Helper to extract URL from image (handles both string and object formats)
function extractImageUrl(img: string | PerplexityImage | null | undefined): string | null {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.image_url) return img.image_url;
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!perplexityApiKey) {
      return new Response(
        JSON.stringify({ error: "Perplexity API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Perplexity API to extract event information
    const prompt = `Extract event information from this URL: ${url}

Please find and return the following information about this event in a JSON format:

1. title: The name/title of the event (keep it concise)

2. description: Write a compelling, marketing-style caption (1-2 sentences) that would make someone excited to attend. Focus on the experience, atmosphere, or significance of the event. Examples:
   - "An electrifying Christmas Day showdown between two Eastern Conference powerhouses at the World's Most Famous Arena."
   - "Experience the magic of live jazz in an intimate setting with one of today's most celebrated artists."
   Do NOT just describe what the event is - make it enticing!

3. date: The date in YYYY-MM-DD format. Look for the event date on the page.

4. time: IMPORTANT - Find the event start time and return it in HH:MM format (24-hour). 
   - Look for phrases like "Doors open", "Event starts", "Game time", "Show time"
   - For NBA games, the tip-off time is usually listed on the ticket page
   - Convert to 24-hour format (e.g., 1:00 PM = 13:00, 7:30 PM = 19:30)
   - Do NOT return null if you can find any time information

5. timezone: IMPORTANT - Use the timezone of the VENUE LOCATION, not your timezone. Return the IANA timezone format:
   - New York, Miami, Boston → "America/New_York"
   - Chicago → "America/Chicago"  
   - Denver → "America/Denver"
   - Los Angeles, San Francisco → "America/Los_Angeles"
   - London → "Europe/London"
   
6. location: The full address of the venue

7. venue: The name of the venue

8. image_url: Find a REAL, VERIFIED image URL that you can confirm exists. 
   CRITICAL: Do NOT fabricate or guess URLs. Only return a URL if you have actually found it on a webpage.
   - Search for official team/artist images from Wikipedia, official websites, or sports databases
   - For NBA teams, look for official team logos or player images from nba.com or Wikipedia
   - For concerts, look for artist press photos from their official site
   - Return null if you cannot find a verified working image URL
   - NEVER construct URLs based on patterns or IDs - only use URLs you found on real pages

9. ticket_url: The original URL where tickets can be purchased

Respond ONLY with valid JSON in this exact format, no additional text:
{
  "title": "string or null",
  "description": "string or null",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
  "timezone": "string or null",
  "location": "string or null",
  "venue": "string or null",
  "image_url": "string or null",
  "ticket_url": "string or null"
}`;

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are an expert event marketing assistant that extracts event information from URLs. You write compelling, exciting descriptions that make people want to attend. You always determine the timezone based on the venue's physical location (e.g., Madison Square Garden is in New York, so use America/New_York). Always respond with valid JSON only, no markdown formatting or additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        return_images: true // Enable image search
      })
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("Perplexity API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch event information", details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data: PerplexityResponse = await perplexityResponse.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from Perplexity API" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from Perplexity
    let eventInfo: EventInfo;
    try {
      // Try to extract JSON from the response (it might have markdown code blocks)
      let jsonString = content;
      
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      
      eventInfo = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse Perplexity response:", content);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse event information", 
          raw_response: content 
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle image_url if it came back as an object instead of string
    if (eventInfo.image_url && typeof eventInfo.image_url === 'object') {
      eventInfo.image_url = extractImageUrl(eventInfo.image_url as unknown as PerplexityImage);
    }

    // Validate image URL - check for obviously fabricated URLs
    if (eventInfo.image_url && typeof eventInfo.image_url === 'string') {
      const imageUrl = eventInfo.image_url;
      const suspiciousPatterns = [
        /ticketm\.net\/dam\/[a-z]\/[a-f0-9]+\/[a-f0-9]+\.jpg$/i,
        /s1\.ticketm\.net\/dam/i,
        /placeholder/i,
        /default/i,
      ];
      
      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(imageUrl));
      const isTooShort = imageUrl.length < 30;
      
      if (isSuspicious || isTooShort) {
        console.log("Filtering out suspicious image URL:", imageUrl);
        eventInfo.image_url = null;
      }
    }

    // Process images array - extract URLs from objects
    const processedImages: string[] = (data.images || [])
      .map(img => extractImageUrl(img))
      .filter((url): url is string => url !== null && url.length > 0);

    // If no valid image from AI, use first image from search
    if (!eventInfo.image_url && processedImages.length > 0) {
      console.log("Using image from Perplexity image search:", processedImages[0]);
      eventInfo.image_url = processedImages[0];
    }

    // Return the structured event info with all available images as strings
    return new Response(
      JSON.stringify({
        success: true,
        data: eventInfo,
        images: processedImages, // Clean array of image URL strings
        source_url: url
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in extract-event-info:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


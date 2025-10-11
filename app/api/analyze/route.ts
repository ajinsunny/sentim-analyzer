import { NextRequest, NextResponse } from "next/server"

// Constants
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models"
const MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"
const MIN_CHARACTERS = 10
const MAX_CHARACTERS = 1000
const REQUEST_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 2

// Types
interface AnalyzeRequest {
  text: string
}

interface HuggingFaceResponse {
  label: string
  score: number
}

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  scores: {
    positive: number
    negative: number
    neutral: number
  }
}

// Helper: Validate input
function validateInput(text: unknown): { valid: boolean; error?: string } {
  if (typeof text !== "string") {
    return { valid: false, error: "Text must be a string" }
  }

  const trimmedText = text.trim()

  if (!trimmedText) {
    return { valid: false, error: "Text is required" }
  }

  if (trimmedText.length < MIN_CHARACTERS) {
    return {
      valid: false,
      error: `Text must be at least ${MIN_CHARACTERS} characters long`,
    }
  }

  if (trimmedText.length > MAX_CHARACTERS) {
    return {
      valid: false,
      error: `Text must not exceed ${MAX_CHARACTERS} characters`,
    }
  }

  return { valid: true }
}

// Helper: Call HuggingFace API
async function callHuggingFaceAPI(
  text: string,
  apiKey: string,
  retryCount = 0
): Promise<HuggingFaceResponse[][]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle specific HTTP errors
    if (response.status === 401) {
      throw new Error("Invalid API key")
    }

    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }

    // Model loading - retry
    if (response.status === 503) {
      const errorData = await response.json().catch(() => ({}))
      
      if (
        errorData.error?.includes("loading") &&
        retryCount < MAX_RETRIES
      ) {
        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * (retryCount + 1))
        )
        return callHuggingFaceAPI(text, apiKey, retryCount + 1)
      }

      throw new Error("Model is loading. Please try again in a moment.")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `API request failed: ${response.statusText}`
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.")
      }
      throw error
    }

    throw new Error("An unexpected error occurred")
  }
}

// Helper: Transform HuggingFace response to our format
function transformResponse(
  hfResponse: HuggingFaceResponse[][]
): SentimentResult {
  // HuggingFace returns array of arrays, take first array
  const scores = hfResponse[0]

  // Initialize score object
  const scoreMap: { [key: string]: number } = {
    positive: 0,
    negative: 0,
    neutral: 0,
  }

  // Map labels to our format and extract scores
  scores.forEach((item) => {
    const label = item.label.toLowerCase()
    
    // Handle different label formats
    if (label.includes("positive") || label === "pos") {
      scoreMap.positive = item.score
    } else if (label.includes("negative") || label === "neg") {
      scoreMap.negative = item.score
    } else if (label.includes("neutral") || label === "neu") {
      scoreMap.neutral = item.score
    }
  })

  // Find sentiment with highest score
  let maxScore = 0
  let sentiment: "positive" | "negative" | "neutral" = "neutral"

  Object.entries(scoreMap).forEach(([key, score]) => {
    if (score > maxScore) {
      maxScore = score
      sentiment = key as "positive" | "negative" | "neutral"
    }
  })

  return {
    sentiment,
    confidence: maxScore,
    scores: {
      positive: scoreMap.positive,
      negative: scoreMap.negative,
      neutral: scoreMap.neutral,
    },
  }
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AnalyzeRequest = await request.json()

    // Validate input
    const validation = validateInput(body.text)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check for API key
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      console.error("HUGGINGFACE_API_KEY is not set")
      return NextResponse.json(
        { error: "API configuration error. Please contact support." },
        { status: 500 }
      )
    }

    // Check for placeholder key
    if (apiKey.includes("placeholder") || apiKey.includes("your_")) {
      return NextResponse.json(
        { 
          error: "API key not configured. Please add your HuggingFace API key to .env.local" 
        },
        { status: 500 }
      )
    }

    // Call HuggingFace API
    const hfResponse = await callHuggingFaceAPI(body.text.trim(), apiKey)

    // Transform response
    const result = transformResponse(hfResponse)

    // Return success response
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("API Error:", error)

    // Handle known errors
    if (error instanceof Error) {
      // Return user-friendly error message
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Rate limit") ? 429 : 500 }
      )
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  )
}

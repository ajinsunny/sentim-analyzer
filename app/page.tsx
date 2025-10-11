"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  SentimentResultDisplay,
  type SentimentResult,
} from "@/components/sentiment-result"
import { Sparkles, AlertCircle, Loader2 } from "lucide-react"

const EXAMPLE_TEXTS = {
  positive:
    "I absolutely loved this product! The quality exceeded my expectations and the customer service was outstanding. Highly recommend!",
  negative:
    "This was a terrible experience. The product broke after one day and customer support never responded to my emails. Very disappointed.",
  neutral:
    "The package arrived on time. It contained the items as described in the listing. The product works as expected.",
  mixed:
    "The food was delicious and the atmosphere was great, but the service was really slow and the prices were too high for what we got.",
}

const MAX_CHARACTERS = 1000
const MIN_CHARACTERS = 10

export default function Home() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const charCount = text.length
  const isOverLimit = charCount > MAX_CHARACTERS
  const isUnderMin = charCount > 0 && charCount < MIN_CHARACTERS

  const handleAnalyze = async () => {
    // Clear previous results and errors
    setError(null)
    setResult(null)

    // Validation
    if (!text.trim()) {
      setError("Please enter some text to analyze.")
      return
    }

    if (text.trim().length < MIN_CHARACTERS) {
      setError(`Text must be at least ${MIN_CHARACTERS} characters long.`)
      return
    }

    if (text.length > MAX_CHARACTERS) {
      setError(`Text must not exceed ${MAX_CHARACTERS} characters.`)
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Analysis failed: ${response.statusText}`
        )
      }

      const data = await response.json()
      setResult(data)

      // Smooth scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById("results")
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setText("")
    setResult(null)
    setError(null)
  }

  const handleTryExample = () => {
    const examples = Object.values(EXAMPLE_TEXTS)
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    setText(randomExample)
    setResult(null)
    setError(null)
  }

  const handleAnalyzeAnother = () => {
    setText("")
    setResult(null)
    setError(null)
    // Focus on textarea and scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
      document.getElementById("text-input")?.focus()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleAnalyze()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-4">
            Sentim Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the emotional tone behind any text. Powered by AI.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Card */}
        {!result && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Your Text</CardTitle>
              <CardDescription>
                Type or paste any text to analyze its sentiment. Try our
                examples or write your own!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Your text</Label>
                <Textarea
                  id="text-input"
                  placeholder="I absolutely loved this product! It exceeded my expectations and the customer service was outstanding. Highly recommend!"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={8}
                  className={`resize-none ${
                    isOverLimit ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  disabled={isAnalyzing}
                  maxLength={MAX_CHARACTERS + 100} // Soft limit with visual feedback
                />
                <div className="flex justify-between items-center text-sm">
                  <div>
                    {isUnderMin && (
                      <span className="text-yellow-600">
                        At least {MIN_CHARACTERS - charCount} more characters
                        needed
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      isOverLimit
                        ? "text-red-500"
                        : charCount > MAX_CHARACTERS * 0.9
                        ? "text-yellow-600"
                        : "text-gray-500"
                    }`}
                  >
                    {charCount} / {MAX_CHARACTERS}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleTryExample}
                  disabled={isAnalyzing}
                >
                  Try Example
                </Button>
                {text && (
                  <Button
                    variant="ghost"
                    onClick={handleClear}
                    disabled={isAnalyzing}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={
                  isAnalyzing || !text.trim() || isOverLimit || isUnderMin
                }
                size="lg"
                className="min-w-[140px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div id="results">
            <SentimentResultDisplay
              result={result}
              onAnalyzeAnother={handleAnalyzeAnother}
            />
          </div>
        )}

        {/* Example Texts Section */}
        {!result && !isAnalyzing && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Quick Examples
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(EXAMPLE_TEXTS).map(([key, exampleText]) => (
                <button
                  key={key}
                  onClick={() => {
                    setText(exampleText)
                    setError(null)
                  }}
                  className="text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                >
                  <div className="text-xs font-semibold text-indigo-600 uppercase mb-1">
                    {key}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {exampleText}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

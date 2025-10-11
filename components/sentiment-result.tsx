"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

export interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  scores?: {
    positive: number
    negative: number
    neutral: number
  }
}

interface SentimentResultProps {
  result: SentimentResult
  onAnalyzeAnother: () => void
}

const sentimentConfig = {
  positive: {
    emoji: "😊",
    label: "Positive Sentiment",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    progressColor: "bg-green-500",
    badgeVariant: "success" as const,
  },
  negative: {
    emoji: "😔",
    label: "Negative Sentiment",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    progressColor: "bg-red-500",
    badgeVariant: "destructive" as const,
  },
  neutral: {
    emoji: "😐",
    label: "Neutral Sentiment",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    progressColor: "bg-gray-500",
    badgeVariant: "secondary" as const,
  },
}

export function SentimentResultDisplay({
  result,
  onAnalyzeAnother,
}: SentimentResultProps) {
  const config = sentimentConfig[result.sentiment]
  const confidencePercent = Math.round(result.confidence * 100)

  return (
    <Card className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <CardTitle className="text-xl">Analysis Complete</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sentiment Badge */}
        <div className="flex justify-center">
          <div
            className={`${config.bgColor} ${config.textColor} rounded-2xl px-8 py-6 text-center`}
          >
            <div className="text-6xl mb-2">{config.emoji}</div>
            <div className="text-2xl font-bold">{config.label}</div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Confidence</span>
            <span className="font-semibold">{confidencePercent}%</span>
          </div>
          <div className="relative">
            <Progress value={confidencePercent} className="h-3" />
            <style jsx>{`
              :global(.bg-primary) {
                background-color: ${config.progressColor.replace("bg-", "")} !important;
              }
            `}</style>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {result.scores && (
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <h4 className="text-sm font-semibold">Detailed Breakdown</h4>
            <div className="space-y-2">
              <ScoreBar
                label="Positive"
                score={result.scores.positive}
                color="bg-green-500"
              />
              <ScoreBar
                label="Negative"
                score={result.scores.negative}
                color="bg-red-500"
              />
              <ScoreBar
                label="Neutral"
                score={result.scores.neutral}
                color="bg-gray-500"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onAnalyzeAnother} className="w-full" size="lg">
          Analyze Another Text
        </Button>
      </CardFooter>
    </Card>
  )
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string
  score: number
  color: string
}) {
  const percentage = Math.round(score * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

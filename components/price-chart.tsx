"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getCoinChart, type ChartData } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle, RefreshCw } from "lucide-react"

interface PriceChartProps {
  coinId: string
}

const timeRanges = [
  { label: "24H", value: "1" },
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "90D", value: "90" },
]

export function PriceChart({ coinId }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState("7")

  const fetchChartData = async (range: string, retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)
      setChartData(null)

      const data = await getCoinChart(coinId, range)

      // Validate data
      if (!data || !data.prices || data.prices.length === 0) {
        throw new Error("No chart data available")
      }

      setChartData(data)
    } catch (error) {
      console.error("Error fetching chart data:", error)

      // If 24h fails and this is first attempt, try 7d instead
      if (range === "1" && retryCount === 0) {
        console.log("24h failed, falling back to 7d...")
        await fetchChartData("7", 1)
        return
      }

      setError(error instanceof Error ? error.message : "Failed to load chart data")
      setChartData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData(selectedRange)
  }, [coinId, selectedRange])

  const formatChartData = () => {
    if (!chartData) return []

    return chartData.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
      date: new Date(timestamp).toLocaleDateString(),
      time: new Date(timestamp).toLocaleTimeString(),
    }))
  }

  const formatTooltipLabel = (timestamp: number) => {
    const date = new Date(timestamp)
    if (selectedRange === "1") {
      return date.toLocaleTimeString()
    }
    return date.toLocaleDateString()
  }

  const handleRetry = () => {
    fetchChartData(selectedRange)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <Skeleton key={range.value} className="h-9 w-12" />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !chartData || !chartData.prices || chartData.prices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
                disabled={loading}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-muted-foreground">{error || "Chart data temporarily unavailable"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This may be due to API rate limits. Please try again.
                </p>
              </div>
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = formatChartData()
  const isPositive = data.length > 1 && data[data.length - 1].price > data[0].price

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRange(range.value)}
              disabled={loading}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTooltipLabel}
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Tooltip
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [formatCurrency(value), "Price"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

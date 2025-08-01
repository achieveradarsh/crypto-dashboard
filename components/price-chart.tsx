"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getCoinChart, type ChartData } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
  const [selectedRange, setSelectedRange] = useState("7")

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        setChartData(null) // Clear previous data
        const data = await getCoinChart(coinId, selectedRange)
        setChartData(data)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        // Don't show error toast for chart failures, just show fallback
        setChartData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
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

  if (!chartData || !chartData.prices || chartData.prices.length === 0) {
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
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Chart data temporarily unavailable</p>
              <p className="text-sm text-muted-foreground mt-1">Please try again in a moment</p>
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

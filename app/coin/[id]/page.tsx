"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Star, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { PriceChart } from "@/components/price-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useWatchlist } from "@/hooks/use-watchlist"
import { getCoinDetail, type CoinDetail } from "@/lib/api"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function CoinDetailPage() {
  const params = useParams()
  const coinId = params.id as string
  const [coin, setCoin] = useState<CoinDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { isInWatchlist, toggleWatchlist } = useWatchlist()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCoinDetail = async () => {
      try {
        setLoading(true)
        const data = await getCoinDetail(coinId)
        setCoin(data)
      } catch (error) {
        console.error("Error fetching coin detail:", error)
        toast({
          title: "Error",
          description: "Failed to fetch coin details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (coinId) {
      fetchCoinDetail()
    }
  }, [coinId, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <CoinDetailSkeleton />
        </main>
      </div>
    )
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Coin not found</h2>
            <p className="text-muted-foreground mb-4">The requested cryptocurrency could not be found.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Markets
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    )
  }

  const marketData = coin.market_data
  const priceChange24h = marketData.price_change_percentage_24h
  const isPositive = priceChange24h >= 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={coin.image.large || "/placeholder.svg"}
                      alt={coin.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-3xl font-bold">{coin.name}</h1>
                        <Badge variant="secondary" className="text-sm">
                          {coin.symbol.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">Rank #{coin.market_cap_rank}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-3xl font-bold">{formatCurrency(marketData.current_price.usd)}</span>
                        <Badge variant={isPositive ? "default" : "destructive"} className="text-sm">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {formatPercentage(priceChange24h)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => toggleWatchlist(coin.id)}>
                    <Star
                      className={`h-5 w-5 ${
                        isInWatchlist(coin.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <PriceChart coinId={coin.id} />

            {coin.description.en && (
              <Card>
                <CardHeader>
                  <CardTitle>About {coin.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: coin.description.en.split(". ").slice(0, 3).join(". ") + ".",
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium">{formatNumber(marketData.market_cap.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-medium">{formatNumber(marketData.total_volume.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h High</span>
                  <span className="font-medium">{formatCurrency(marketData.high_24h.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Low</span>
                  <span className="font-medium">{formatCurrency(marketData.low_24h.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Circulating Supply</span>
                  <span className="font-medium">{marketData.circulating_supply?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="font-medium">{marketData.total_supply?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Supply</span>
                  <span className="font-medium">{marketData.max_supply?.toLocaleString() || "∞"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href={`https://www.coingecko.com/en/coins/${coin.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on CoinGecko
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function CoinDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-10" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <div className="flex space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-12" />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

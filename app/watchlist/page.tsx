"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { CoinTable } from "@/components/coin-table"
import { useWatchlist } from "@/hooks/use-watchlist"
import { getCoinsMarkets, type Coin } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function WatchlistPage() {
  const [watchlistCoins, setWatchlistCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const { watchlist } = useWatchlist()
  const { toast } = useToast()

  useEffect(() => {
    const fetchWatchlistCoins = async () => {
      if (watchlist.length === 0) {
        setWatchlistCoins([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Fetch all coins and filter by watchlist
        const allCoins = await getCoinsMarkets(1, 250) // Get more coins to ensure we have watchlist items
        const filtered = allCoins.filter((coin) => watchlist.includes(coin.id))
        setWatchlistCoins(filtered)
      } catch (error) {
        console.error("Error fetching watchlist coins:", error)
        toast({
          title: "Error",
          description: "Failed to fetch watchlist data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlistCoins()
  }, [watchlist, toast])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">Track your favorite cryptocurrencies</p>
        </div>

        {!loading && watchlist.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Star className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your watchlist by clicking the star icon next to any cryptocurrency
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <CoinTable coins={watchlistCoins} loading={loading} />
        )}
      </main>
    </div>
  )
}

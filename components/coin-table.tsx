"use client"
import Image from "next/image"
import Link from "next/link"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useWatchlist } from "@/hooks/use-watchlist"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"
import type { Coin } from "@/lib/api"

interface CoinTableProps {
  coins: Coin[]
  loading?: boolean
}

export function CoinTable({ coins, loading }: CoinTableProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist()

  if (loading) {
    return <CoinTableSkeleton />
  }

  if (coins.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <TrendingUp className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No coins found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Coin</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coins.map((coin) => (
              <TableRow key={coin.id} className="hover:bg-muted/50">
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleWatchlist(coin.id)}>
                    <Star
                      className={`h-4 w-4 ${
                        isInWatchlist(coin.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{coin.market_cap_rank}</TableCell>
                <TableCell>
                  <Link
                    href={`/coin/${coin.id}`}
                    className="flex items-center space-x-3 hover:text-primary transition-colors"
                  >
                    <Image
                      src={coin.image || "/placeholder.svg"}
                      alt={coin.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-sm text-muted-foreground uppercase">{coin.symbol}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(coin.current_price)}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                    className="font-medium"
                  >
                    {coin.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{formatNumber(coin.market_cap)}</TableCell>
                <TableCell className="text-right font-medium">{formatNumber(coin.total_volume)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function CoinTableSkeleton() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Coin</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-6 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

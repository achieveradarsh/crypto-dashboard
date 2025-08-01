const API_KEY = "CG-aUa1z8Cx6bf59S3yXoQ5kcWx"
const BASE_URL = "https://api.coingecko.com/api/v3"

// Add delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi: any
  last_updated: string
}

export interface CoinDetail {
  id: string
  symbol: string
  name: string
  description: {
    en: string
  }
  image: {
    thumb: string
    small: string
    large: string
  }
  market_cap_rank: number
  market_data: {
    current_price: {
      usd: number
    }
    market_cap: {
      usd: number
    }
    total_volume: {
      usd: number
    }
    high_24h: {
      usd: number
    }
    low_24h: {
      usd: number
    }
    price_change_24h: number
    price_change_percentage_24h: number
    circulating_supply: number
    total_supply: number
    max_supply: number
  }
}

export interface ChartData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

const apiRequest = async (endpoint: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Add delay to avoid rate limiting, especially for chart requests
      if (i > 0) await delay(2000 * i)

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "x-cg-demo-api-key": API_KEY,
        },
      })

      if (response.status === 429) {
        // Rate limited, wait longer and retry
        console.log("Rate limited, waiting...")
        await delay(5000)
        continue
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API request attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
      await delay(2000)
    }
  }
}

export const getCoinsMarkets = async (page = 1, perPage = 50): Promise<Coin[]> => {
  // Limit pages to avoid API issues - CoinGecko free tier has limitations
  if (page > 20) {
    throw new Error("Page limit exceeded for free tier")
  }

  return apiRequest(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`,
  )
}

export const getCoinDetail = async (id: string): Promise<CoinDetail> => {
  return apiRequest(`/coins/${id}`)
}

export const getCoinChart = async (id: string, days = "7"): Promise<ChartData> => {
  // Add longer delay for chart requests as they seem to be more rate limited
  await delay(1000)

  // For 24h data, use different interval to avoid issues
  const interval = days === "1" ? "hourly" : days === "7" ? "daily" : "daily"

  try {
    return await apiRequest(`/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`)
  } catch (error) {
    // If 24h fails, try with a slightly different approach
    if (days === "1") {
      console.log("24h chart failed, trying alternative approach...")
      await delay(2000)
      return await apiRequest(`/coins/${id}/market_chart?vs_currency=usd&days=1`)
    }
    throw error
  }
}

export const searchCoins = async (query: string) => {
  return apiRequest(`/search?query=${query}`)
}

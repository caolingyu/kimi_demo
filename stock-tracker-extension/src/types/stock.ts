export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  timestamp: number
  open?: number
  high?: number
  low?: number
  prevClose?: number
  type: 'stock' | 'fund'
  market: 'cn' | 'hk' | 'us'
}

export interface FundData extends StockData {
  netValue: number
  accumulatedValue: number
  dailyReturn: number
}

export interface WatchlistItem {
  symbol: string
  name: string
  type: 'stock' | 'fund'
  market: 'cn' | 'hk' | 'us'
  group: string
  addedAt: number
  alert?: {
    high: number
    low: number
  }
}

export interface SearchResult {
  symbol: string
  name: string
  type: 'stock' | 'fund'
  market: 'cn' | 'hk' | 'us'
  pinyin?: string
}

export interface ApiResponse<T> {
  data: T
  timestamp: number
  error?: string
}

export interface MarketData {
  stocks: StockData[]
  funds: FundData[]
  indices: IndexData[]
}

export interface IndexData {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

export type MarketType = 'cn' | 'hk' | 'us'
export type SecurityType = 'stock' | 'fund'
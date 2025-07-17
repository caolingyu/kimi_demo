import React from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import type { StockData } from '../../types/stock'
import { TrendingUp, TrendingDown, X } from 'lucide-react'
import '../../styles/oil-painting.css'

interface StockCardProps {
  stock: StockData
  onClick?: () => void
  className?: string
  showDeleteButton?: boolean
  onDelete?: () => void
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onClick,
  className,
  showDeleteButton = false,
  onDelete
}) => {
  const changeColor = stock.change >= 0 ? 'oil-price-up' : 'oil-price-down'
  const ChangeIcon = stock.change >= 0 ? TrendingUp : TrendingDown

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const formatChange = (change: number) => {
    return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)
  }

  const formatChangePercent = (percent: number) => {
    return percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`
  }

  return (
    <Card
      className={`stock-card-oil p-4 ${!showDeleteButton ? 'cursor-pointer' : ''} relative mx-2 ${className}`}
      onClick={!showDeleteButton ? onClick : undefined}
    >
      {showDeleteButton && (
        <Button
          variant="ghost"
          size="sm"
          className="oil-delete-button absolute top-2 right-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.()
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold oil-text-primary text-base">{stock.name}</h3>
          <p className="text-sm oil-text-secondary">{stock.symbol} · {stock.market.toUpperCase()}</p>
        </div>
        <div className={`text-right ${showDeleteButton ? 'pr-8' : ''}`}>
          <p className="text-xl font-bold oil-text-primary">¥{formatPrice(stock.price)}</p>
          <div className={`flex items-center justify-end ${changeColor} font-medium`}>
            <ChangeIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">{formatChange(stock.change)} ({formatChangePercent(stock.changePercent)})</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center text-xs oil-text-secondary">
        <span>📊 成交量: {(stock.volume / 10000).toFixed(2)}万</span>
        <span>🕐 {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </Card>
  )
}

export default StockCard
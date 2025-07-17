import React from 'react'
import { X, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import type { StockData } from '../../types/stock'
import '../../styles/oil-painting.css'

interface StockDetailProps {
  stock: StockData
  onClose: () => void
}

const StockDetail: React.FC<StockDetailProps> = ({ stock, onClose }) => {
  const isPositive = stock.change >= 0
  const changeColor = isPositive ? 'oil-price-up' : 'oil-price-down'
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown

  const formatPrice = (price: number) => price.toFixed(2)
  const formatChange = (change: number) => change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)
  const formatPercent = (percent: number) => percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`
  const formatVolume = (volume: number) => {
    if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(2)}亿`
    } else if (volume >= 10000) {
      return `${(volume / 10000).toFixed(2)}万`
    }
    return volume.toString()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 oil-modal-backdrop">
      <div className="oil-modal max-w-md w-full max-h-[90vh] flex flex-col relative">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 rounded-t-3xl bg-gradient-to-br from-white/95 to-blue-50/90 backdrop-blur-sm border-b border-white/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50/30 via-transparent to-yellow-50/30"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold oil-text-primary mb-1">{stock.name}</h2>
              <p className="text-sm oil-text-secondary">{stock.symbol} · {stock.market.toUpperCase()}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="oil-button oil-text-secondary hover:oil-text-primary -mr-2 -mt-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Price Info */}
          <div className="mt-6">
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold oil-text-primary">
                ¥{formatPrice(stock.price)}
              </span>
              <span className="text-sm oil-text-secondary">
                {stock.market === 'cn' ? 'CNY' : 'USD'}
              </span>
            </div>
            <div className={`flex items-center mt-2 ${changeColor} font-semibold`}>
              <ChangeIcon className="w-5 h-5 mr-2" />
              <span className="text-lg">
                {formatChange(stock.change)} ({formatPercent(stock.changePercent)})
              </span>
            </div>
          </div>
        </div>

        {/* Details - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5 bg-gradient-to-b from-white/10 via-blue-50/20 to-pink-50/20 relative min-h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/20 via-transparent to-purple-50/20 pointer-events-none"></div>

          {/* Key Metrics */}
          <Card className="oil-card p-5 bg-white/80 backdrop-blur-md border border-white/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-pink-50/30 pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="font-semibold oil-text-primary mb-4 flex items-center text-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                📊 关键指标
              </h3>
              <div className="grid grid-cols-2 gap-5 text-sm">
                <div className="space-y-1">
                  <span className="oil-text-secondary block">最高价</span>
                  <p className="font-semibold oil-text-primary text-base">¥{formatPrice(stock.high || 0)}</p>
                </div>
                <div className="space-y-1">
                  <span className="oil-text-secondary block">最低价</span>
                  <p className="font-semibold oil-text-primary text-base">¥{formatPrice(stock.low || 0)}</p>
                </div>
                <div className="space-y-1">
                  <span className="oil-text-secondary block">昨收价</span>
                  <p className="font-semibold oil-text-primary text-base">¥{formatPrice(stock.prevClose || 0)}</p>
                </div>
                <div className="space-y-1">
                  <span className="oil-text-secondary block">成交量</span>
                  <p className="font-semibold oil-text-primary text-base">{formatVolume(stock.volume)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Market Info */}
          <Card className="oil-card p-5 bg-white/80 backdrop-blur-md border border-white/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-yellow-50/30 pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="font-semibold oil-text-primary mb-4 flex items-center text-lg">
                <DollarSign className="w-5 h-5 mr-2" />
                💼 市场信息
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="oil-text-secondary">交易市场</span>
                  <span className="font-semibold oil-text-primary">
                    {stock.market === 'cn' ? '🇨🇳 中国A股' :
                     stock.market === 'us' ? '🇺🇸 美国股市' : '🇭🇰 香港股市'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="oil-text-secondary">股票类型</span>
                  <span className="font-semibold oil-text-primary">
                    {stock.type === 'stock' ? '📈 股票' : '📊 基金'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="oil-text-secondary">更新时间</span>
                  <span className="font-semibold oil-text-primary">
                    🕐 {new Date(stock.timestamp).toLocaleTimeString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3 pb-2 relative z-10">
            <Button
              className="oil-button flex-1 bg-white/90 hover:bg-white border border-white/60 backdrop-blur-sm"
              variant="outline"
              onClick={() => {
                // 这里可以添加设置价格提醒的功能
                console.log('Set price alert for', stock.symbol)
              }}
            >
              🔔 价格提醒
            </Button>
            <Button
              className="oil-button flex-1 bg-white/90 hover:bg-white border border-white/60 backdrop-blur-sm"
              variant="outline"
              onClick={() => {
                // 这里可以添加查看更多详情的功能
                const url = stock.market === 'cn'
                  ? `https://finance.sina.com.cn/realstock/company/${stock.symbol}/nc.shtml`
                  : `https://finance.yahoo.com/quote/${stock.symbol}`
                window.open(url, '_blank')
              }}
            >
              🔍 查看详情
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockDetail

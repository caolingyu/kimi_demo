import { StockUpdater } from './stockUpdater'
import { NotificationManager } from './notification'

class BackgroundService {
  private updater: StockUpdater
  private notificationManager: NotificationManager

  constructor() {
    this.updater = new StockUpdater()
    this.notificationManager = new NotificationManager()
  }

  async initialize(): Promise<void> {
    console.log('Background service initialized')
    
    // 设置定时更新
    chrome.alarms.create('updateStocks', { periodInMinutes: 0.5 })
    
    // 监听闹钟
    chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
      if (alarm.name === 'updateStocks') {
        this.handleStockUpdate()
      }
    })

    // 监听扩展安装/更新
    chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
      if (details.reason === 'install') {
        console.log('Extension installed')
      } else if (details.reason === 'update') {
        console.log('Extension updated')
      }
    })

    // 监听存储变化
    chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace === 'sync' && changes.watchlist) {
        this.updater.invalidateCache()
      }
    })
  }

  private async handleStockUpdate(): Promise<void> {
    try {
      const result = await this.updater.updateAll()
      if (result.hasAlerts) {
        await this.notificationManager.showAlerts(result.alerts)
      }
    } catch (error) {
      console.error('Failed to update stocks:', error)
    }
  }
}

const service = new BackgroundService()
service.initialize()

// Service Worker 生命周期管理
chrome.runtime.onStartup.addListener(() => {
  console.log('Service worker started')
})

chrome.runtime.onSuspend.addListener(() => {
  console.log('Service worker suspended')
})
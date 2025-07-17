export class NotificationManager {
  private notificationQueue: Array<{ symbol: string; message: string }> = []
  private isProcessing = false

  async showAlerts(alerts: Array<{ symbol: string; message: string }>): Promise<void> {
    if (!alerts.length) return

    // 添加到队列
    this.notificationQueue.push(...alerts)
    
    // 开始处理队列
    if (!this.isProcessing) {
      await this.processNotificationQueue()
    }
  }

  private async processNotificationQueue(): Promise<void> {
    this.isProcessing = true

    while (this.notificationQueue.length > 0) {
      const alert = this.notificationQueue.shift()
      if (!alert) break

      try {
        await this.createNotification(alert)
        // 延迟处理，避免通知过多
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Failed to show notification:', error)
      }
    }

    this.isProcessing = false
  }

  private async createNotification(alert: { symbol: string; message: string }): Promise<void> {
    const settings = await chrome.storage.sync.get('settings')
    const notificationsEnabled = settings.settings?.notifications?.priceAlert ?? true

    if (!notificationsEnabled) return

    await chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: '股票提醒',
      message: alert.message,
      contextMessage: alert.symbol
    })
  }

  async clearAllNotifications(): Promise<void> {
    const notifications = await chrome.notifications.getAll()
    await Promise.all(
      Object.keys(notifications).map(id => chrome.notifications.clear(id))
    )
  }
}
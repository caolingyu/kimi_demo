/// <reference types="vite/client" />

interface ChromeApi {
  alarms: {
    create(name: string, alarmInfo: { periodInMinutes?: number }): void
    onAlarm: {
      addListener(callback: (alarm: any) => void): void
    }
  }
  runtime: {
    onInstalled: {
      addListener(callback: (details: any) => void): void
    }
    onStartup: {
      addListener(callback: () => void): void
    }
    onSuspend: {
      addListener(callback: () => void): void
    }
    getURL(path: string): string
    sendMessage(message: any): void
    onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: any) => void): void
    }
  }
  storage: {
    sync: {
      get(keys?: string | string[] | { [key: string]: any }): Promise<any>
      set(items: { [key: string]: any }): Promise<void>
    }
    local: {
      get(keys?: string | string[] | { [key: string]: any }): Promise<any>
      set(items: { [key: string]: any }): Promise<void>
    }
    onChanged: {
      addListener(callback: (changes: any, namespace: string) => void): void
    }
  }
  notifications: {
    create(options: any): Promise<string>
    getAll(): Promise<{ [key: string]: any }>
    clear(id: string): Promise<boolean>
  }
  tabs: {
    create(options: { url: string }): Promise<any>
  }
}

declare global {
  const chrome: ChromeApi
}

// 添加 window 扩展
declare global {
  interface Window {
    chrome: ChromeApi
  }
}
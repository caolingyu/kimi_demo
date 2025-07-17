console.log('股票行情追踪器内容脚本已加载')

// 这里可以添加与网页交互的功能
// 例如在网页上显示股票信息或添加右键菜单等

// 示例：添加右键菜单
document.addEventListener('contextmenu', () => {
  const selection = window.getSelection()?.toString().trim()
  if (selection && /^[A-Z0-9]{1,6}$/.test(selection)) {
    // 检查是否是股票代码格式
    chrome.runtime.sendMessage({
      type: 'SEARCH_STOCK',
      symbol: selection
    })
  }
})

// 监听来自后台的消息
chrome.runtime.onMessage.addListener((message: { type: string }, _sender: any, sendResponse: any) => {
  switch (message.type) {
    case 'GET_SELECTED_TEXT':
      const selection = window.getSelection()?.toString().trim()
      sendResponse({ selectedText: selection })
      break
    default:
      break
  }
})
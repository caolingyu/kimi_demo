# 股票行情追踪器 - Chrome扩展

一个现代化的Chrome浏览器扩展，用于实时追踪中美股票和基金行情，支持自选管理。

## 功能特性

✅ **实时行情**
- A股、港股、美股实时数据
- 基金行情追踪
- 30秒自动更新

✅ **自选管理**
- 添加/删除自选股票
- 分组管理
- 搜索股票功能

✅ **现代化UI**
- 基于shadcn/ui + Tailwind CSS v4
- 响应式设计，适配Chrome扩展尺寸
- 深色/浅色主题支持

✅ **智能提醒**
- 价格提醒设置
- 涨跌幅监控
- 成交量异常提醒

## 技术栈

- **前端**: React 18 + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **构建**: Vite
- **状态管理**: React Hooks
- **存储**: Chrome Storage API

## 安装指南

### 开发模式

1. 安装依赖
```bash
npm install
```

2. 构建项目
```bash
npm run build
```

3. 加载扩展到Chrome
- 打开 Chrome → 扩展程序 → 开发者模式
- 点击"加载已解压的扩展程序"
- 选择 `dist` 文件夹

### 使用方法

1. **添加股票**
   - 点击扩展图标打开主界面
   - 点击"添加股票"按钮
   - 搜索股票代码或名称
   - 选择股票并添加到自选列表

2. **查看行情**
   - 主界面显示所有自选股票的实时行情
   - 点击刷新按钮获取最新数据

3. **管理设置**
   - 点击设置图标进入设置页面

## 支持的交易所

- **A股**: 上海证券交易所、深圳证券交易所
- **港股**: 香港联合交易所
- **美股**: 纽约证券交易所、纳斯达克
- **基金**: ETF、LOF、开放式基金

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 项目结构

```
src/
├── popup/          # 主界面
├── options/        # 设置页面
├── background/     # 后台脚本
├── content/        # 内容脚本
├── components/     # UI组件
├── lib/           # 工具库
├── hooks/         # 自定义Hooks
└── types/         # TypeScript类型
```

## 许可证

MIT License
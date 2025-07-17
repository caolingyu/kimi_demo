#!/bin/bash
# 每次构建后复制bot.png到所有图标位置

# 复制到dist根目录
cp bot.png dist/icon16.png
cp bot.png dist/icon48.png
cp bot.png dist/icon128.png

# 复制到dist/icons目录
cp bot.png dist/icons/icon16.png
cp bot.png dist/icons/icon48.png
cp bot.png dist/icons/icon128.png

echo "Icons copied successfully!"
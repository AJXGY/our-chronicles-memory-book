#!/bin/bash

# 🚀 一键部署到 Vercel 脚本

echo "🎯 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null
then
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查环境变量
if [ ! -f .env.local ]; then
    echo "❌ 错误: .env.local 文件不存在"
    echo "请先创建 .env.local 文件并添加 VITE_ZHIPU_API_KEY"
    exit 1
fi

# 构建测试
echo "🔨 正在测试构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功!"
    
    # 部署到 Vercel
    echo "🚀 正在部署到 Vercel..."
    vercel --prod
    
    echo "✨ 部署完成!"
    echo "📝 记得在 Vercel 控制台添加环境变量 VITE_ZHIPU_API_KEY"
else
    echo "❌ 构建失败,请检查错误信息"
    exit 1
fi

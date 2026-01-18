# 快速部署指南

## 🚀 一键部署

每次修改代码后，只需运行：

```bash
./deploy.sh "你的提交信息"
```

或者使用默认提交信息（带时间戳）：

```bash
./deploy.sh
```

## 📝 脚本功能

1. ✅ 自动检查代码变更
2. 📦 添加所有文件到 Git
3. 💾 提交更改到本地仓库
4. 🔄 推送到 GitHub
5. ⏳ Vercel 自动检测并部署

## 🎯 使用示例

```bash
# 示例 1: 自定义提交信息
./deploy.sh "添加新功能：记忆分享"

# 示例 2: 使用默认提交信息
./deploy.sh

# 示例 3: 修复 bug
./deploy.sh "修复：登录页面样式问题"
```

## ⚙️ 工作原理

- **GitHub 集成**：Vercel 已经连接到你的 GitHub 仓库
- **自动部署**：每次推送代码，Vercel 会自动检测并部署
- **无需手动**：不需要运行 `vercel` 命令

## 🔗 部署后访问

- **Vercel 默认域名**：https://our-chronicles-memory-book.vercel.app
- **自定义域名**：https://chlj.site（DNS 配置后）

## 📊 查看部署状态

访问 Vercel Dashboard：
https://vercel.com/ajxgys-projects/our-chronicles-memory-book

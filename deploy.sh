#!/bin/bash

# 自动化部署脚本 - Our Chronicles
# 用法: ./deploy.sh "提交信息"

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取提交信息
COMMIT_MSG="${1:-"Update: $(date +'%Y-%m-%d %H:%M:%S')"}"

echo -e "${BLUE}🚀 开始自动化部署流程...${NC}\n"

# 1. 检查是否有未提交的更改
echo -e "${YELLOW}📝 检查代码变更...${NC}"
if [[ -z $(git status -s) ]]; then
    echo -e "${GREEN}✅ 没有新的变更${NC}"
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ 部署已取消${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✅ 发现代码变更${NC}"
fi

# 2. 添加所有更改到 Git
echo -e "\n${YELLOW}📦 添加文件到 Git...${NC}"
git add .
echo -e "${GREEN}✅ 文件已添加${NC}"

# 3. 提交更改
echo -e "\n${YELLOW}💾 提交更改...${NC}"
echo -e "${BLUE}提交信息: ${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}⚠️  没有新的提交（可能已经提交过了）${NC}"

# 4. 推送到 GitHub
echo -e "\n${YELLOW}🔄 推送到 GitHub...${NC}"
BRANCH=$(git branch --show-current)
echo -e "${BLUE}当前分支: ${BRANCH}${NC}"

git push origin "$BRANCH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 成功推送到 GitHub!${NC}"
else
    echo -e "${RED}❌ 推送失败，请检查网络或权限${NC}"
    exit 1
fi

# 5. 等待 Vercel 自动部署
echo -e "\n${YELLOW}⏳ Vercel 正在自动部署...${NC}"
echo -e "${BLUE}💡 提示: Vercel 会自动检测 GitHub 的推送并开始部署${NC}"
echo -e "${BLUE}📊 你可以在 Vercel Dashboard 查看部署进度:${NC}"
echo -e "${BLUE}   https://vercel.com/ajxgys-projects/our-chronicles-memory-book${NC}"

# 6. 完成
echo -e "\n${GREEN}✨ 部署流程完成！${NC}"
echo -e "${GREEN}🌐 你的网站将在几分钟内更新${NC}"
echo -e "${GREEN}🔗 访问地址:${NC}"
echo -e "${BLUE}   - https://our-chronicles-memory-book.vercel.app${NC}"
echo -e "${BLUE}   - https://chlj.site (如果 DNS 已配置)${NC}"

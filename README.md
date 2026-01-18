# 我们的时光书 📖✨

一个充满爱意的情侣纪念册应用,用 AI 为你们的回忆增添诗意。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![Zhipu AI](https://img.shields.io/badge/Powered%20by-Zhipu%20AI-00A67E)

## ✨ 功能特性

### 📝 时光书

- **回忆卡片**: 记录每一个特殊时刻,包含照片、日期、地点和描述
- **AI 情感旁白**: 使用智谱 AI 为每段回忆生成诗意的文案
- **编辑与删除**: 随时修改或删除回忆
- **PDF 导出**: 一键下载精美的 PDF 纪念册

### 💬 时空对话机

- **智能聊天**: 基于你们的回忆与 AI 对话
- **上下文理解**: AI 了解你们的所有经历,能回答关于回忆的问题
- **温暖语气**: 专为情侣设计的亲密对话体验

### 🎮 回忆问答

- **趣味测试**: AI 根据你们的回忆自动生成问答题
- **记忆挑战**: 测试你对重要时刻的记忆
- **即时反馈**: 答题后立即查看解释

### 🌸 其他功能

- **花墙**: 记录送过的每一朵花
- **零食墙**: 记录一起吃过的美食
- **旅行地图**: 标记去过的城市
- **纪念日倒计时**: 重要日期提醒
- **愿望清单**: 记录想一起做的事
- **数据备份**: 导入/导出所有数据

## 🚀 快速开始

### 前置要求

- **Node.js**: 建议使用 v18 或更高版本
- **智谱 AI API Key**: 从 [智谱 AI 开放平台](https://open.bigmodel.cn/) 获取

### 安装步骤

1. **克隆或下载项目**

   ```bash
   cd our-chronicles---living-memory-book
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置 API Key**

   编辑 `.env.local` 文件,填入你的智谱 AI API Key:

   ```env
   ZHIPU_API_KEY=你的智谱AI密钥
   ```

4. **启动开发服务器**

   ```bash
   npm run dev
   ```

5. **打开浏览器**

   访问 `http://localhost:3000` 即可使用

## 🔑 获取智谱 AI API Key

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册并登录账号
3. 进入控制台,创建 API Key
4. 复制 API Key 并粘贴到 `.env.local` 文件中

> **注意**: 智谱 AI 提供免费额度,足够个人使用。请妥善保管你的 API Key,不要泄露给他人。

## 📖 使用指南

### 添加回忆

1. 点击"新增一页"按钮
2. 填写标题、日期、地点、图片链接和描述
3. 点击"保存"

### 生成 AI 旁白

1. 在回忆卡片上点击"生成情感旁白"
2. AI 会根据回忆内容生成诗意的文案
3. 旁白会自动保存到回忆中

### 与 AI 对话

1. 切换到"时空对话机"页面
2. 输入问题,如"我们去过哪些地方?"
3. AI 会基于你的回忆回答问题

### 回忆问答

1. 点击"回忆问答"按钮
2. AI 会生成一道选择题
3. 选择答案后查看解释

### 数据备份

1. 点击右上角菜单
2. 选择"导出数据"下载 JSON 备份文件
3. 使用"导入数据"恢复备份

## 🛠️ 技术栈

- **前端框架**: React 19.2.3
- **构建工具**: Vite 6.2.0
- **语言**: TypeScript 5.8.2
- **UI 图标**: Lucide React
- **图表**: Recharts
- **AI 服务**: 智谱 AI (glm-4-flash 模型)

## 📁 项目结构

```
our-chronicles---living-memory-book/
├── components/          # React 组件
│   ├── Chatbot.tsx     # 聊天机器人
│   ├── MemoryCard.tsx  # 回忆卡片
│   ├── QuizModal.tsx   # 问答模态框
│   └── ...
├── services/           # 服务层
│   └── zhipuService.ts # 智谱 AI 服务
├── App.tsx            # 主应用组件
├── types.ts           # TypeScript 类型定义
├── constants.ts       # 常量配置
├── index.html         # HTML 入口
├── vite.config.ts     # Vite 配置
├── .env.local         # 环境变量(需自行配置)
└── package.json       # 项目依赖
```

## 🎨 功能页面

| 页面          | 说明                |
| ------------- | ------------------- |
| 📖 时光书     | 主页面,展示所有回忆 |
| 💬 时空对话机 | 与 AI 聊天          |
| 📊 数据看板   | 查看统计数据        |
| 🌸 花墙       | 记录送花历史        |
| 🍿 零食墙     | 记录美食回忆        |
| 🗺️ 旅行地图   | 查看去过的城市      |
| 🎂 纪念日     | 重要日期倒计时      |
| ✅ 愿望清单   | 想一起做的事        |

## 🔒 隐私说明

- 所有数据存储在浏览器本地 (LocalStorage)
- 仅在使用 AI 功能时会将回忆内容发送到智谱 AI 服务器
- 不会上传或存储你的数据到任何第三方服务器
- 建议定期导出数据备份

## 🐛 常见问题

### Q: AI 功能无法使用?

A: 请检查 `.env.local` 文件中的 `ZHIPU_API_KEY` 是否正确配置。

### Q: 如何更换图片?

A: 编辑回忆时,修改"图片链接"字段为新的图片 URL。

### Q: 数据会丢失吗?

A: 数据存储在浏览器本地,清除浏览器数据会导致丢失。建议定期导出备份。

### Q: 可以在手机上使用吗?

A: 可以!应用采用响应式设计,支持手机和平板访问。

## 📝 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License

## 💝 致谢

- 感谢 [智谱 AI](https://open.bigmodel.cn/) 提供强大的 AI 能力
- 感谢所有开源项目的贡献者

---

**用心记录,用 AI 诗意表达。愿你们的每一个回忆都闪闪发光。✨**

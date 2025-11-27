# 走啦旅行网站

## 项目简介
走啦旅行是一个专注于旅行资讯、签证攻略和在线填单的网站平台。

## 技术特点
- 纯静态网站，无需复杂的前端框架
- 使用原生JavaScript实现交互功能
- 支持中英文翻译
- 支持PDF生成和下载
- 支持表单数据本地保存和加载

## 安装依赖
确保您已安装Node.js环境，然后执行以下命令安装依赖：

```bash
npm install
```

## 启动开发服务器

```bash
npm run dev
```

或

```bash
npm start
```

服务器将在 http://localhost:8080 启动，您可以在浏览器中访问该地址查看网站。

## 部署方案

### 方案一：使用Nginx部署（推荐）
1. 安装Nginx服务器
2. 将网站文件复制到Nginx的web根目录（通常是 `/usr/share/nginx/html`）
3. 配置Nginx虚拟主机，设置域名和SSL证书
4. 重启Nginx服务

### 方案二：使用任何静态文件服务器
由于这是一个纯静态网站，您可以使用任何静态文件服务器部署，如Apache、Caddy等。

### 方案三：使用GitHub Pages或类似服务
您也可以将网站部署到GitHub Pages、Netlify、Vercel等托管服务上，这些服务都提供免费的静态网站托管。

## 项目结构
- `index.html` - 主页面文件
- `css/` - 样式文件目录
- `js/` - JavaScript文件目录
  - `app.js` - 主应用逻辑
  - `auth.js` - 认证相关功能
  - `translation.js` - 翻译服务
  - `pdfGenerator.js` - PDF生成功能
- `images/` - 图片资源目录

## 公众号嵌入说明
如需将页面嵌入微信公众号，建议：
1. 使用iframe方式嵌入网站页面
2. 确保网站已经配置了SSL证书（https）
3. 根据微信公众号的安全策略，可能需要进行域名白名单配置
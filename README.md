# TJAD 数字化课程 · 通过 LLM-Wiki 搭建个人知识库

静态展示页，用于面向学员展示课程内容。基于 Karpathy 的 LLM-Wiki 方法论。

- **形态**：单页长卷轴（三章节：技术理论 / 技术实操 / 课程总结）
- **素材**：24 张 PPT 单页（P01~P24）+ 1 张总览图 + 课程大纲
- **风格**：手绘黑板风深色主题，呼应 PPT 视觉
- **交互**：图片点击放大（灯箱，支持键盘/触屏翻页）、章节锚导航、移动端响应式
- **优化**：WebP 缩略图（列表用）+ 高清原图（点击查看），首屏 ~2MB

---

## 目录结构

```
网站/
├── index.html              # 主页面（单页）
├── styles.css              # 样式（黑板风深色主题）
├── app.js                  # 交互（灯箱 + 导航高亮）
├── optimize-images.mjs     # 图片优化脚本（一次性，仅本地用）
├── package.json            # 仅 sharp 一个依赖
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── thumb/          # WebP 缩略图（1.9 MB，网页加载用）
│       └── full/           # 高清 PNG 原图（74 MB，灯箱放大用）
├── Dockerfile              # nginx:alpine 静态托管
├── nginx.conf              # gzip + 缓存 + WebP MIME
└── .dockerignore
```

---

## 本地预览

直接用浏览器打开 `index.html` 即可。但为了让相对路径、字体等正确加载，推荐起一个本地静态服务器：

```bash
# 方式一：Python（无需安装依赖）
python -m http.server 8080
# 然后访问 http://localhost:8080

# 方式二：Node（如已装 npx）
npx serve .
```

---

## 更新图片（如后续替换 PPT）

若 25 张图片有更新，把新 PNG 覆盖到 `public/images/full/`，然后重新生成缩略图：

```bash
cd 网站
npm install            # 首次需安装 sharp
node optimize-images.mjs
```

脚本会读取 `public/images/full/` 下所有 PNG，生成同名 `.webp` 到 `public/images/thumb/`（宽 800px，质量 82）。

> ⚠️ 如果新增了图片且文件名不在 `index.html` 里，需要手动在对应 `<figure>` 处补充引用。

---

## 部署方式（VPS + Docker）

### 方式 A：直接 Docker 命令（推荐先验证）

把整个 `网站/` 目录上传到 VPS（如 `/opt/tjad-course/`），然后在服务器上：

```bash
cd /opt/tjad-course

# 构建镜像
docker build -t tjad-llm-wiki-course:latest .

# 运行容器（映射到 8080 端口，按需修改）
docker run -d \
  --name tjad-course \
  --restart unless-stopped \
  -p 8080:80 \
  tjad-llm-wiki-course:latest
```

访问 `http://你的服务器IP:8080` 即可。

### 方式 B：1Panel 部署

1Panel（[1panel.cn](https://1panel.cn)）是国内常用的服务器运维面板，部署步骤：

1. **上传文件**：用 1Panel 的「文件」功能，把整个 `网站/` 目录上传到 `/opt/tjad-course/`。

2. **方式 B1 - 用「容器 → 编排」**：
   - 进入「容器 → 编排」，新建编排，目录选 `/opt/tjad-course`。
   - 1Panel 会读取 `Dockerfile`，点击创建并启动。
   - 在编排详情里可以映射端口（默认 80，建议改 8080 避免冲突）。

3. **方式 B2 - 用「网站 → 创建网站」**（更省事，不走 Docker）：
   - 进入「网站 → 创建网站 → 静态网站」。
   - 主目录指向 `/opt/tjad-course`（即含 `index.html` 的目录）。
   - 绑定你的域名，1Panel 会自动配好 Nginx + SSL 证书（Let's Encrypt）。
   - 这种方式不用 Docker，1Panel 自带的 OpenResty 直接托管静态文件，性能更好。

4. **绑定域名 + HTTPS**：
   - 在网站设置里「域名」一栏填入你的域名（需已在 DNS 解析到该 VPS）。
   - 「HTTPS」一栏申请 Let's Encrypt 免费证书，1Panel 一键申请并自动续期。

### 方式 C：Cloudflare Pages（备选，免费）

如果以后想换 Cloudflare：

1. 把 `网站/` 目录推到 GitHub 仓库。
2. Cloudflare Pages → 创建项目 → 连接该仓库。
3. 构建命令留空，输出目录填 `.`（或仓库根目录）。
4. 部署后自动获得 `xxx.pages.dev` 域名，可绑定自定义域名。

---

## 端口与防火墙提醒

- Docker 方式默认占用 **8080**（可在 `docker run` 的 `-p` 参数调整）。
- VPS 安全组 / 防火墙需放行对应端口（如阿里云、腾讯云控制台的安全组规则）。
- 用 1Panel 静态网站 + 域名方式则走 80/443，无需额外开端口。

---

## 技术栈

- 原生 HTML / CSS / JS（无框架、无构建步骤）
- 图片优化：[sharp](https://sharp.pixelplumbing.com/)
- 部署：nginx:alpine Docker 镜像

页面轻量、加载快、维护简单，后续更新图片或文字都很方便。

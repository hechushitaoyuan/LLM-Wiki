# VPS 部署交接单 · LLM-Wiki 课程展示网页

> **给接手的 AI 会话**：请先完整读本文件。这是一个已在本地开发完成、准备部署到 VPS 的纯静态网站项目。你的任务是把它用 Docker 跑起来，让用户能通过公网 IP + 端口访问。

---

## 一、项目是什么

一个**面向学员的课程展示静态网页**，展示一门叫《通过 LLM-Wiki 搭建个人知识库》的课程。

- **技术栈**：原生 HTML / CSS / JS（无框架、无构建步骤）
- **托管**：nginx（通过 Docker 运行）
- **所属**：同济大学建筑设计研究院（集团）有限公司 · 数字化与人工智能课程
- **当前状态**：开发完成，版式已迭代多轮并经用户确认基本满意，**可直接部署**

---

## 二、文件清单（已随本交接单一起传到 VPS）

部署目录：`/opt/wiki/`（用户已创建）

```
/opt/wiki/
├── index.html              # 主页面（单页，含 24 张课程卡片 + Hero + 页脚）
├── styles.css              # 样式（深色黑板风，16:9 卡片画幅）
├── app.js                  # 交互（图片灯箱：点击放大、键盘/触屏翻页）
├── Dockerfile              # nginx:stable-alpine 静态托管镜像
├── nginx.conf              # nginx 配置（gzip + 缓存 + 单页回退）
├── .dockerignore
├── README.md               # 通用说明（含部署指引，可与本文件互补）
├── HANDOVER.md             # 开发历史交接单（背景参考，部署时可忽略）
├── DEPLOY.md               # ← 本文件
└── public/
    └── images/
        ├── logo.png        # TJAD 集团 logo（也用作 favicon）
        ├── thumb/          # 25 张 WebP 缩略图（约 2MB，页面默认加载）
        └── full/           # 25 张高清 PNG 原图（约 75MB，灯箱放大用）
```

**不需要部署的文件**（若存在可忽略）：
- `node_modules/`、`package.json`、`package-lock.json`、`optimize-images.mjs` —— 这些是本地用来生成缩略图的，图片已生成完毕，VPS 部署用不上。

---

## 三、部署方式（二选一）

### 方式 A：纯 Docker 命令（推荐，最直接）

在 VPS 上执行：

```bash
cd /opt/wiki

# 1. 构建镜像
docker build -t llm-wiki-course .

# 2. 运行容器（映射到 8080 端口，可按需改）
docker run -d \
  --name llm-wiki \
  --restart unless-stopped \
  -p 8080:80 \
  llm-wiki-course

# 3. 验证容器在跑
docker ps | grep llm-wiki

# 4. 本机自测
curl -I http://127.0.0.1:8080/
# 应返回 200
```

访问：`http://<你的VPS公网IP>:8080`

### 方式 B：用 1Panel（如果 VPS 装了 1Panel 面板）

1. 进入 **1Panel → 容器 → 编排（Compose）**，新建编排。
2. 在 `/opt/wiki/` 目录下创建一个 `docker-compose.yml`（见下方），或直接让 1Panel 读取。
3. 1Panel 里点"创建并启动"。

`docker-compose.yml` 内容（可让 AI 帮你生成到 `/opt/wiki/docker-compose.yml`）：

```yaml
services:
  llm-wiki:
    build: .
    container_name: llm-wiki
    restart: unless-stopped
    ports:
      - "8080:80"
```

然后 `docker compose up -d --build`。

> 💡 1Panel 也可用「网站 → 创建网站 → 反向代理」把 8080 代理到域名 + 自动 HTTPS，更正式。

---

## 四、⚠ 必须检查的三件事（否则公网访问不了）

容器跑起来后，如果公网 IP:8080 打不开，**99% 是这三处之一**：

### 1. 云厂商安全组（最常见）
阿里云/腾讯云/华为云等，需要在控制台 → 实例 → **安全组规则** → 入方向，放行 **TCP 8080** 端口。这是最容易漏的一步。

### 2. VPS 系统防火墙
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 8080/tcp
sudo ufw status

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# 如果用 iptables
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
```

### 3. 端口是否被占用
```bash
ss -tlnp | grep 8080    # 或 netstat -tlnp | grep 8080
```
若已被占用，换个端口（比如 8888），同步改 `docker run -p` 的前半部分。

---

## 五、常用运维命令

```bash
# 查看日志（排错用）
docker logs llm-wiki

# 重启容器
docker restart llm-wiki

# 停止并删除
docker stop llm-wiki && docker rm llm-wiki

# 更新代码后重新构建（改了文件才需要）
cd /opt/wiki
docker stop llm-wiki && docker rm llm-wiki
docker build -t llm-wiki-course . --no-cache
docker run -d --name llm-wiki --restart unless-stopped -p 8080:80 llm-wiki-course
```

---

## 六、项目背景（供理解，非必需）

- 网页展示 24 张课程 PPT 单页（P01~P24），主题是「通过 LLM-Wiki 搭建个人知识库」（Karpathy 的方法论）。
- PPT 是**竖版**（2:3 比例），卡片图片区做成 **16:9 横幅**，竖版 PPT 用 `object-fit: contain` 居中完整显示。
- 配色：深色黑板风（背景 #161821），暖橙强调色（#f0a040），呼应 PPT 手绘风格。
- 结构：Hero 区（品牌+总览图）→ 8 个内容小节（弱分割线分隔）→ 页脚。每节含若干「图上文下」卡片。

**注意**：`HANDOVER.md` 记录了开发历史和踩过的坑（如 PPT 是竖版、文案不能照抄 MD 提示词等），如需深度修改可参考。

---

## 七、接手后的首要任务

1. 确认 `/opt/wiki/` 下文件齐全（至少要有 `index.html`、`styles.css`、`app.js`、`Dockerfile`、`nginx.conf`、`public/images/`）。
2. 按本文件「方式 A」执行 Docker 部署。
3. 本机 `curl` 验证 200。
4. 提醒用户检查**云安全组**和**防火墙**放行 8080。
5. 让用户用公网 IP:8080 实际访问验证。
6. 若一切正常，任务完成。若用户要绑域名 + HTTPS，参考方式 B 末尾或用 1Panel 反代。

祝部署顺利。

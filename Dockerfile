# ==========================================================================
# LLM-Wiki 课程展示网页 · 静态站点 Docker 镜像
# 纯静态（HTML/CSS/JS/图片），无构建步骤，用 nginx:alpine 托管
# ==========================================================================

FROM nginx:stable-alpine

# 镜像元信息（便于在 DockerHub / docker images 里识别）
LABEL org.opencontainers.image.title="LLM-Wiki Course Website" \
      org.opencontainers.image.description="数字化与人工智能课程：通过 LLM-Wiki 搭建个人知识库" \
      org.opencontainers.image.source="https://github.com/hechushitaoyuan/LLM-Wiki"

# 清空 nginx 默认站点内容
RUN rm -rf /usr/share/nginx/html/*

# 拷贝静态站点文件（构建上下文需为仓库根目录）
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js     /usr/share/nginx/html/
COPY public     /usr/share/nginx/html/public

# 自定义 nginx 配置：gzip + 静态资源长缓存 + 单页回退 + WebP MIME
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

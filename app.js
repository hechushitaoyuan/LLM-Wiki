/**
 * 数字化与人工智能课程网页交互
 * - 图片灯箱（点击放大，键盘/按钮/触摸翻页）
 * 无顶栏导航、无汉堡菜单。
 */
(function () {
  'use strict';

  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');

  /* 收集所有可放大的图片（按文档顺序） */
  const slides = Array.from(document.querySelectorAll('.slide[data-full]'));
  let currentIndex = -1;

  /* ---------- 灯箱 ---------- */
  function openLightbox(index) {
    currentIndex = index;
    const el = slides[index];
    const full = el.getAttribute('data-full');
    // 说明文字：优先用「页码 + 卡片标题」，否则回退到 figcaption
    const card   = el.closest('.card');
    const no     = el.querySelector('.slide-no');
    const h3     = card ? card.querySelector('.card-body h3') : null;
    const figcap = el.querySelector('figcaption');
    let caption = '';
    if (no && h3)    caption = no.textContent + ' · ' + h3.textContent;
    else if (figcap) caption = figcap.textContent;
    lbImg.src = full;
    lbImg.alt = caption;
    lbCaption.textContent = caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  function showImage(delta) {
    if (currentIndex < 0) return;
    const next = (currentIndex + delta + slides.length) % slides.length;
    openLightbox(next);
  }

  // 给每张图绑定点击/键盘事件
  slides.forEach((el, i) => {
    el.addEventListener('click', () => openLightbox(i));
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev .addEventListener('click', () => showImage(-1));
  lbNext .addEventListener('click', () => showImage(1));

  // 点击遮罩关闭（点图片本身不关）
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // 键盘
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showImage(-1);
    if (e.key === 'ArrowRight') showImage(1);
  });

  // 触摸滑动（移动端翻页）
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) showImage(dx > 0 ? -1 : 1);
  }, { passive: true });

})();

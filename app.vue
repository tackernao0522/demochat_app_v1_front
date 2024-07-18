<template>
  <NuxtPage />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 既存のviewport metaタグを削除（もしあれば）
  const existingMetaTag = document.querySelector('meta[name="viewport"]')
  if (existingMetaTag) {
    existingMetaTag.remove()
  }

  // 新しいviewport metaタグを追加
  const metaTag = document.createElement('meta')
  metaTag.name = 'viewport'
  metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
  document.head.appendChild(metaTag)

  // ズームを防止する関数
  const preventZoom = (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }

  // タッチ操作でのズーム防止
  document.addEventListener('touchmove', preventZoom, { passive: false })
  document.addEventListener('touchstart', preventZoom, { passive: false })

  // ダブルタップによるズームを防止
  let lastTapTime = 0
  document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTapTime
    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault()
    }
    lastTapTime = currentTime
  }, { passive: false })

  // PCでのズームを防止
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault()
    }
  }, { passive: false })

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
      e.preventDefault()
    }
  })

  // 向き変更の監視と強制縦向き表示
  const handleOrientationChange = () => {
    if (window.orientation === 90 || window.orientation === -90) {
      document.body.style.transform = "rotate(90deg)";
      document.body.style.transformOrigin = "left top";
      document.body.style.width = "100vh";
      document.body.style.height = "100vw";
      document.body.style.overflowX = "hidden";
      document.body.style.position = "absolute";
      document.body.style.top = "100%";
      document.body.style.left = "0";
    } else {
      document.body.style.transform = "rotate(0deg)";
      document.body.style.transformOrigin = "initial";
      document.body.style.width = "initial";
      document.body.style.height = "initial";
      document.body.style.overflowX = "initial";
      document.body.style.position = "initial";
      document.body.style.top = "initial";
      document.body.style.left = "initial";
    }
  }

  // 初期チェック
  handleOrientationChange();

  window.addEventListener("orientationchange", handleOrientationChange);
})
</script>

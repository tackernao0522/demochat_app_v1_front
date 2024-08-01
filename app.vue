<template>
  <NuxtPage />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

// ズームを防止する関数
const preventZoom = (e) => {
  if (e.touches && e.touches.length > 1) {
    e.preventDefault()
  }
}

// PCでのズームを防止する関数
const preventWheelZoom = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.deltaY !== 0) {
    e.preventDefault()
  }
}

// キーボードでのズームを防止する関数
const preventKeyboardZoom = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
    e.preventDefault()
  }
}

// ダブルタップによるズームを防止する関数
let lastTapTime = 0
const preventDoubleTapZoom = (e) => {
  const currentTime = new Date().getTime()
  const tapLength = currentTime - lastTapTime
  if (tapLength < 500 && tapLength > 0) {
    e.preventDefault()
  }
  lastTapTime = currentTime
}

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

  // イベントリスナーを追加
  document.addEventListener('touchmove', preventZoom, { passive: false })
  document.addEventListener('touchstart', preventZoom, { passive: false })
  document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })
  document.addEventListener('wheel', preventWheelZoom, { passive: false })
  document.addEventListener('keydown', preventKeyboardZoom)
})

onUnmounted(() => {
  // イベントリスナーを削除
  document.removeEventListener('touchmove', preventZoom)
  document.removeEventListener('touchstart', preventZoom)
  document.removeEventListener('touchend', preventDoubleTapZoom)
  document.removeEventListener('wheel', preventWheelZoom)
  document.removeEventListener('keydown', preventKeyboardZoom)
})
</script>

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

  // PCでのズームを防止する関数
  const preventZoom = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
    }
  }

  // キーボードイベントでのズーム防止
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
      e.preventDefault()
    }
  })

  // マウスホイールでのズーム防止
  document.addEventListener('wheel', preventZoom, { passive: false })
})
</script>

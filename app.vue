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

  // metaタグでズームを無効にする
  const metaTag = document.createElement('meta')
  metaTag.name = 'viewport'
  metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
  document.head.appendChild(metaTag)

  // CSSでズームを無効にする
  const style = document.createElement('style')
  style.innerHTML = `
    body {
      touch-action: none;
    }
  `
  document.head.appendChild(style)

  // JavaScriptでズームを無効にする
  const preventZoom = (event) => {
    // Shift + Enter での改行を許可する
    if (event.shiftKey && event.key === 'Enter') {
      return
    }

    if (event.ctrlKey || event.metaKey || event.key === 'Control' || event.key === 'Meta') {
      event.preventDefault()
    }
  }

  const preventWheelZoom = (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
    }
  }

  document.addEventListener('wheel', preventWheelZoom, { passive: false })
  document.addEventListener('keydown', preventZoom, { passive: false })
})
</script>

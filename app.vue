<template>
  <NuxtPage />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const existingMetaTag = document.querySelector('meta[name="viewport"]')
  if (existingMetaTag) {
    existingMetaTag.remove()
  }

  const metaTag = document.createElement('meta')
  metaTag.name = 'viewport'
  metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
  document.head.appendChild(metaTag)

  const preventZoom = (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }

  document.addEventListener('touchmove', preventZoom, { passive: false })
  document.addEventListener('touchstart', preventZoom, { passive: false })

  let lastTapTime = 0
  document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTapTime
    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault()
    }
    lastTapTime = currentTime
  }, { passive: false })

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

  const handleOrientationChange = () => {
    const bodyClassList = document.body.classList;
    console.log('Orientation changed:', window.orientation);
    if (window.orientation === 90 || window.orientation === -90) {
      console.log('Switching to landscape mode');
      bodyClassList.remove('portrait-body');
      bodyClassList.add('landscape-body');
    } else {
      console.log('Switching to portrait mode');
      bodyClassList.remove('landscape-body');
      bodyClassList.add('portrait-body');
    }
  }

  handleOrientationChange();
  window.addEventListener("orientationchange", handleOrientationChange);
})
</script>

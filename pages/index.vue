<template>
  <div>
    <button type="button" name="button" @click="getMsg">
      RailsからAPIを取得する
    </button>
    <div v-for="(msg, i) in msgs" :key="i">
      {{ msg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'

const msgs = ref<string[]>([])
const { $axios } = useNuxtApp()

const getMsg = async () => {
  try {
    const res = await $axios.get('/api/v1/hello')
    msgs.value.push(res.data)
  } catch (error) {
    console.error(error)
  }
}
</script>

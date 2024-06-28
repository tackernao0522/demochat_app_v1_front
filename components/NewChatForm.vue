<template>
    <form @submit.prevent="sendMessage" class="new-chat-form">
        <textarea placeholder="メッセージを入力してEnterを押してください" v-model="message" @keyup.enter="sendMessage"
            class="new-chat-textarea"></textarea>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')

const sendMessage = () => {
    if (message.value.trim() === '') return
    // メッセージ送信処理をここに追加します
    console.log('メッセージ送信:', message.value)
    message.value = ''
}
</script>

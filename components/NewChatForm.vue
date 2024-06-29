<template>
    <form @submit.prevent="sendMessage" class="new-chat-form">
        <textarea placeholder="メッセージを入力してEnterを押してください" v-model="message" @keydown="onKeyDown"
            @compositionstart="onCompositionStart" @compositionend="onCompositionEnd"
            class="new-chat-textarea"></textarea>
    </form>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

const message = ref('')
const isComposing = ref(false)
const emit = defineEmits(['newMessage'])

const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing.value) {
        event.preventDefault()
        sendMessage()
    }
}

const onCompositionStart = () => {
    isComposing.value = true
}

const onCompositionEnd = () => {
    isComposing.value = false
}

const sendMessage = () => {
    if (message.value.trim() === '') return
    console.log('送信するメッセージ:', message.value)
    emit('newMessage', message.value)
    message.value = ''
}
</script>

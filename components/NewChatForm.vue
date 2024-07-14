<template>
    <form @submit.prevent="sendMessage" class="new-chat-form">
        <div class="relative flex items-center">
            <textarea ref="textareaRef" v-model="message" placeholder="メッセージを入力してください" @input="adjustTextareaHeight"
                class="new-chat-textarea" :rows="1"></textarea>
            <button type="submit" class="send-button" :class="{ 'opacity-50 cursor-not-allowed': !message.trim() }"
                :disabled="!message.trim()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            </button>
        </div>
    </form>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'

const message = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const emit = defineEmits(['newMessage'])

const sendMessage = () => {
    if (message.value.trim() === '') return
    emit('newMessage', message.value)
    message.value = ''
    adjustTextareaHeight()
}

const adjustTextareaHeight = () => {
    if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
        textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
    }
}

onMounted(() => {
    adjustTextareaHeight()
})
</script>

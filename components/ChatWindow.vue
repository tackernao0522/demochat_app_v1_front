<template>
    <div class="chat-window" ref="chatContainer">
        <div v-if="props.messages.length" class="messages" ref="messageList">
            <div v-for="(message, index) in props.messages" :key="index"
                :class="['message-wrapper', messageClass(message)]">
                <div class="message-inner">
                    <span class="name">{{ message.name }}</span>
                    <div class="message-content-wrapper">
                        <span class="message-content">{{ message.content || message.message || '(空のメッセージ)' }}</span>
                    </div>
                    <span class="created-at">{{ formatDate(message.created_at) }}</span>
                </div>
            </div>
        </div>
        <div v-else class="text-gray-500">メッセージがありません。</div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUpdated } from 'vue'

const props = defineProps({
    messages: {
        type: Array,
        required: true
    }
})

const chatContainer = ref(null)
const messageList = ref(null)

const messageClass = (message) => {
    return message.sent_by_current_user ? 'sent' : 'received'
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP')
}

const scrollToBottom = () => {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

watch(() => props.messages, async (newMessages) => {
    console.log('Messages in ChatWindow:', newMessages)
    await nextTick()
    scrollToBottom()
}, { deep: true })

onMounted(() => {
    scrollToBottom()
})

onUpdated(() => {
    scrollToBottom()
})
</script>

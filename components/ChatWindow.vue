<template>
    <div class="chat-window p-4 sm:p-6 bg-white border-b border-gray-300">
        <div v-if="messages.length" class="messages overflow-y-auto mb-4 max-h-96">
            <ul>
                <li v-for="message in messages" :key="message.id" :class="messageClass(message)">
                    <span class="name">{{ message.name }}</span>
                    <div class="message-content-wrapper">
                        <span class="message-content">{{ message.content }}</span>
                    </div>
                    <span class="created-at">{{ message.created_at }}</span>
                </li>
            </ul>
        </div>
        <div v-else class="text-gray-500">メッセージがありません。</div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    messages: {
        type: Array,
        required: true
    }
})

const messageClass = (message) => {
    return message.sent_by_current_user ? 'sent' : 'received'
}
</script>

<template>
    <div v-if="message" :class="`mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`">
        {{ message }}
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    message: String,
    isError: Boolean
})
</script>

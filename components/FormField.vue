<template>
    <div>
        <input :type="type" :placeholder="placeholder" :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            class="block w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base" />
    </div>
</template>

<script setup lang="ts">
defineProps({
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    }
})

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <span class="modal-close" @click="$emit('close')">&times;</span>
            <h2 class="form-title">ログイン</h2>
            <form @submit.prevent="handleLogin" class="form-layout">
                <FormField type="email" placeholder="メールアドレス" v-model="email" />
                <div class="relative">
                    <FormField :type="passwordFieldType" placeholder="パスワード" v-model="password" />
                    <font-awesome-icon :icon="passwordVisible ? 'eye-slash' : 'eye'"
                        class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        @click="togglePasswordVisibility" />
                </div>
                <button class="btn-red" :disabled="isLoading">
                    {{ isLoading ? 'ログイン中...' : 'ログインする' }}
                </button>
            </form>
            <MessageDisplay :message="errorMessage" :isError="true" />
            <MessageDisplay :message="successMessage" :isError="false" data-testid="success-message" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import FormField from './FormField.vue'
import MessageDisplay from './MessageDisplay.vue'

const email = ref('')
const password = ref('')

const passwordVisible = ref(false)
const passwordFieldType = computed(() => (passwordVisible.value ? 'text' : 'password'))

const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value
}

const { login, errorMessage, successMessage, isLoading } = useAuth()

const handleLogin = () => {
    if (email.value && password.value) {
        login(email.value, password.value)
    } else {
        errorMessage.value = 'メールアドレスとパスワードを入力してください。'
    }
}

defineEmits(['close'])
</script>

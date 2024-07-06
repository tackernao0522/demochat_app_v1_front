<template>
    <div class="form-container">
        <h2 class="form-title">ログイン</h2>
        <form @submit.prevent="handleLogin" class="form-layout">
            <FormField type="email" placeholder="メールアドレス" v-model="email" />
            <FormField type="password" placeholder="パスワード" v-model="password" />
            <button class="btn-primary" :disabled="isLoading">
                {{ isLoading ? 'ログイン中...' : 'ログインする' }}
            </button>
        </form>
        <MessageDisplay :message="errorMessage" :isError="true" />
        <MessageDisplay :message="successMessage" :isError="false" data-testid="success-message" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import FormField from './FormField.vue'
import MessageDisplay from './MessageDisplay.vue'

const email = ref('')
const password = ref('')

const { login, errorMessage, successMessage, isLoading } = useAuth()

const handleLogin = () => {
    if (email.value && password.value) {
        login(email.value, password.value)
    } else {
        errorMessage.value = 'メールアドレスとパスワードを入力してください。'
    }
}
</script>

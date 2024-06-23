<template>
    <div class="form-container">
        <h2 class="form-title">ログイン</h2>
        <form @submit.prevent="login" class="form-layout">
            <FormField type="email" placeholder="メールアドレス" v-model="email" />
            <FormField type="password" placeholder="パスワード" v-model="password" />
            <button class="btn-primary">
                ログインする
            </button>
        </form>
        <MessageDisplay :message="errorMessage" :isError="true" />
        <MessageDisplay :message="successMessage" :isError="false" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useRedirect } from '../composables/useRedirect'
import FormField from './FormField.vue'
import MessageDisplay from './MessageDisplay.vue'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const { $axios } = useNuxtApp()
const { redirectToChatroom } = useRedirect()

const login = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!email.value || !password.value) {
        errorMessage.value = 'メールアドレスとパスワードを入力してください。'
        return
    }

    try {
        const response = await $axios.post('/auth/sign_in', {
            email: email.value,
            password: password.value
        })
        console.log('Login successful:', response.data)
        successMessage.value = 'ログインに成功しました！'
        email.value = ''
        password.value = ''
        redirectToChatroom()
    } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
            errorMessage.value = error.response.data.errors.join(', ')
        } else {
            errorMessage.value = 'ログイン中にエラーが発生しました。'
        }
        console.error('メールアドレスかパスワードが違います。')
    }
}
</script>

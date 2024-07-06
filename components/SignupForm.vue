<template>
    <div class="form-container">
        <h2 class="form-title">アカウントを登録</h2>
        <form @submit.prevent="signup" class="form-layout">
            <FormField type="text" placeholder="名前" v-model="name" />
            <FormField type="email" placeholder="メールアドレス" v-model="email" />
            <FormField type="password" placeholder="パスワード" v-model="password" />
            <FormField type="password" placeholder="パスワード(確認用)" v-model="passwordConfirmation" />
            <button class="btn-primary">登録する</button>
        </form>
        <MessageDisplay :message="successMessage" :isError="false" />
        <MessageDisplay :message="errorMessage" :isError="true" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useRedirect } from '../composables/useRedirect'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import FormField from './FormField.vue'
import MessageDisplay from './MessageDisplay.vue'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const { $axios } = useNuxtApp()
const { redirectToChatroom } = useRedirect()
const { saveAuthData } = useCookiesAuth()

const validateForm = () => {
    if (!name.value || !email.value || !password.value) {
        errorMessage.value = '名前、メールアドレス、パスワードを入力してください。'
        return false
    }

    if (password.value !== passwordConfirmation.value) {
        errorMessage.value = 'パスワードと確認用パスワードが一致しません。'
        return false
    }

    return true
}

const handleSignupError = (error: any) => {
    if (error.response && error.response.data && error.response.data.errors) {
        errorMessage.value = error.response.data.errors.join(', ')
    } else {
        errorMessage.value = 'アカウントを登録できませんでした。'
    }
    console.error('Signup failed:', error)
}

const resetForm = () => {
    name.value = ''
    email.value = ''
    password.value = ''
    passwordConfirmation.value = ''
}

const signup = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!validateForm()) return

    try {
        const response = await $axios.post('/auth', {
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value
        })

        saveAuthData(response.headers, response.data.data)

        resetForm()
        redirectToChatroom()
    } catch (error) {
        handleSignupError(error)
    }
}
</script>

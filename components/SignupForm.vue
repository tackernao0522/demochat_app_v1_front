<template>
    <div class="w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto text-center">
        <h2 class="text-xl font-bold mb-4">アカウントを登録</h2>
        <form @submit.prevent="signup" class="space-y-4">
            <FormField type="text" placeholder="名前" v-model="name" />
            <FormField type="email" placeholder="メールアドレス" v-model="email" />
            <FormField type="password" placeholder="パスワード" v-model="password" />
            <FormField type="password" placeholder="パスワード(確認用)" v-model="passwordConfirmation" />
            <button
                class="bg-bodyBg text-white font-bold border-0 rounded px-5 py-2 cursor-pointer hover:bg-opacity-90 transition">
                登録する
            </button>
        </form>
        <div v-if="successMessage" class="text-green-500 mt-4">{{ successMessage }}</div>
        <div v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useRedirect } from '../composables/useRedirect.ts'
import FormField from './FormField.vue'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const { $axios } = useNuxtApp()
const { redirectToChatroom } = useRedirect()

const signup = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!name.value || !email.value || !password.value) {
        errorMessage.value = '名前、メールアドレス、パスワードを入力してください。'
        return
    }

    if (password.value !== passwordConfirmation.value) {
        errorMessage.value = 'パスワードと確認用パスワードが一致しません。'
        return
    }

    try {
        const response = await $axios.post('/auth', {
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value
        })
        successMessage.value = 'アカウントが登録されました。'
        errorMessage.value = ''
        console.log(response.data)
        name.value = ''
        email.value = ''
        password.value = ''
        passwordConfirmation.value = ''
        redirectToChatroom()
    } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
            errorMessage.value = 'アカウントを登録できませんでした。'
        } else {
            errorMessage.value = 'アカウントを登録できませんでした。'
        }
        console.error('Signup failed:', error)
    }
}
</script>

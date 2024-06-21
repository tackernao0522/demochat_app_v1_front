<template>
    <div class="w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto text-center">
        <h2 class="text-xl font-bold mb-4">ログイン</h2>
        <form @submit.prevent="login" class="space-y-4">
            <input type="email" required placeholder="メールアドレス" v-model="email"
                class="block w-full p-2 border border-gray-300 rounded" />
            <input type="password" required placeholder="パスワード" v-model="password"
                class="block w-full p-2 border border-gray-300 rounded" />
            <button
                class="bg-bodyBg text-white font-bold border-0 rounded px-5 py-2 cursor-pointer hover:bg-opacity-90 transition">
                ログインする
            </button>
        </form>
        <div v-if="errorMessage" class="mt-4 text-red-500">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mt-4 text-green-500">
            {{ successMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const { $axios } = useNuxtApp()

const login = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    try {
        const response = await $axios.post('/auth/sign_in', {
            email: email.value,
            password: password.value
        })
        console.log('Login successful:', response.data)
        successMessage.value = 'ログインに成功しました！'
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

<template>
    <div class="w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto text-center">
        <h2 class="text-xl font-bold mb-4">アカウントを登録</h2>
        <form @submit.prevent="signup" class="space-y-4">
            <input type="text" required placeholder="名前" v-model="name"
                class="block w-full p-2 border border-gray-300 rounded" />
            <input type="email" required placeholder="メールアドレス" v-model="email"
                class="block w-full p-2 border border-gray-300 rounded" />
            <input type="password" required placeholder="パスワード" v-model="password"
                class="block w-full p-2 border border-gray-300 rounded" />
            <input type="password" required placeholder="パスワード(確認用)" v-model="passwordConfirmation"
                class="block w-full p-2 border border-gray-300 rounded" />
            <button
                class="bg-bodyBg text-white font-bold border-0 rounded px-5 py-2 cursor-pointer hover:bg-opacity-90 transition">
                登録する
            </button>
        </form>
        <p v-if="successMessage" class="text-green-500 mt-4">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const { $axios } = useNuxtApp()

const signup = async () => {
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
        // 必要に応じてフォームをリセットする
        name.value = ''
        email.value = ''
        password.value = ''
        passwordConfirmation.value = ''
    } catch (error) {
        successMessage.value = ''
        errorMessage.value = 'アカウントを登録できませんでした。'
        console.error('Signup failed:', error)
    }
}
</script>

<template>
    <div class="w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto text-center">
        <h2 class="text-xl font-bold mb-4">アカウントを登録</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
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
    </div>
</template>

<script setup lang="ts">
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
</script>

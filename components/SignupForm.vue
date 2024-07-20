<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <span class="modal-close" @click="$emit('close')">&times;</span>
            <h2 class="form-title">アカウントを登録</h2>
            <form @submit.prevent="signup" class="form-layout">
                <FormField type="text" placeholder="名前" v-model="name" />
                <FormField type="email" placeholder="メールアドレス" v-model="email" />
                <div class="relative">
                    <FormField :type="passwordFieldType" placeholder="パスワード" v-model="password" />
                    <font-awesome-icon :icon="passwordVisible ? 'eye-slash' : 'eye'"
                        class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        @click="togglePasswordVisibility" />
                </div>
                <div class="relative">
                    <FormField :type="passwordFieldType" placeholder="パスワード(確認用)" v-model="passwordConfirmation" />
                    <font-awesome-icon :icon="passwordVisible ? 'eye-slash' : 'eye'"
                        class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        @click="togglePasswordVisibility" />
                </div>
                <button class="btn-red">登録する</button>
            </form>
            <MessageDisplay :message="successMessage" :isError="false" />
            <MessageDisplay :message="errorMessage" :isError="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

const passwordVisible = ref(false)
const passwordFieldType = computed(() => (passwordVisible.value ? 'text' : 'password'))

const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value
}

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

defineEmits(['close'])
</script>

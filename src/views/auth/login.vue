<script setup lang="ts">
import { ref } from "vue"
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import Button from "primevue/button"
import { useAuthStore } from "../../stores/auth/auth.store"
import { useRouter } from 'vue-router';

const _authStore = useAuthStore()
const router = useRouter();

const username = ref("")
const password = ref("")
const loading = ref(false)
const serverError = ref("")
const errors = ref<{ username?: string; password?: string }>({})

const validateForm = () => {
  errors.value = {}
  if (!username.value) errors.value.username = "El usuario es obligatorio"
  if (!password.value) errors.value.password = "La contraseña es obligatoria"
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  serverError.value = ""
  if (!validateForm()) return

  loading.value = true
  try {

    const payload = {
      username: username.value,
      password: password.value,
    }

    const result = await _authStore.login(payload)

    console.error(result);

    if (result.success) {
      // Redirigir a la página principal
      await router.push({ path: '/' })
    } else {
      // El error ya estará manejado por el interceptor de axios
      console.error('Error en login:', result.data)
    }

    // Redirigir
  } catch (err: any) {
    serverError.value = err.message || "Error en el servidor"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div
      class="flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

      <div class="hidden lg:flex w-full lg:w-1/2 items-center justify-center bg-gray-200 p-8">
        <div class="flex flex-col items-center justify-center text-center">
          <img src="@/assets/images/logo2.png" alt="Logo de la empresa" class="max-w-xs h-auto mb-6" />
          <h2 class="text-gray-800 text-3xl font-extrabold mb-4">¡Bienvenido a <br class="lg:hidden" /> Plataforma
            Clientes!</h2>
          <p class="text-gray-600 text-lg max-w-sm">
            Tu portal de gestión de PQRS. Accede para administrar tus PQRS de forma rápida y
            sencilla.
          </p>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-800">
        <div class="w-full max-w-md">
          <div class="text-center mb-6 ">
            <img src="@/assets/images/logo-int.png" alt="Logo Empresa" class="mx-auto w-50 h-50 object-contain mb-3" />
          </div>
          <h1 class="text-2xl font-bold text-gray-800 text-center mb-6">Iniciar Sesión</h1>
          <form @submit.prevent="handleLogin">
            <div class="mb-6">
              <label for="username" class="block text-gray-100 mb-2">Usuario</label>
              <InputText id="username" v-model.trim="username" placeholder="Ingrese su usuario" class="w-full"
                :class="{ 'p-invalid': errors.username }" />
              <small v-if="errors.username" class="text-red-400">{{ errors.username }}</small>
            </div>

            <div class="mb-6">
              <label for="password" class="block text-gray-100 mb-2">Contraseña</label>
              <div class="w-full">
                <Password id="password" v-model="password" toggleMask :feedback="false" class="w-full"
                  placeholder="Ingrese su contraseña" :inputClass="'w-full'" :inputStyle="{ width: '100%' }"
                  :class="{ 'p-invalid': errors.password }" />
                <small v-if="errors.password" class="text-red-400">{{ errors.password }}</small>
              </div>
            </div>
            <Button type="submit" label="Acceder" severity="primary"
              class="w-full py-2 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 border-0 hover:from-blue-700 hover:to-blue-500"
              icon="pi pi-sign-in" />
          </form>

          <p v-if="serverError" class="text-red-500 text-sm text-center mt-4">
            {{ serverError }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.p-inputtext,
.p-password {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  color: #374151;
}

.p-inputtext:focus,
.p-password:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
  outline: none;
}

.p-invalid {
  border-color: #ef4444 !important;
}

.p-password {
  display: flex;
  width: 100%;
}

.p-password .p-inputtext {
  flex-grow: 1;
  width: auto !important;
  background-color: transparent !important;
  color: #374151 !important;
}

.p-password-icon {
  color: #6b7280 !important;
  background-color: transparent !important;
}

</style>
<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useRouter, useRoute } from 'vue-router'
import Menubar from "primevue/menubar";
import Button from "primevue/button";

const router = useRouter()
const _authStore = useAuthStore()

// Función para cerrar sesión
const handleLogout = async () => {
  await _authStore.logout()
  await router.push({ name: 'login' })
}

const items = ref([
  {
    label: "Listado de mis PQRS",
    icon: "pi pi-list",
    command: () => {
      router.push({ name: 'pharmasan.siau.pqrs.inicio' });
    },
  },
  {
    label: "Crear PQRS",
    icon: "pi pi-plus",
    command: () => {
      router.push({ name: 'pharmasan.siau.pqrs.crear-pqrs' });
    },
  },
  {
    label: "Importar PQRS",
    icon: "pi pi-upload",
    command: () => {
      router.push({ name: 'pharmasan.siau.pqrs.import-pqrs' });
    },
  },
]);

</script>

<template>
  <div class="bg-gray-100">
    <Menubar :model="items" class="custom-menubar !bg-gray-900 shadow-lg" :pt="{
      action: { class: '!text-white hover:!text-white focus:!text-white' },
      label: { class: '!text-white' },
      icon: { class: '!text-white' },
      submenuIcon: { class: '!text-white' },
      button: { class: '!text-white' } // botón hamburguesa en móvil
    }">
      <template #start>
        <div class="flex items-center space-x-3">
          <img src="@/assets/images/logo-int.png" alt="Logo de Intranet" class="logo-menubar" />
        </div>
      </template>

      <template #end>
        <div class="flex flex-col sm:flex-row items-center justify-end gap-2 px-2 py-2">
          <p class="text-sm font-medium text-gray-100 whitespace-nowrap">
            {{ _authStore.getPeople?.full_name }}
          </p>
          <Button icon="pi pi-power-off" class="p-button-rounded p-button-text custom-logout-button !text-white"
            aria-label="Cerrar sesión" @click="handleLogout" />
        </div>
      </template>
    </Menubar>

  </div>
  <router-view />
</template>

<style>
/* Texto e íconos del ítem raíz */
.custom-menubar .p-menubar-item-content {
  color: #fff !important;
  transition: color .15s ease-in-out, background-color .15s ease-in-out, text-shadow .15s ease-in-out;
}

.custom-menubar .p-menubar-item-link,
.custom-menubar .p-menubar-item-icon,
.custom-menubar .p-menubar-item-label {
  color: inherit !important;
  /* que hereden el blanco del content */
}

/* Hover/focus: resalta (fondo tenue + mantiene blanco) */
.custom-menubar .p-menubar-item-content:hover,
.custom-menubar .p-menubar-item-content:focus,
.custom-menubar .p-menubar-item-content[data-p-highlight="true"] {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  text-shadow: 0 0 6px rgba(255, 255, 255, .35);
}

/* Botón hamburguesa (mobile) */
.custom-menubar .p-menubar-button,
.custom-menubar .p-menubar-button .p-menubar-icon {
  color: #fff !important;
}


/* The rest of your styles from the previous code */
.p-menubar {
  border-radius: 0 !important;
}

.p-menubar-mobile .p-menubar-root-list .p-menubar-item-content {
  color: #000 !important;
}

.p-button-xl {
  font-size: 2rem !important;
  width: 3.5rem !important;
  height: 3.5rem !important;
}

.custom-logout-button.p-button-text {
  color: #fff !important;
  background-color: transparent !important;
}

.custom-logout-button.p-button-text:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.logo-menubar {
  height: 50px;
  width: auto;
  max-height: 100%;
}
</style>
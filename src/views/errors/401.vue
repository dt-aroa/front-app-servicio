<template>
  <div class="flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-red-600">401</h1>
      <h2 class="mt-4 text-2xl">No Autorizado</h2>
      <p class="mt-2 text-gray-600">No tienes permiso para acceder a esta página</p>
      <router-link
        :to="{ name: 'inicio' }"
        class="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Volver al Inicio
      </router-link>
    </div>
  </div>
</template>

<script></script>

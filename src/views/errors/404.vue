<script setup></script>

<template>
  <div class="flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-red-600">404</h1>
      <h2 class="mt-4 text-2xl">Página No Encontrada</h2>
      <p class="mt-2 text-gray-600">La página que buscas no existe o ha sido movida</p>
      <router-link
        :to="{ name: 'pharmasan.siau.pqrs.inicio' }"
        class="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Volver al Inicio
      </router-link>
    </div>
  </div>
</template>

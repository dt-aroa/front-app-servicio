/*
import { createApp } from 'vue'
import './style.css'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura';
import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.mount("#app")
*/

/*
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';

// Importa el tema CSS de PrimeVue que desees usar
import 'primevue/resources/themes/aura-light-green/theme.css'; 
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue);
app.mount('#app');
*/

/*
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';

// New way to import themes in PrimeVue 4
import Aura from '@primevue/themes/aura';
import './assets/main.css'; 


// Import PrimeIcons if you need them
// import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  }
});
app.mount('#app');
*/

// src/main.js---
/*

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importa el archivo del router que acabas de crear

const app = createApp(App)

app.use(router) // Usa el router
app.mount('#app')
*/


/* version ant
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';

// New way to import themes in PrimeVue 4
import Aura from '@primevue/themes/aura';
import './assets/main.css'; 
import router from './router' // Importa el archivo del router que acabas de crear


// Import PrimeIcons if you need them
// import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  }
});

app.use(router)
app.mount('#app');
*/


// main.js
import { createApp } from 'vue';

import App from './App.vue';
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';


// New way to import themes in PrimeVue 4
//import Aura from '@primevue/themes/aura';
import './assets/main.css';
import router from './router' // Importa el archivo del router que acabas de crear

import { createPinia } from "pinia"


const localeEs = {
  firstDayOfWeek: 1,
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  today: 'Hoy',
  clear: 'Limpiar'
};

//import 'primeicons/primeicons.css';

import Lara from '@primevue/themes/lara';

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Lara,
    options: {
      dark: false,
      darkModeSelector: 'none' // o 'class' si luego quieres dark/light toggle
    }
  },
  locale: localeEs
});

app.use(router)

const pinia = createPinia()
app.use(pinia)

app.mount('#app');
document.documentElement.classList.remove('dark')

import { createApp } from 'vue';

import App from './App.vue';
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';


//import Aura from '@primevue/themes/aura';
import './assets/css/app.css';
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

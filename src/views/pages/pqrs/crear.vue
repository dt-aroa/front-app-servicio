<script setup>
import { ref, reactive, onMounted, watch, onBeforeMount } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import Textarea from 'primevue/textarea';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog'


// Variables para guardar los datos de la API
const departamentos = ref([]);
const typeIdentifications = ref([]);
const typeRequests = ref([]);
const municipios = ref([]);
const clasificaciones = ref([]);
const adjuntosRef = ref([])

const api = `${import.meta.env.VITE_VUE_APP_MICROSERVICE_API_SERVICIOALCLIENTE}`

console.warn("API URL:", api);

//validación email
const emailError = ref('');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loading = ref(false);

// Función para validar el correo
const validateEmail = () => {
  if (formData.email && !emailRegex.test(formData.email)) {
    emailError.value = 'Por favor, ingresa un correo electrónico válido.';
  } else {
    emailError.value = '';
  }
};

// Función para traer los datos de la API
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${api}/crear/crear-pqrs`);
    const data = await response.json();
    departamentos.value = data.departamentos;
    typeIdentifications.value = data.typeIdentifications;
    typeRequests.value = data.typeRequests;
  } catch (error) {
    console.error("Error al obtener los datos de la API:", error);
  } finally {
    loading.value = false;
  }
};

const supersaludOptions = ref(['Si', 'No']);

// Estado del formulario
const formData = reactive({
  type_identification: null,
  identification_number: '',
  first_name: '',
  second_name: '',
  last_name: '',
  second_surname: '',
  departamentos: null,
  municipios: null,
  phone_number: '',
  mobile_number: '',
  mobile_number_2: '',
  address: '',
  email: '',
  eps: null,
  regimen_ov: '',
});

const errors = reactive({});
const serverError = ref('');


const sanitizeText = (v) => {
  if (v == null) return ''
  // elimina etiquetas simples y normaliza espacios
  return String(v).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

const sanitizePhone = (v) => {
  if (!v) return ''
  // deja +, dígitos y espacios
  return String(v).replace(/[^\d+\s]/g, '').trim()
}

const sanitizeDateISO = (v) => {
  if (!v) return ''
  const d = typeof v === 'string' ? new Date(v) : v
  if (isNaN(d)) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const handleSubmit = async () => {
  // Lógica de validación
  errors.type_identification = !formData.type_identification ? 'Campo requerido.' : '';
  errors.identification_number = !formData.identification_number ? 'Campo requerido.' : '';
  errors.first_name = !formData.first_name ? 'Campo requerido.' : '';
  errors.last_name = !formData.last_name ? 'Campo requerido.' : '';
  errors.departamentos = !formData.departamentos ? 'Campo requerido.' : '';
  errors.municipios = !formData.municipios ? 'Campo requerido.' : '';
  errors.mobile_number = !formData.mobile_number ? 'Campo requerido.' : '';
  errors.type_request = !formData.type_request ? 'Campo requerido.' : '';
  errors.type_classification = !formData.type_classification ? 'Campo requerido.' : '';
  errors.description_request = !formData.description_request ? 'Campo requerido.' : '';
  errors.supersalud = !formData.supersalud ? 'Campo requerido.' : '';
  errors.date_request = !formData.date_request ? 'Campo requerido.' : '';

  /* Verificar si hay errores
  const hasErrors = Object.values(errors).some(error => error !== '');
  //const hasErrors = Object.values(errors.value).some(error => error !== '') || emailError.value;

  if (hasErrors) {
    console.error('Formulario con errores de validación.');
    return;
  }
*/
  loading.value = true;
  serverError.value = '';

  try {

    const form = new FormData();
    // Campos de texto
    form.append('type_identification', sanitizeText(formData.type_identification));
    form.append('identification_number', sanitizeText(formData.identification_number));
    form.append('first_name', sanitizeText(formData.first_name));
    form.append('last_name', sanitizeText(formData.last_name));
    form.append('departamentos', sanitizeText(formData.departamentos));
    form.append('municipios', sanitizeText(formData.municipios));
    form.append('mobile_number', sanitizePhone(formData.mobile_number));
    form.append('type_request', sanitizeText(formData.type_request));
    form.append('type_classification', sanitizeText(formData.type_classification));
    form.append('description_request', sanitizeText(formData.description_request));
    form.append('supersalud', formData.supersalud ? '1' : '0');
    form.append('date_request', sanitizeDateISO(formData.date_request));

    // Archivos: asumiendo que los guardas en un ref `adjuntosRef`
    adjuntosRef.value.forEach(file => form.append('adjuntos[]', file, file.name));


    const res = await fetch(`${api}/store-pqrs`, {
      method: 'POST',
      body: form // fetch pone automáticamente Content-Type: multipart/form-data
    });

    /*
    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();
    console.log('PQRS creada:', data);

    Object.keys(formData).forEach(k => (formData[k] = null));
    adjuntosRef.value = [];
    */

  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    serverError.value = 'Ocurrió un error al crear la PQRS. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};


const router = useRouter();

// Función que se llama al hacer clic en el botón "Cancelar"
const cancelRequest = () => {
  // Aquí usamos el router para navegar a la ruta deseada por su nombre
  router.push({ name: 'pharmasan.siau.pqrs.inicio' });
};


const onDepartamentoChange = async (event) => {
  const departamentoId = event.value;

  formData.municipio_id = null;
  municipios.value = [];

  if (departamentoId) {
    const url = `${api}/municipios/${departamentoId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      municipios.value = data.municipios;
    } catch (error) {
      console.error("Error al obtener los municipios:", error);
    }
  }
};

// Función que se activa al cambiar el tipo de solicitud
const onTypeRequestChange = async (event) => {
  const typeRequestId = event.value;

  // Limpiamos la selección de la clasificación y sus opciones
  formData.type_classification = null;
  clasificaciones.value = [];

  if (typeRequestId) {
    // Construimos la URL para obtener las clasificaciones, asumiendo una ruta
    const url = `${api}/clasificaciones/${typeRequestId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      clasificaciones.value = data.clasificaciones; // Asumimos que la API retorna un array "clasificaciones"
    } catch (error) {
      console.error("Error al obtener las clasificaciones:", error);
    }
  }
};

const props = defineProps({
  modelValue: { type: Boolean, default: false },     // v-model:visible
  file: { type: Object, default: null }               // File o { name, type, objectURL }
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const zoom = ref(1)                  // escala 1 = 100%
const minZoom = 0.25
const maxZoom = 4
const step = 0.25

const previewUrl = ref(null)
const containerEl = ref(null)        // wrapper que escalamos

watch(() => props.modelValue, v => { visible.value = v })
watch(visible, v => emit('update:modelValue', v))

function isImage(f) { return !!f?.type?.startsWith?.('image/') }
function isPdf(f) { return f?.type === 'application/pdf' || f?.name?.toLowerCase?.().endsWith('.pdf') }

function ensureObjectURL(file) {
  if (file?.objectURL) return file.objectURL
  try { return URL.createObjectURL(file) } catch { return null }
}

function open() {
  zoom.value = 1
  if (!props.file) return
  const url = ensureObjectURL(props.file)
  previewUrl.value = isPdf(props.file) ? (url ? `${url}#view=FitH` : null) : url
}

function close() {
  // Revocar solo si lo creamos aquí (no siempre se puede distinguir; revocar es seguro)
  if (previewUrl.value) {
    try { URL.revokeObjectURL(previewUrl.value.split('#')[0]) } catch { }
  }
  previewUrl.value = null
  zoom.value = 1
}

function onWheel(e) {
  if (!e.ctrlKey) return // activa zoom con Ctrl + rueda (opcional)
  e.preventDefault()
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}

function zoomIn() { zoom.value = Math.min(maxZoom, +(zoom.value + step).toFixed(2)) }
function zoomOut() { zoom.value = Math.max(minZoom, +(zoom.value - step).toFixed(2)) }
function resetZoom() { zoom.value = 1 }


onMounted(() => {
  fetchData();
});

</script>
<template>
  <div class="w-full lg:w-full flex items-center justify-center p-20 bg-gray-100">
    <div class="w-full">
      <div class="text-center mb-2">
        <h1 class="text-2xl font-bold text-gray-900text-center mb-6">
          Creación de PQRS
        </h1>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-8">
          <h4 class="text-xl font-bold text-blue-400 mb-4">
            Información del Paciente
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="type_identification" class="block text-gray-900mb-2">Tipo de Documento: <span
                  class="text-red-400">*</span></label>
              <Dropdown id="type_identification" v-model="formData.type_identification" :options="typeIdentifications"
                optionLabel="type_identification_name" optionValue="type_identification_id"
                placeholder="Seleccione un tipo" class="w-full" :class="{ 'p-invalid': errors.type_identification }" />
              <small v-if="errors.type_identification" class="text-red-400">{{
                errors.type_identification
              }}</small>
            </div>

            <div>
              <label for="identification_number" class="block text-gray-900mb-2">Número de Documento: <span
                  class="text-red-400">*</span></label>
              <InputText id="identification_number" v-model.trim="formData.identification_number"
                placeholder="Ingrese el número" class="w-full" :class="{ 'p-invalid': errors.identification_number }" />
              <small v-if="errors.identification_number" class="text-red-400">{{
                errors.identification_number
              }}</small>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label for="first_name" class="block text-gray-900mb-2">Primer Nombre: <span
                  class="text-red-400">*</span></label>
              <InputText id="first_name" v-model.trim="formData.first_name" placeholder="Primer nombre" class="w-full"
                :class="{ 'p-invalid': errors.first_name }" />
              <small v-if="errors.first_name" class="text-red-400">{{
                errors.first_name
              }}</small>
            </div>

            <div>
              <label for="second_name" class="block text-gray-900mb-2">Segundo Nombre:</label>
              <InputText id="second_name" v-model.trim="formData.second_name" placeholder="Segundo nombre"
                class="w-full" />
            </div>

            <div>
              <label for="last_name" class="block text-gray-900mb-2">Primer Apellido: <span
                  class="text-red-400">*</span></label>
              <InputText id="last_name" v-model.trim="formData.last_name" placeholder="Primer apellido" class="w-full"
                :class="{ 'p-invalid': errors.last_name }" />
              <small v-if="errors.last_name" class="text-red-400">{{
                errors.last_name
              }}</small>
            </div>

            <div>
              <label for="second_surname" class="block text-gray-900mb-2">Segundo Apellido:</label>
              <InputText id="second_surname" v-model.trim="formData.second_surname" placeholder="Segundo apellido"
                class="w-full" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label for="departamentos" class="block text-gray-900mb-2">Departamento: <span
                  class="text-red-400">*</span></label>
              <Dropdown id="departamentos" v-model="formData.departamento_id" :options="departamentos"
                optionLabel="departamento_name" optionValue="departamento_id" placeholder="Seleccione un departamento"
                @change="onDepartamentoChange" class="w-full" :class="{ 'p-invalid': errors.departamentos }" />
              <small v-if="errors.departamentos" class="text-red-400">{{
                errors.departamentos
              }}</small>
            </div>
            <div>
              <label for="municipios" class="block text-gray-900mb-2">Ciudad o Municipio: <span
                  class="text-red-400">*</span></label>
              <Dropdown id="municipios" v-model="formData.municipio_id" :options="municipios"
                optionLabel="municipio_name" optionValue="municipio_id" placeholder="Seleccione un municipio"
                class="w-full" :disabled="!formData.departamento_id" :class="{ 'p-invalid': errors.municipios }" />
              <small v-if="errors.municipios" class="text-red-400">{{
                errors.municipios
              }}</small>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label for="phone_number" class="block text-gray-900mb-2">Teléfono Fijo:</label>
              <InputText id="phone_number" v-model.trim="formData.phone_number" placeholder="Teléfono fijo"
                class="w-full" />
            </div>
            <div>
              <label for="mobile_number" class="block text-gray-900mb-2">Celular: <span
                  class="text-red-400">*</span></label>
              <InputText id="mobile_number" v-model.trim="formData.mobile_number" placeholder="Número de celular"
                class="w-full" :class="{ 'p-invalid': errors.mobile_number }" />
              <small v-if="errors.mobile_number" class="text-red-400">{{
                errors.mobile_number
              }}</small>
            </div>
            <div>
              <label for="mobile_number_2" class="block text-gray-900mb-2">Celular 2:</label>
              <InputText id="mobile_number_2" v-model.trim="formData.mobile_number_2" placeholder="Número de celular 2"
                class="w-full" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label for="address" class="block text-gray-900mb-2">Dirección:</label>
              <InputText id="address" v-model.trim="formData.address" placeholder="Dirección" class="w-full" />
            </div>
            <div>
              <label for="email" class="block text-gray-900mb-2">Correo Electrónico:</label>
              <InputText id="email" v-model.trim="formData.email" @blur="validateEmail" placeholder="Correo electrónico"
                class="w-full" :class="{ 'p-invalid': emailError }" />
              <small v-if="emailError" class="text-red-400">
                {{ emailError }}
              </small>
            </div>
          </div>
        </div>
        <div class="mb-8">
          <h4 class="text-xl font-bold text-blue-400 mb-4">
            Información de la Solicitud
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label for="type_request" class="block text-gray-900mb-2">Tipo de Solicitud: <span
                  class="text-red-400">*</span></label>
              <Dropdown id="type_request" v-model="formData.type_request" :options="typeRequests"
                optionLabel="type_request_name" optionValue="type_request_id" placeholder="Seleccione un tipo"
                @change="onTypeRequestChange" class="w-full" :class="{ 'p-invalid': errors.type_request }" />
              <small v-if="errors.type_request" class="text-red-400">{{
                errors.type_request
              }}</small>
            </div>
            <div>
              <label for="type_classification" class="block text-gray-900mb-2">Clasificación: <span
                  class="text-red-400">*</span></label>
              <Dropdown id="type_classification" v-model="formData.type_classification" :options="clasificaciones"
                optionLabel="type_classification_name" optionValue="type_classification_id"
                placeholder="Seleccione una clasificación" class="w-full" :disabled="!formData.type_request"
                :class="{ 'p-invalid': errors.type_classification }" />
              <small v-if="errors.type_classification" class="text-red-400">{{
                errors.type_classification
              }}</small>
            </div>
            <div>
              <label for="supersalud" class="block text-gray-900mb-2">Supersalud: <span
                  class="text-red-400">*</span></label>
              <Dropdown id="supersalud" v-model="formData.supersalud" :options="supersaludOptions"
                placeholder="Seleccione una opción" class="w-full" :class="{ 'p-invalid': errors.supersalud }" />
              <small v-if="errors.supersalud" class="text-red-400">{{
                errors.supersalud
              }}</small>
            </div>
            <div>
              <label for="date_request" class="block text-gray-900mb-2">Fecha de la Solicitud: <span
                  class="text-red-400">*</span></label>
              <Calendar id="date_request" v-model="formData.date_request" showTime hourFormat="24" dateFormat="dd/mm/yy"
                class="w-full" :class="{ 'p-invalid': errors.date_request }" />
              <small v-if="errors.date_request" class="text-red-400">{{
                errors.date_request
              }}</small>
            </div>
          </div>

          <div class="mt-4">
            <label for="description_request" class="block text-gray-900mb-2">Descripción de la Solicitud: <span
                class="text-red-400">*</span></label>
            <Textarea id="description_request" v-model.trim="formData.description_request" rows="5" cols="30"
              placeholder="Ingrese una descripción detallada de la solicitud" class="w-full"
              :class="{ 'p-invalid': errors.description_request }" />
            <small v-if="errors.description_request" class="text-red-400">{{
              errors.description_request
            }}</small>
          </div>

          <!--<div class="mt-4">
            <label for="physical_sources" class="block text-gray-900mb-2">Origen de la Solicitud: <span
                class="text-red-400">*</span></label>
            <Dropdown id="physical_sources" v-model="formData.physical_sources" :options="origenesSolicitud"
              optionLabel="label" optionValue="value" placeholder="Seleccione un origen" class="w-full"
              :class="{ 'p-invalid': errors.physical_sources }" />
            <small v-if="errors.physical_sources" class="text-red-400">{{
              errors.physical_sources
            }}</small>
          </div>
        -->

          <FileUpload name="adjuntos[]" accept="image/*,.pdf" :maxFileSize="1_000_000" :multiple="true" mode="advanced"
            :auto="false" :customUpload="true" @select="onFileSelect" @remove="onFileRemove">

            <!-- ITEM -->
            <template #item="{ file, onRemove }">
              <div class="p-fileupload-preview">
                <div class="p-fileupload-preview-details">
                  <div>{{ file.name }}</div>
                  <div>({{ (file.size / 1024).toFixed(2) }} KB)</div>
                </div>

                <div class="p-fileupload-preview-actions">
                  <Button icon="pi pi-trash" severity="danger" class="p-button-danger" @click="onRemove" />
                  <a :href="file.objectURL" :download="file.name" target="_blank">
                    <Button icon="pi pi-download" severity="info" class="p-button-info" />
                  </a>
                </div>
              </div>
            </template>

            <!-- HEADER -->
            <template #header="{ files, chooseCallback, clearCallback }">
              <div class="flex justify-between items-center w-full p-2">
                <span class="font-bold">{{ files.length }} archivo(s) seleccionado(s)</span>
                <div class="flex gap-2">
                  <Button label="EXAMINAR..." icon="pi pi-upload" severity="info" @click="chooseCallback()" />
                </div>
              </div>
            </template>

          </FileUpload>


        </div>

        <div class="flex justify-end gap-x-4 mt-8">
          <Button label="Cancelar" severity="secondary" icon="pi pi-times"
            class="py-2 font-semibold rounded-lg bg-gradient-to-r from-gray-900 to-gray-400 border-0 hover:from-gray-900 hover:to-gray-500"
            @click="cancelRequest" />

          <Button type="submit" label="Guardar Solicitud" severity="primary"
            class="py-2 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 border-0 hover:from-blue-700 hover:to-blue-500"
            icon="pi pi-plus" :loading="loading" />
        </div>
      </form>

      <p v-if="serverError" class="text-red-500 text-sm text-center mt-4">
        {{ serverError }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.p-invalid {
  border-color: #ef4444 !important;
}
</style>
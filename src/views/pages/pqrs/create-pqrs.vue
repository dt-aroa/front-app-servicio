<script setup>
import { ref, reactive, onMounted, watch, onBeforeMount } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import Textarea from 'primevue/textarea';
import { useRouter } from 'vue-router';
import InputMask from 'primevue/inputmask'
import { useAuthStore } from '@/stores/auth/auth.store'
import PqrsService from '@/services/pqrs/pqrs.service.js'
import { messageSuccess, messageError } from '../../../utils/messages';
import Card from 'primevue/card';
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Panel from 'primevue/panel';
import Fieldset from 'primevue/fieldset';

const _PqrsService = new PqrsService()
const router = useRouter()

//precarga de datos del usuario
const _authStore = useAuthStore()
const people = _authStore.getPeople


// Variables para guardar los datos de la API
const departamentos = ref([]);
const typeIdentifications = ref([]);
const typeRequests = ref([]);
const municipios = ref([]);
const clasificaciones = ref([]);
const adjuntosRef = ref([])
const departamentos_remitente = ref([]);
const municipios_remitente = ref([]);
const supersaludOptions = ref(['Si', 'No']);
const regimenOptions = ref(['Contributivo', 'Subsidiado']);
const errors = reactive({});
const serverError = ref('');

const cardcode = ref(_authStore._user.cardcode || '')
const user_id = ref()


const loading = ref(false);

// Función para traer los datos iniciales para crear PQRS
const fetchData = async () => {

  loading.value = true;
  try {
    const response = await _PqrsService.getCrearPqrs()
    if (response.status !== 200) {
      throw new Error(`Error al obtener información: ${response.statusText}`);
    }
    departamentos.value = response.data.departamentos;
    departamentos_remitente.value = response.data.departamentos;
    typeIdentifications.value = response.data.typeIdentifications;
    typeRequests.value = response.data.typeRequests;
  } catch (error) {
    console.error("Error al obtener los datos de la API:", error);
  } finally {
    loading.value = false;
  }
};


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

function sanitizeDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(+d)) return '';
  const pad = n => String(n).padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

const validationSchema = yup.object({
  request_sender_email: yup
    .string()
    .required('El email del remitente es obligatorio')
    .max(255, 'El email del remitente no puede tener más de 255 caracteres')
    .email('Formato de email inválido'),
  request_sender_phone: yup
    .string()
    .required('El teléfono del remitente es obligatorio')
    .max(255, 'El teléfono del remitente no puede tener más de 255 caracteres'),
  request_sender_name: yup
    .string()
    .required('El nombre del remitente es obligatorio')
    .max(255, 'El nombre del remitente no puede tener más de 255 caracteres'),
  request_sender_cargo: yup
    .string()
    .required('El cargo del remitente es obligatorio')
    .max(255, 'El cargo del remitente no puede tener más de 255 caracteres'),
  departamento_remitente_id: yup
    .string()
    .required('El departamento del remitente es obligatorio')
    .max(11, 'El departamento del remitente no puede tener más de 11 caracteres')
    .matches(/^[0-9]+$/, 'El departamento del remitente solo puede contener dígitos'),
  municipio_remitente_id: yup
    .string()
    .required('El municipio del remitente es obligatorio')
    .max(11, 'El municipio del remitente no puede tener más de 11 caracteres')
    .matches(/^[0-9]+$/, 'El municipio del remitente no solo puede contener dígitos'),
  request_sender_number: yup
    .string()
    .max(255, 'El radicado del remitente no puede tener más de 255 caracteres'),
  type_identification: yup
    .number()
    .required('El tipo de documento del paciente es obligatorio')
    .max(50, 'El tipo de documento del paciente no puede tener más de 50 caracteres'),
  identification_number: yup
    .string()
    .required('El número de documento del paciente es obligatorio')
    .min(5, 'El número de documento debe tener al menos 5 caracteres')
    .max(255, 'El número de documento no puede tener más de 15 caracteres'),
  first_name: yup
    .string()
    .required('El primer nombre es obligatorio')
    .max(255, 'El primer nombre no puede tener más de 255 caracteres'),
  second_name: yup
    .string()
    .max(255, 'El segundo nombre no puede tener más de 255 caracteres'),
  last_name: yup
    .string()
    .required('El primer apellido es obligatorio')
    .max(255, 'El primer apellido no puede tener más de 255 caracteres'),
  second_surname: yup
    .string()
    .max(255, 'El segundo apellido no puede tener más de 255 caracteres'),
  phone_number: yup
    .string()
    .max(255, 'El teléfono del paciente no puede tener más de 255 caracteres'),
  mobile_number: yup
    .string()
    .required('El celular es obligatorio')
    .max(255, 'El celular no puede tener más de 255 caracteres'),
  email: yup
    .string()
    .required('El email del paciente es obligatorio')
    .max(255, 'El email del paciente no puede tener más de 255 caracteres')
    .email('Formato de email inválido'),
  address: yup
    .string()
    .required('La dirección es obligatorio')
    .max(255, 'La dirección no puede tener más de 255 caracteres'),
  departamento_id: yup
    .string()
    .required('El departamento del paciente es obligatorio')
    .max(4, 'El departamento del paciente no puede tener más de 4 caracteres'),
  municipio_id: yup
    .string()
    .required('El municipio del paciente es obligatorio')
    .max(4, 'El municipio del paciente no puede tener más de 4 caracteres'),
  regimen: yup
    .string()
    .required('El régimen es obligatorio')
    .max(255, 'La régimen no puede tener más de 255 caracteres'),
  type_request: yup
    .string()
    .required('El tipo de solicitud es obligatorio')
    .max(4, 'El tipo de solicitud  no puede tener más de 4 caracteres'),
  type_classification: yup
    .string()
    .required('La clasificación de solicitud es obligatoria')
    .max(4, 'La clasificación de solicitud  no puede tener más de 4 caracteres'),
  supersalud: yup
    .string()
    .required('Supersalud es obligatorio')
    .max(4, 'Supersalud  no puede tener más de 4 caracteres'),
  date_request: yup
    .date()
    .required('La fecha de solicitud es obligatoria'),
  description_request: yup
    .string()
    .required('La descripción de la solicitud es obligatoria')
    .max(4000, 'La descripción  no puede tener más de 4 caracteres'),
});

// 2. Vincula el esquema de validación al formulario
const { handleSubmit } = useForm({
  validationSchema,
});



const { value: request_sender_email, errorMessage: request_sender_emailError } = useField('request_sender_email');
const { value: request_sender_phone, errorMessage: request_sender_phoneError } = useField('request_sender_phone');
const { value: request_sender_name, errorMessage: request_sender_nameError } = useField('request_sender_name');
const { value: request_sender_cargo, errorMessage: request_sender_cargoError } = useField('request_sender_cargo');
const { value: departamento_remitente_id, errorMessage: departamento_remitente_idError } = useField('departamento_remitente_id');
const { value: municipio_remitente_id, errorMessage: municipio_remitente_idError } = useField('municipio_remitente_id');
const { value: request_sender_number, errorMessage: request_sender_numberError } = useField('request_sender_number');

const { value: type_identification, errorMessage: type_identificationError } = useField('type_identification');
const { value: identification_number, errorMessage: identification_numberError } = useField('identification_number');
const { value: first_name, errorMessage: first_nameError } = useField('first_name');
const { value: second_name, errorMessage: second_nameError } = useField('second_name');
const { value: last_name, errorMessage: last_nameError } = useField('last_name');
const { value: second_surname, errorMessage: second_surnameError } = useField('second_surname');
const { value: phone_number, errorMessage: phone_numberError } = useField('phone_number');
const { value: mobile_number, errorMessage: mobile_numberError } = useField('mobile_number');
const { value: email, errorMessage: emailError } = useField('email');
const { value: address, errorMessage: addressError } = useField('address');
const { value: departamento_id, errorMessage: departamento_idError } = useField('departamento_id');
const { value: municipio_id, errorMessage: municipio_idError } = useField('municipio_id');
const { value: regimen, errorMessage: regimenError } = useField('regimen');

const { value: type_request, errorMessage: type_requestError } = useField('type_request');
const { value: type_classification, errorMessage: type_classificationError } = useField('type_classification');
const { value: supersalud, errorMessage: supersaludError } = useField('supersalud');
const { value: date_request, errorMessage: date_requestError } = useField('date_request');
const { value: description_request, errorMessage: description_requestError } = useField('description_request');


request_sender_email.value = people?.email?.trim?.()?.toUpperCase() ?? '';
request_sender_phone.value = people?.telefono?.trim?.() ?? '';
request_sender_name.value = (people?.full_name ?? p?.name ?? '').trim?.() ?? '';


const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  serverError.value = '';

  try {

    const form = new FormData();

    //campos de texto remitente
    form.append('cardcode', sanitizeText(cardcode.value));
    form.append('user_id', sanitizeText(user_id.value));

    form.append('request_sender_email', sanitizeText(request_sender_email.value));
    form.append('request_sender_phone', sanitizePhone(request_sender_phone.value));
    form.append('request_sender_name', sanitizeText(request_sender_name.value));
    form.append('request_sender_cargo', sanitizeText(request_sender_cargo.value));
    form.append('departamento_remitente_id', sanitizeText(departamento_remitente_id.value));
    form.append('municipio_remitente_id', sanitizeText(municipio_remitente_id.value));
    form.append('request_sender_number', sanitizeText(request_sender_number.value));

    // Campos de texto paciente
    form.append('type_identification', sanitizeText(type_identification.value));
    form.append('identification_number', sanitizeText(identification_number.value));
    form.append('first_name', sanitizeText(first_name.value));
    form.append('second_name', sanitizeText(second_name.value));
    form.append('last_name', sanitizeText(last_name.value));
    form.append('second_surname', sanitizeText(second_surname.value));

    form.append('phone_number', sanitizePhone(phone_number.value));
    form.append('mobile_number', sanitizePhone(mobile_number.value));

    form.append('address', sanitizeText(address.value));
    form.append('email', sanitizeText(email.value));
    form.append('departamento_id', sanitizeText(departamento_id.value));
    form.append('municipio_id', sanitizeText(municipio_id.value));
    form.append('regimen', sanitizeText(regimen.value));

    form.append('type_request', sanitizeText(type_request.value));
    form.append('type_classification', sanitizeText(type_classification.value));
    form.append('supersalud', supersalud.value);
    form.append('date_request', sanitizeDateTime(date_request.value));
    form.append('description_request', sanitizeText(description_request.value));

    adjuntosRef.value.forEach(file => form.append('adjuntos[]', file, file.name));

    const result = await _PqrsService.createPqrs(form);

    let mensajesDeError = "<ul>";

    if (result.status == 201) {
      if (result.data) {
        const data = result.data;
        if (data.request_id) {
          messageSuccess("Solicitud registrada con éxito: " + data.request_number)
          router.push({ name: 'pharmasan.siau.pqrs.inicio' });
        }
        if (data.error) {
          if (data.error.details) {
            for (let i = 0; i < data.error.details.length; i++) {
              mensajesDeError += "<li style='text-align:justify; list-style-type: circle'>" + data.error.details[i].message + '</li>';
            }
            mensajesDeError += "</ul>";
            messageError('', 'Error al registrar solicitud', mensajesDeError)
          }
        }
      }
    }
    console.log('Resultado de la creación de PQRS:', result);
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
  } finally {
    loading.value = false;
  }
});

// Función que se llama al hacer clic en el botón "Cancelar"
const cancelRequest = () => {
  router.push({ name: 'pharmasan.siau.pqrs.inicio' });
};

// Función que se activa al cambiar el departamento del remitente
const onDepartamentoRemitenteChange = async (event) => {

  municipios_remitente.value = [];

  if (departamento_remitente_id.value) {
    try {
      const response = await _PqrsService.getMunicipios(departamento_remitente_id.value)
      if (response.status !== 200) {
        throw new Error(`Error al obtener los municipios: ${response.statusText}`);
      }
      municipios_remitente.value = response.data.municipios;
    } catch (error) {
      console.error("Error al obtener los municipios:", error);
    }
  }
};

// Función que se activa al cambiar el departamento del remitente
const onDepartamentoChange = async (event) => {

  municipios.value = [];

  if (departamento_id.value) {
    try {
      const response = await _PqrsService.getMunicipios(departamento_id.value)
      if (response.status !== 200) {
        throw new Error(`Error al obtener los municipios: ${response.statusText}`);
      }
      municipios.value = response.data.municipios;
    } catch (error) {
      console.error("Error al obtener los municipios:", error);
    }
  }
};

// Función que se activa al cambiar el tipo de solicitud
const onTypeRequestChange = async (event) => {
  const typeRequestId = event.value;
  // Limpiamos la selección de la clasificación y sus opciones
  clasificaciones.value = [];

  if (type_request.value) {
    try {
      const response = await _PqrsService.getClasificaciones(type_request.value)
      if (response.status !== 200) {
        throw new Error(`Error al obtener las clasificaciones: ${response.statusText}`);
      }
      clasificaciones.value = response.data.clasificaciones; // Asumimos que la API retorna un array "clasificaciones"
    } catch (error) {
      console.error("Error al obtener las clasificaciones:", error);
    }
  }
};

// PrimeVue FileUpload dispara @select con { files }
function onFileSelect(event) {
  adjuntosRef.value.push(...event.files)
}

function onFileRemove(event) {
  // Borra el archivo que se seleccionó
  adjuntosRef.value = adjuntosRef.value.filter(f => f !== event.file)
}

const props = defineProps({
  modelValue: { type: Boolean, default: false },     // v-model:visible
  file: { type: Object, default: null }               // File o { name, type, objectURL }
})

const emit = defineEmits(['update:modelValue'])


/*
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
*/
/*
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
*/

onMounted(() => {
  user_id.value = _authStore.getUser.user_id ||  _authStore.getUser.id
  //  cardcode.value = _authStore.getUser.cardcode || ''
  //  _authStore._user.cardcode
  fetchData();
});

</script>
<template>
  <div class="w-full lg:w-full flex page-panel-main">
    <div class="w-full">
      <Panel :pt="panelStyles" class="w-full  shadow-lg rounded-lg overflow-hidden">
        <template #header>
          <div class="flex items-center gap-2">
            <i class="pi pi-file text-xl"></i>
            <span class="text-blue-500 font-bold text-title-panel">Crear PQRS</span>
          </div>
        </template>
        <template #icons>
          <span class="text-sm md:text-base text-gray-500">
            (<span class="text-red-500 mr-1">*</span>Campos obligatorios)
          </span>
        </template>
        <form @submit.prevent="onSubmit">
          <div class="mb-8">
            <!----información Remitente-->
            <div class="p-card-header bold  bg-white-200 pb-8">
              <span class="text-blue-500 font-bold text-subtitle-card">Ingrese los Datos del Remitente</span>
            </div>
            <!----información Paciente-->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label for="request_sender_email" class="block text-gray-900 mb-2 label-form">Email Remitente:
                  <span class="text-red-400">*</span>
                </label>
                <InputGroup>
                  <InputGroupAddon>
                    <i class="pi pi-at"></i>
                  </InputGroupAddon>
                  <InputText id="request_sender_email" v-model.trim="request_sender_email" :disabled="true"
                    class="w-full uppercase label-form" :class="{ 'p-invalid': request_sender_emailError }" />
                </InputGroup>
                <small v-if="request_sender_emailError" class="text-red-400">
                  {{ request_sender_emailError }}
                </small>
              </div>
              <div>
                <label for="request_sender_name" class="block text-gray-900 label-form mb-2">Nombre Remitente:
                  <span class="text-red-400">*</span></label>
                <InputGroup>
                  <InputGroupAddon>
                    <i class="pi pi-user-edit"></i>
                  </InputGroupAddon>
                  <InputText id="request_sender_name" v-model.trim="request_sender_name" :disabled="true"
                    class="w-full uppercase label-form" :class="{ 'p-invalid': request_sender_nameError }" />
                </InputGroup>
                <small v-if="request_sender_nameError" class="text-red-400">{{
                  request_sender_nameError
                }}</small>
              </div>
              <div>
                <label for="request_sender_phone" class="block text-gray-900 label-form mb-2">Teléfono Remitente:
                  <span class="text-red-400">*</span>
                </label>
                <InputGroup>
                  <InputGroupAddon>
                    <i class="pi pi-mobile"></i>
                  </InputGroupAddon>
                  <InputMask id="request_sender_phone" v-model.trim="request_sender_phone" mask="999 999 9999" unmask
                    :pt="{ input: { inputmode: 'numeric' } }" class="w-full label-form"
                    :class="{ 'p-invalid': request_sender_phoneError }" />
                </InputGroup>
                <small v-if="request_sender_phoneError" class="text-red-400">{{
                  request_sender_phoneError
                }}</small>
              </div>
              <div>
                <label for="request_sender_cargo" class="block text-gray-900 label-form mb-2">Cargo:
                  <span class="text-red-400">*</span></label>
                <InputGroup>
                  <InputGroupAddon>
                    <i class="pi pi-bookmark-fill"></i>
                  </InputGroupAddon>
                  <InputText id="request_sender_cargo" v-model.trim="request_sender_cargo"
                    class="w-full uppercase label-form" :class="{ 'p-invalid': request_sender_cargoError }" />
                </InputGroup>
                <small v-if="request_sender_cargoError" class="text-red-400">{{
                  request_sender_cargoError
                }}</small>
              </div>
              <div>
                <label for="departamentos_remitente" class="block text-gray-900 label-form mb-2">Departamento
                  Remitente: <span class="text-red-400">*</span></label>
                <InputGroup>
                  <InputGroupAddon>
                    <i class="pi pi-map-marker"></i>
                  </InputGroupAddon>
                  <Dropdown id="departamento_remitente_id" v-model="departamento_remitente_id"
                    :options="departamentos_remitente" optionLabel="departamento_name" optionValue="departamento_id"
                    placeholder="Seleccione un departamento" @change="onDepartamentoRemitenteChange"
                    class="w-full label-form " :class="{ 'p-invalid': departamento_remitente_idError }" />
                </InputGroup>
                <small v-if="departamento_remitente_idError" class="text-red-400">{{
                  departamento_remitente_idError
                }}</small>
              </div>
              <div>
                <label for="municipios_remitente" class="block text-gray-900 label-form mb-2">Municipio Remitente:
                  <span class="text-red-400">*</span></label>
                <InputGroup>
                  <InputGroupAddon>
                    <i class="pi pi-map"></i>
                  </InputGroupAddon>
                  <Dropdown id="municipios_remitente_id" v-model="municipio_remitente_id"
                    :options="municipios_remitente" optionLabel="municipio_name" optionValue="municipio_id"
                    placeholder="Seleccione un municipio" class="w-full label-form"
                    :disabled="!departamento_remitente_id" :class="{ 'p-invalid': municipio_remitente_idError }" />
                </InputGroup>
                <small v-if="municipio_remitente_idError" class="text-red-400">{{
                  municipio_remitente_idError
                }}</small>
              </div>
              <div>
                <div>
                  <label for="request_sender_number" class="block text-gray-900 label-form mb-2">Núm.
                    Radicado:</label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-info-circle"></i>
                    </InputGroupAddon>
                    <InputText id="request_sender_number" v-model.trim="request_sender_number"
                      class="w-full label-form uppercase" />
                  </InputGroup>
                  <small v-if="request_sender_number_idError" class="text-red-400">{{
                    request_sender_number_idError
                  }}</small>
                </div>
              </div>
            </div>
            <!----información Paciente-->
            <div class="mb-4">
              <div class="p-card-header bold pb-8 pt-8 bg-white-200">
                <span class="text-blue-500 font-bold text-subtitle-card">Ingrese los Datos del Paciente</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="type_identification" class="block text-gray-900 label-form mb-2">Tipo de Documento:
                    <span class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-credit-card"></i>
                    </InputGroupAddon>
                    <Dropdown id="type_identification" v-model="type_identification" :options="typeIdentifications"
                      optionLabel="type_identification_name" optionValue="type_identification_id"
                      placeholder="Seleccione un tipo" class="w-full label-form"
                      :class="{ 'p-invalid': type_identificationError }" />
                  </InputGroup>
                  <small v-if="type_identificationError" class="text-red-400">{{
                    type_identificationError
                  }}</small>
                </div>
                <div>
                  <label for="identification_number" class="block text-gray-900 label-form mb-2">Número de
                    Documento:
                    <span class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-id-card"></i>
                    </InputGroupAddon>
                    <InputText id="identification_number" v-model.trim="identification_number"
                      :pt="{ input: { type: 'tel', inputmode: 'numeric', pattern: '[0-9]*' } }"
                      class="w-full label-form" :class="{ 'p-invalid': identification_numberError }" />
                  </InputGroup>
                  <small v-if="identification_numberError" class="text-red-400">{{
                    identification_numberError
                  }}</small>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div>
                  <label for="first_name" class="block text-gray-900 label-form mb-2">Primer Nombre: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-user"></i>
                    </InputGroupAddon>
                    <InputText id="first_name" v-model.trim="first_name" class="w-full label-form uppercase"
                      :class="{ 'p-invalid': first_nameError }" />
                  </InputGroup>
                  <small v-if="first_nameError" class="text-red-400">{{
                    first_nameError
                  }}</small>
                </div>
                <div>
                  <label for="second_name" class="block text-gray-900 label-form mb-2">Segundo Nombre:</label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-user"></i>
                    </InputGroupAddon>
                    <InputText id="second_name" v-model.trim="second_name" class="w-full label-form uppercase"
                      :class="{ 'p-invalid': second_nameError }" />
                  </InputGroup>
                  <small v-if="second_nameError" class="text-red-400">{{
                    second_nameError
                  }}</small>
                </div>
                <div>
                  <label for="last_name" class="block text-gray-900 label-form mb-2">Primer Apellido: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-user"></i>
                    </InputGroupAddon>
                    <InputText id="last_name" v-model.trim="last_name" class="w-full label-form uppercase"
                      :class="{ 'p-invalid': last_nameError }" />
                  </InputGroup>
                  <small v-if="last_nameError" class="text-red-400">{{
                    last_nameError
                  }}</small>
                </div>
                <div>
                  <label for="second_surname" class="block text-gray-900 label-form mb-2">Segundo Apellido:</label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-user"></i>
                    </InputGroupAddon>
                    <InputText id="second_surname" v-model.trim="second_surname" class="w-full label-form uppercase"
                      :class="{ 'p-invalid': second_surnameError }" />
                  </InputGroup>
                  <small v-if="second_surnameError" class="text-red-400">{{
                    second_surnameError
                  }}</small>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
                <div>
                  <label for="phone_number" class="block text-gray-900 label-form mb-2">Teléfono Fijo:</label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-phone"></i>
                    </InputGroupAddon>
                    <InputText id="phone_number" v-model.trim="phone_number" class="w-full"
                      :class="{ 'p-invalid': phone_numberError }" />
                  </InputGroup>
                  <small v-if="phone_numberError" class="text-red-400">{{
                    phone_numberError
                  }}</small>
                </div>
                <div>
                  <label for="mobile_number" class="block text-gray-900 label-form mb-2">Celular: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-mobile"></i>
                    </InputGroupAddon>
                    <InputMask id="mobile_number" v-model.trim="mobile_number" mask="999 999 9999" unmask
                      :pt="{ input: { inputmode: 'numeric' } }" class="w-full label-form"
                      :class="{ 'p-invalid': mobile_numberError }" />
                  </InputGroup>
                  <small v-if="mobile_numberError" class="text-red-400">{{
                    mobile_numberError
                  }}</small>
                </div>
                <div>
                  <label for="email" class="block text-gray-900 label-form mb-2">Correo Electrónico:</label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-at"></i>
                    </InputGroupAddon>
                    <InputText id="email" v-model.trim="email" class="w-full label-form uppercase"
                      :class="{ 'p-invalid': emailError }" />
                  </InputGroup>
                  <small v-if="emailError" class="text-red-400">
                    {{ emailError }}
                  </small>
                </div>
                <div>
                  <label for="address" class="block text-gray-900 label-form  mb-2">Dirección:</label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-address-book"></i>
                    </InputGroupAddon>
                    <InputText id="address" v-model.trim="address" class="w-full label-form uppercase"
                      :class="{ 'p-invalid': addressError }" />
                  </InputGroup>
                </div>
                <small v-if="addressError" class="text-red-400">
                  {{ addressError }}
                </small>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label for="departamentos" class="block text-gray-900 label-form  mb-2">Departamento: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-map-marker"></i>
                    </InputGroupAddon>
                    <Dropdown id="departamentos" v-model="departamento_id" :options="departamentos"
                      optionLabel="departamento_name" optionValue="departamento_id"
                      placeholder="Seleccione un departamento" @change="onDepartamentoChange" class="w-full label-form"
                      :class="{ 'p-invalid': departamento_idError }" />
                  </InputGroup>
                  <small v-if="departamento_idError" class="text-red-400">{{
                    departamento_idError
                  }}</small>
                </div>
                <div>
                  <label for="municipios" class="block text-gray-900 label-form  mb-2">Ciudad o Municipio: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-map"></i>
                    </InputGroupAddon>
                    <Dropdown id="municipios" v-model="municipio_id" :options="municipios" optionLabel="municipio_name"
                      optionValue="municipio_id" class="w-full label-form" :disabled="!departamento_id"
                      :class="{ 'p-invalid': municipio_idError }" />
                  </InputGroup>
                  <small v-if="municipio_idError" class="text-red-400">{{
                    municipio_idError
                  }}</small>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label for="regimen" class="block text-gray-900 label-form  mb-2">Régimen: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-sitemap"></i>
                    </InputGroupAddon>
                    <Dropdown id="regimen" v-model="regimen" :options="regimenOptions"
                      placeholder="Seleccione una opción" class="w-full label-form"
                      :class="{ 'p-invalid': regimenError }" />
                  </InputGroup>
                  <small v-if="regimenError" class="text-red-400">{{
                    regimenError
                  }}</small>
                </div>
              </div>
            </div>
            <!----información Solicitud-->
            <div class="mb-4">
              <div class="p-card-header bold pb-8 pt-8 bg-white-200">
                <span class="text-blue-500 font-bold text-subtitle-card">Ingrese los Datos la Solicitud</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label for="type_request" class="block text-gray-900 label-form mb-2">Tipo de Solicitud: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-folder"></i>
                    </InputGroupAddon>
                    <Dropdown id="type_request" v-model="type_request" :options="typeRequests"
                      optionLabel="type_request_name" optionValue="type_request_id" placeholder="Seleccione un tipo"
                      @change="onTypeRequestChange" class="w-full label-form"
                      :class="{ 'p-invalid': type_requestError }" />
                  </InputGroup>
                  <small v-if="type_requestError" class="text-red-400">{{
                    type_requestError
                  }}</small>
                </div>
                <div>
                  <label for="type_classification" class="block text-gray-900 label-form mb-2">Clasificación: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-exclamation-circle"></i>
                    </InputGroupAddon>
                    <Dropdown id="type_classification" v-model="type_classification" :options="clasificaciones"
                      optionLabel="type_classification_name" optionValue="type_classification_id"
                      placeholder="Seleccione una clasificación" class="w-full label-form" :disabled="!type_request"
                      :class="{ 'p-invalid': type_classificationError }" />
                  </InputGroup>
                  <small v-if="type_classificationError" class="text-red-400">{{
                    type_classificationError
                  }}</small>
                </div>
                <div>
                  <label for="supersalud" class="block text-gray-900 label-form mb-2">Supersalud: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-tags"></i>
                    </InputGroupAddon>
                    <Dropdown id="supersalud" v-model="supersalud" :options="supersaludOptions"
                      placeholder="Seleccione una opción" class="w-full label-form"
                      :class="{ 'p-invalid': supersaludError }" />
                  </InputGroup>
                  <small v-if="supersaludError" class="text-red-400">{{
                    supersaludError
                  }}</small>
                </div>
                <div>
                  <label for="date_request" class="block text-gray-900 label-form mb-2">Fecha de la Solicitud: <span
                      class="text-red-400">*</span></label>
                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-calendar-plus"></i>
                    </InputGroupAddon>
                    <Calendar id="date_request" v-model="date_request" showTime hourFormat="24" dateFormat="dd/mm/yy"
                      class="w-full label-form" :class="{ 'p-invalid': date_requestError }" />
                  </InputGroup>
                  <small v-if="date_requestError" class="text-red-400">{{
                    date_requestError
                  }}</small>
                </div>
              </div>
              <div class="mt-4">
                <label for="description_request" class="block text-gray-900 label-form mb-2">Descripción de la
                  Solicitud: <span class="text-red-400">*</span></label>
                <Textarea id="description_request" v-model.trim="description_request" rows="5" cols="30"
                  class="w-full label-form uppercase" :class="{ 'p-invalid': description_requestError }" />
                <small v-if="description_requestError" class="text-red-400">{{
                  description_requestError
                }}</small>
              </div>

              <FileUpload name="adjuntos[]" accept="image/*,.pdf" :maxFileSize="1_000_000" :multiple="true"
                mode="advanced" :auto="false" :customUpload="true" @select="onFileSelect" @remove="onFileRemove">
                <!-- Header simple -->
                <template #header="{ files, chooseCallback }">
                  <div class="flex justify-between items-center w-full p-2">
                    <span class="label-form">{{ files.length }} archivo(s) seleccionado(s)</span>
                    <Button label="EXAMINAR..." icon="pi pi-upload" class="custom-button-blue" size="small" @click="chooseCallback()" />
                  </div>
                </template>

                <template #file="{ file, onRemove }">
                  <div class="flex justify-between items-center p-0 border-b">
                    <span class="label-form">{{ file.name }}</span>
                    <Button icon="pi pi-trash" severity="danger" class="p-button-rounded" @click="onRemove" />
                  </div>
                </template>

                <!-- Vacío para no mostrar grid/preview por defecto -->
                <template #content></template>
                <template #footer></template>
                <template #empty></template>
              </FileUpload>

              <!--
              <FileUpload name="adjuntos[]" accept="image/*,.pdf" :maxFileSize="1_000_000" :multiple="true"
                mode="advanced" :auto="false" :customUpload="true" @select="onFileSelect" @remove="onFileRemove">
                <template #item="{ file, onRemove }">
                  <div class="p-fileupload-preview">
                    <div class="p-fileupload-preview-details">
                      <div>{{ file.name }}</div>
                    </div>

                    <div class="p-fileupload-preview-actions">
                      <Button icon="pi pi-trash" severity="danger" class="p-button-danger" @click="onRemove" />
                      <a :href="file.objectURL" :download="file.name" target="_blank">
                        <Button icon="pi pi-download" severity="info" class="p-button-info" />
                      </a>
                    </div>
                  </div>
                </template>-->

                <!-- ITEM
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

                <template #header="{ files, chooseCallback, clearCallback }">
                  <div class="flex justify-between items-center w-full p-2">
                    <span class="font-bold">{{ files.length }} archivo(s) seleccionado(s)</span>
                    <div class="flex gap-2">
                      <Button label="EXAMINAR..." icon="pi pi-upload" size="small" class="custom-button-blue"
                        @click="chooseCallback()" />
                    </div>
                  </div>
                </template>
              </FileUpload> }}-->
            </div>
            <div class="flex justify-end gap-x-4 mt-8">
              <Button label="Cancelar" severity="secondary" icon="pi pi-times" size="small"
                class="py-2 font-semibold rounded-lg bg-gradient-to-r from-gray-900 to-gray-400 border-0 hover:from-gray-900 hover:to-gray-500"
                @click="cancelRequest" />
              <Button type="submit" label="Guardar Solicitud" size="small"
                class="py-2 font-semibold rounded-lg bg-gradient-to-r custom-button-green" icon="pi pi-plus"
                :loading="loading" />
            </div>
          </div>
        </form>
        <p v-if="serverError" class="text-red-500 text-sm text-center mt-4">
          {{ serverError }}
        </p>
      </Panel>

    </div>
  </div>
</template>

<style scoped>
.p-invalid {
  border-color: #ef4444 !important;
}

.p-select-label {
  font-size: 0.9rem;
}

/* Oculta miniatura, tamaño, badge “Pending”, barra de progreso y separadores */
:deep(.p-fileupload-file-thumbnail),
:deep(.p-fileupload-file-size),
:deep(.p-fileupload-file-badge),
:deep(.p-badge),
:deep(.p-progressbar),
:deep(.p-fileupload-content > .p-divider),
:deep(.p-fileupload-file .p-image),
:deep(.p-fileupload-file .p-fileupload-file-preview) {
  display: none !important;
}

/* Ajusta el layout para que solo quede nombre + botón eliminar */
:deep(.p-fileupload-file) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Opcional: reduce padding del contenedor para quitar “línea” superior */
:deep(.p-fileupload-content) {
  padding-top: 0 !important;
}

/* Opcional: reduce padding del contenedor para quitar “línea” superior */
:deep(.p-fileupload-content) {
  color: #585a59 !important;
  font-size: 0.8rem!important;
}

</style>


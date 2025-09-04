<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
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
import Panel from 'primevue/panel';
import Card from 'primevue/card';
import Column from 'primevue/column';
import Message from 'primevue/message';
import DataTable from 'primevue/datatable';

// Variables de estado
const pageTitle = ref('Importación de Solicitudes PQRS');
const loading = ref(false);
const success = ref(false);
const errors = ref([]);

// Datos para el dropdown de compañías
const selectedCompany = ref(0);
const companies = ref([
  { name: 'PHARMASAN', code: 0 },
  { name: 'PHARMEDIS', code: 1 },
]);


// Lógica de la tabla de campos
const excelFields = ref([
  { name: 'TIPO REMITENTE', condition: 'Obligatorio', description: 'Tipo de remitente de la solicitud PQRS...' },
  { name: 'REMITENTE', condition: 'Obligatorio', description: 'Nombre del remitente...' },
  // ... Agrega el resto de los campos aquí ...
]);

/*
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

const cardcode = ref(_authStore._user.cardcode || '')
const user_id = ref(_authStore._user.id || '')


//validación email
const emailError = ref('');
const emailRemitenteError = ref('');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loading = ref(false);

const validateEmail = (val) =>
  val && !emailRegex.test(val) ? 'Por favor, ingresa un correo electrónico válido.' : ''

const onEmailBlur = () => {
  emailError.value = validateEmail(formData.email)
}

const onRemitenteBlur = () => {
  emailRemitenteError.value = validateEmail(formData.request_sender_email)
}


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

// Estado del formulario
const formData = reactive({

  //Info remitente
  request_sender_email: people?.email?.trim?.() ?? '',
  request_sender_phone: people?.telefono?.trim?.() ?? '',
  request_sender_name: (people?.full_name ?? p?.name ?? '').trim?.() ?? '',

  //Info paciente
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

const handleSubmit = async () => {

  /*
  // Lógica de validación

  //Info remitente requeridos
  errors.request_sender_email = !formData.request_sender_email ? 'Campo requerido.' : '';
  errors.request_sender_phone = !formData.request_sender_phone ? 'Campo requerido.' : '';
  errors.request_sender_name = !formData.request_sender_name ? 'Campo requerido.' : '';

  //Info pacientes requeridos
  errors.type_identification = !formData.type_identification ? 'Campo requerido.' : '';
  errors.identification_number = !formData.identification_number ? 'Campo requerido.' : '';
  errors.first_name = !formData.first_name ? 'Campo requerido.' : '';
  errors.last_name = !formData.last_name ? 'Campo requerido.' : '';
  errors.departamento_id = !formData.departamento_id ? 'Campo requerido.' : '';
  errors.municipio_id = !formData.municipio_id ? 'Campo requerido.' : '';
  errors.mobile_number = !formData.mobile_number ? 'Campo requerido.' : '';

  //Info solicitud requeridos
  errors.type_request = !formData.type_request ? 'Campo requerido.' : '';
  errors.type_classification = !formData.type_classification ? 'Campo requerido.' : '';
  errors.description_request = !formData.description_request ? 'Campo requerido.' : '';
  errors.supersalud = !formData.supersalud ? 'Campo requerido.' : '';
  errors.date_request = !formData.date_request ? 'Campo requerido.' : '';

  //Verificar si hay errores de validacion
  //const hasErrors = Object.values(errors).some(error => error !== '');
  //const hasErrors = Object.values(errors.value).some(error => error !== '') || emailError.value;

  const hasErrors =
    Object.values(errors).some(Boolean) ||
    !!emailError.value ||
    !!emailRemitenteError.value

  if (hasErrors) {
    console.error('Formulario con errores de validación.');
    return;
  }
  */
</script>
<template>

  <div class="w-full lg:w-full flex items-center justify-center p-10 bg-gray-100">
    <div class="w-full">
      <div class="text-center mb-2">
        <h1 class="text-2xl font-bold text-gray-900 text-center mb-6">
          Carga Masiva de Solicitudes
        </h1>
      </div>
      <div class="p-grid p-justify-center">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div class="card b-2 rounded-lg shadow">
            <Card class="h-full-200">
              <template #header>
                <div class="p-card-header bold p-2 bg-gray-100">1. Información Obligatoria</div>
              </template>
              <template #content>
                <div class="p-text-center">
                  <span>
                    Lea detalladamente la información de cada campo de texto
                    <strong><a href="#required_fields">aquí</a></strong>
                  </span>
                </div>
              </template>
            </Card>
          </div>
          <div class="card b-2 rounded-lg shadow">
            <Card class="h-full">
              <template #header>
                <div class="p-card-header bold p-2  p-2 bg-gray-100">2. Descargar Plantilla Excel</div>
              </template>
              <template #content>
                <div class="p-text-center">
                  <Button label="Descargar Plantilla Excel" icon="pi pi-file-excel" severity="secondary"
                    @click="downloadExcelTemplate" />
                </div>
              </template>
            </Card>
          </div>
          <div class="card b-2 rounded-lg shadow">
            <Card class="h-full">
              <template #header>
                <div class="p-card-header bold p-2  p-2 bg-gray-100">3. Importar Plantilla Excel</div>
              </template>
              <template #content>
                <div class="p-fluid">
                  <Dropdown v-if="showCompaniesDropdown" v-model="selectedCompany" :options="companies"
                    optionLabel="name" optionValue="code" placeholder="Seleccione una compañía" class="p-mb-3" />

                  <FileUpload mode="basic" name="file_excel_import[]" url="/api/upload" accept=".xls,.xlsx"
                    :maxFileSize="1000000" @upload="handleUpload" chooseLabel="Seleccionar Archivo" />

                  <Button label="Validar Importación" icon="pi pi-check" severity="success" class="p-mt-3"
                    @click="validateImport" />
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
      <div class="p-4">
        <div class="p-grid p-justify-center p-nogutter">
          <div class="p-col-12 p-md-4">
          </div>
        </div>
        <Panel header="Información de los campos del archivo Excel" id="required_fields" class="p-mt-4">
          <p>En la siguiente tabla se muestran los campos incluidos en el archivo excel con su respectiva condición y
            descripción:</p>
          <div style="overflow-x: auto;">
            <table class="table table-bordered" width="100%">
              <thead class="bg-grey">
                <tr>
                  <th class="bold">NOMBRE DEL CAMPO</th>
                  <th class="bold">CONDICIÓN</th>
                  <th class="bold">DESCRIPCIÓN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center bg-grey bold" colspan="3">CAMPOS DE INFORMACIÓN DEL REMITENTE</td>
                </tr>
                <tr>
                  <td class="text-center"><code>NOMBRE CONTACTO REMITENTE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Nombre del contacto correspondiente al remitente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>CARGO REMITENTE</code></td>
                  <td class="text-center"><span class="label label-default"> Opcional </span></td>
                  <td>Cargo del remitente</td>
                </tr>
                <tr>
                  <td class="text-center"><code>EMAIL CONTACTO REMITENTE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Correo Electrónico del contacto correspondiente al remitente</td>
                </tr>
                <tr>
                  <td class="text-center"><code>TELEFONO CONTACTO REMITENTE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Teléfono del contacto correspondiente al remitente</td>
                </tr>
                <tr>
                  <td class="text-center"><code># RADICADO</code></td>
                  <td class="text-center"><span class="label label-default"> Opcional </span></td>
                  <td>Número del radicado de la solicitud correspondiente a la información del remitente.</td>
                </tr>
                <tr>
                  <td class="text-center bg-grey bold" colspan="3">CAMPOS DE INFORMACIÓN DEL PACIENTE</td>
                </tr>
                <tr>
                  <td class="text-center"><code>TIPO DOCUMENTO PACIENTE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>
                    Tipo de documento del paciente. (Los tipos de documento son: CC, CE, PA, RC, TI, RUT, NIT)
                  </td>
                </tr>
                <tr>
                  <td class="text-center"><code># DOCUMENTO PACIENTE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Número de documento del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>PRIMER NOMBRE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Primer nombre del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>SEGUNDO NOMBRE</code></td>
                  <td class="text-center"><span class="label label-default"> Opcional </span></td>
                  <td>Segundo nombre del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>PRIMER APELLIDO</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Primer apellido del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>SEGUNDO APELLIDO</code></td>
                  <td class="text-center"><span class="label label-default"> Opcional </span></td>
                  <td>Segundo apellido del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>DEPARTAMENTO PACIENTE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Departamento del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>MUNICIPIO PACIENTE</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Municipio del paciente (Tener en cuenta el departamento seleccionado).</td>
                </tr>
                <tr>
                  <td class="text-center"><code># TELEFONO PACIENTE</code></td>
                  <td class="text-center"><span class="label label-default"> Opcional </span></td>
                  <td>Número de teléfono del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>DIRECCION PACIENTE</code></td>
                  <td class="text-center"><span class="label label-default"> Opcional </span></td>
                  <td>Dirección del paciente.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>EMAIL PACIENTE</code></td>
                  <td class="text-center"><span class="label label-default"> Opcional </span></td>
                  <td>Correo Electronico del paciente.</td>
                </tr>

                <tr>
                  <td class="text-center bg-grey bold" colspan="3">CAMPOS DE INFORMACIÓN DE LA SOLICITUD</td>
                </tr>
                <tr>
                  <td class="text-center"><code>TIPO SOLICITUD</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>
                    Tipo de la solicitud.
                  </td>
                </tr>
                <tr>
                  <td class="text-center"><code>CLASIFICACION SOLICITUD</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>
                    Clasificación de la solicitud.
                  </td>
                </tr>
                <tr>
                  <td class="text-center"><code>SUPERSALUD</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>
                    Indicar si es de la supersalud o no
                  </td>
                </tr>
                <tr>
                  <td class="text-center"><code>FECHA SOLICITUD</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Fecha y Hora de la solicitud. (El formato debe ser DD/MM/AAAA HH:mm) la hora en formato de 24
                    horas.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>DESCRIPCION SOLICITUD</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>Descripción de la solicitud.</td>
                </tr>
                <tr>
                  <td class="text-center"><code>ORIGEN SOLICITUD</code></td>
                  <td class="text-center"><span class="label label-danger"> Obligatorio </span></td>
                  <td>
                    Origen de la solicitud.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-invalid {
  border-color: #ef4444 !important;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table.table-bordered {
  border: 1px solid #dee2e6;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border: 1px solid #dee2e6;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
}

.bg-grey {
  background-color: #f8f9fa;
  /* Un gris claro para el fondo */
}

.bold {
  font-weight: bold;
}

.text-center {
  text-align: center;
}

.label {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: bold;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  color: #fff;
  /* Color del texto del label */
}

.label-danger {
  background-color: #ef2b46;
  /* Rojo para los labels 'Obligatorio' */
}

.label-default {
  background-color: #6c757d;
  /* Un gris oscuro para los labels 'Opcional' */
}

/* Estilo para el código de los nombres de campo */
code {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 87.5%;
  color: #e83e8c;
  /* Rosa/morado para los nombres de campo */
  word-wrap: break-word;
}
</style>

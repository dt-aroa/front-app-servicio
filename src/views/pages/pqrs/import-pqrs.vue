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
const _PqrsService = new PqrsService()


const _authStore = useAuthStore()
const cardcode = ref(_authStore._user.cardcode || '')
const user_id = ref(_authStore._user.id || '')
const people = _authStore.getPeople

const downloadExcelTemplate = async () => {
  try {
    const { data, status, headers } = await _PqrsService.getDownloadTemplate(); // Axios response

    if (status !== 200) throw new Error(`HTTP ${status}`);

    const contentType = headers['content-type'] || 'application/octet-stream';
    const dispo = headers['content-disposition'] || '';

    let filename = 'plantilla_pqrs.xlsx';
    const m = dispo.match(/filename\*?=(?:UTF-8'')?("?)([^"]+)\1/i);
    if (m && m[2]) filename = decodeURIComponent(m[2]);

    const blob = data instanceof Blob ? data : new Blob([data], { type: contentType });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error al descargar plantilla:', e);
  }
};

const file = ref(null)
const fileInput = ref(null)

const onFileChange = (event) => {
  const picked = event.target.files[0]
  if (picked) {
    file.value = picked
  }
}

const validateImport = async () => {
  if (!file.value) {
    alert('Debe seleccionar un archivo Excel primero')
    return
  }

  const formData = new FormData()
  //campos de texto remitente
  formData.append('cardcode', (cardcode.value));
  formData.append('user_id', (user_id.value));
  formData.append('file_excel_import', file.value)

  try {
    const res = await fetch('http://localhost:3035/api/pqrs/importPQRS', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    console.log('Validación OK:', data)
    alert('Validación completada correctamente')
  } catch (err) {
    console.error(err)
    alert('Error al validar importación')
  }
}

/*
// Datos de ejemplo (ajusta a tu fuente real)
const companies = ref([
  { code: 0, name: 'PHARMASAN' },
  { code: 1, name: 'PHARMEDIS' },
])
const selectedCompany = ref(null)

const uploader = ref(null)
const file = ref(null)

const selectedCompanyLabel = computed(() => {
  if (!selectedCompany.value) return 'Sin compañía seleccionada'
  const c = companies.value.find(x => x.code === selectedCompany.value)
  return c ? `Compañía: ${c.name}` : 'Sin compañía seleccionada'
})

const canValidate = computed(() => !!file.value /* && selectedCompany.value !== null */

/*

// Helpers
const prettyBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const validExtension = (name) => /\.(xlsx|xls)$/i.test(name)

// Eventos
const onSelect = (e) => {
  const f = e.files?.[0]
  if (!f) return

  // Validaciones
  if (!validExtension(f.name)) {
    alert('Formato inválido. Debe ser .xls o .xlsx')
    // Limpia selección UI
    uploader.value?.clear()
    return
  }
  if (f.size > MAX_SIZE) {
    alert(`El archivo excede el máximo permitido (${prettyBytes(MAX_SIZE)}).`)
    uploader.value?.clear()
    return
  }

  // Solo un archivo: guardamos el primero y limpiamos resto
  file.value = f
  // Si FileUpload retiene lista interna, limpiamos la UI para evitar confusión
  // y dejamos el preview como "fuente de verdad"
  uploader.value?.clear()
}

const removeFile = () => {
  file.value = null
  uploader.value?.clear()
}

const validateImport = async () => {
  if (!file.value) {
    alert('Seleccione un archivo Excel antes de validar.')
    return
  }

  const formData = new FormData()
  if (selectedCompany.value !== null) {
    formData.append('company', selectedCompany.value)
  }
  formData.append('file_excel_import', file.value)

  try {
    const res = await fetch('http://localhost:3035/api/pqrs/validateImport', {
      method: 'POST',
      body: formData,
      // credentials: 'include',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json().catch(() => ({}))
    console.log('Validación OK:', data)
    alert('Validación completada correctamente.')
  } catch (err) {
    console.error(err)
    alert('Ocurrió un error al validar la importación.')
  }
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
                  <Button label="Descargar Plantilla Excel" icon="pi pi-file-excel" severity="info"
                    @click="downloadExcelTemplate" />
                </div>
              </template>
            </Card>
          </div>
          <div class="card b-2 rounded-lg shadow">
            <Card>
              <template #header>
                <div class="p-card-header bold p-2 bg-gray-100">
                  3. Cargar e Importar Plantilla Excel
                </div>
              </template>

              <template #content>
                <div class="flex items-center gap-2">
                  <!-- Input file oculto -->
                  <input ref="fileInput" type="file" accept=".xls,.xlsx" class="hidden" @change="onFileChange" />

                  <!-- Botón examinar -->
                  <Button label="Examinar..." icon="pi pi-folder-open" severity="secondary"
                    @click="fileInput.click()" />

                  <!-- Nombre del archivo seleccionado -->
                  <span class="text-sm">
                    {{ file ? file.name : 'Ningún archivo seleccionado' }}
                  </span>
                </div>

                <!-- Botón validar debajo -->
                <div class="mt-4">
                  <Button label="Validar Importación" icon="pi pi-check" severity="success" :disabled="!file"
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

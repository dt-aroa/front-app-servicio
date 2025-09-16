<script setup>
import { ref, computed, onMounted, watchEffect, getCurrentInstance } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth/auth.store'
import PqrsService from '@/services/pqrs/pqrs.service.js'
import Dropdown from 'primevue/dropdown';
import { toYMD } from '@/utils/dates.js';
import { useRouter } from 'vue-router';
import Panel from 'primevue/panel';
import Fieldset from 'primevue/fieldset';
import { messageSuccess, messageError } from '../../../utils/messages';

/***********variables y reference */
const _PqrsService = new PqrsService()
const _authStore = useAuthStore()
const router = useRouter()

const user_id = ref('')
const cardcode = ref('')
const expandedRows = ref([]);
const permisoSupervisor = ref(false)
const today = new Date();


const statusInternalOptions = ref([
  { label: 'Todas', value: '' },
  { label: 'Solicitudes Abiertas', value: 1 },
  { label: 'Solicitudes En Proceso', value: 2 },
  { label: 'Solicitudes Cerradas', value: 3 },
]);

const descriptionstatusInternalOptions = ref([
  { label: 'Abierta', value: 1 },
  { label: 'Proceso', value: 2 },
  { label: 'Cerrada', value: 3 },
]);

const descriptionstatusUserOptions = ref([
  { label: 'Recibo y radicación en el sistema', value: 1, class: 'tag-abierta' },
  { label: 'Verificación de la solicitud', value: 2, class: 'tag-abierta' },
  { label: 'Asignación de funcionario', value: 3, class: 'tag-abierta' },
  { label: 'Evaluacón de la socilitud', value: 4, class: 'tag-abierta' },
  { label: 'Envío respuesta', value: 5, class: 'tag-cerrada' },
]);


const pqrsClientes = ref([]) // Datos de datatable PQRS del cliente
const grandTotal = ref(null) // total sin filtrar (si aplica)


// estado tabla
const rows = ref([])                // datos
const loading = ref(false)
const totalRecords = ref(0)

// estado de paginación/sort (controlado por DataTable en modo lazy)
const first = ref(0)                // índice inicial (offset visual)
const pageSize = ref(10)            // filas por página
const sortField = ref(null)         // string
const sortOrder = ref(null)         // 1 (asc) | -1 (desc)
const multiSortMeta = ref(null)     // [{field, order}, ...]

/** Convierte el sort de PrimeVue → query del backend.
 *  multiSort: "request_number:asc,account_number:desc"
 */
function buildSortParam() {
  if (multiSortMeta.value && Array.isArray(multiSortMeta.value) && multiSortMeta.value.length) {
    return multiSortMeta.value
      .map(s => `${s.field} ${s.order === -1 ? 'DESC' : 'ASC'}`)
      .join(',')
  }
  if (sortField.value) {
    return `${sortField.value} ${sortOrder.value === -1 ? 'DESC' : 'ASC'}`
  }
  return '' // sin orden
}

onMounted(() => {
  const permissionToFind = 'pharmasan.siau.pqrs';
  if (!_authStore.getPermissions.includes(permissionToFind)) {
    messageError("Usuario no autorizado ")
    handleLogout();
    return;
  }

  user_id.value = _authStore.getUser.user_id || _authStore._user.id

  if (_authStore.getPermissions.includes('pharmasan.siau.pqrs.supervisor')) {
    cardcode.value = _authStore.getUser.cardcode;
    permisoSupervisor.value = true;
  }


  setTimeout(() => {
    loadData();
  }, 1000); // <-- Sin comillas
});

const handleLogout = async () => {
  await _authStore.logout()
  await router.push({ name: 'login' })
}


const filters = ref({
  request_number: '',
  identification_number: '',
  request_created_at_desde: null,
  request_created_at_hasta: '',
  request_status_internal: '',
});

function restablecerFiltros() {
  filters.value.request_number = '';
  filters.value.identification_number = '';
  filters.value.request_created_at_desde = '';
  filters.value.request_created_at_hasta = '';
  filters.value.request_status_internal = '';
  loadData();
}

async function loadData(event) {

  // Formatear las fechas a 'YYYY-MM-DD' si están definidas
  const request_created_at_desde_fmt = toYMD(filters.value.request_created_at_desde);
  const request_created_at_hasta_fmt = toYMD(filters.value.request_created_at_hasta);

  const page = Math.floor(first.value / pageSize.value) + 1 // página 1-based

  const sort = buildSortParam()

  // Lógica para enviar los filtros a la API
  const params = {
    request_number: filters.value.request_number,
    identification_number: filters.value.identification_number,
    request_created_at_desde: request_created_at_desde_fmt,
    request_created_at_hasta: request_created_at_hasta_fmt,
    request_status_internal: filters.value.request_status_internal,
    user_id: user_id.value,
    page,
    pageSize: pageSize.value,
    sort,
    permisoSupervisor: permisoSupervisor.value,
    cardcode: cardcode.value
  };

  try {
    // Realiza la llamada a la API
    const response = await _PqrsService.getPqrsCliente(params);

    if (response.status !== 200) {
      throw new Error(`Error al obtener las PQRS: ${response.status}`);
    }

    pqrsClientes.value = response.data.pqrsClientes
    totalRecords.value = response.data.grandTotal;

  } catch (error) {
    console.error('Fallo al obtener los datos:', error);
  }
}

async function downLoadExcel() {

  // Formatear las fechas a 'YYYY-MM-DD' si están definidas
  const request_created_at_desde_fmt = toYMD(filters.value.request_created_at_desde);
  const request_created_at_hasta_fmt = toYMD(filters.value.request_created_at_hasta);

  const page = Math.floor(first.value / pageSize.value) + 1 // página 1-based

  const sort = buildSortParam()

  // Lógica para enviar los filtros a la API
  const params = {
    request_number: filters.value.request_number,
    identification_number: filters.value.identification_number,
    request_created_at_desde: request_created_at_desde_fmt,
    request_created_at_hasta: request_created_at_hasta_fmt,
    request_status_internal: filters.value.request_status_internal,
    user_id: user_id.value,
    page: "0",
    pageSize: "",
    sort,
    permisoSupervisor: permisoSupervisor.value,
    cardcode: cardcode.value
  };

  try {
    // Realiza la llamada a la API
    const { data, status, headers } = await _PqrsService.getPqrsClienteExcel(params); // Axios response

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

  } catch (error) {
    console.error('Fallo al obtener los datos:', error);
  }
}

// Función que navega al detalle de la pqrs
function goToDetails(id) {
  router.push({
    name: 'pharmasan.siau.pqrs.details',
    params: { id: id }
  });
}

function fechaISO(date) {
  const fecha = new Date(date);
  const opciones = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Formato de 24 horas
  };

  const fechaFormateada = new Intl.DateTimeFormat('es-CO', opciones).format(fecha);
  return fechaFormateada;
}

const getStatusClass = (statusValue) => {
  const option = descriptionstatusUserOptions.value.find(
    (opt) => opt.value === statusValue
  );
  return option ? option.class : '';
};

// --- Manejadores de eventos del DataTable ---

// Se llama cuando cambias de página
function onPage(ev) {
  first.value = ev.first;
  pageSize.value = ev.rows;
  loadData(); // Llama a la función que carga los datos
}

// Se llama cuando haces clic para ordenar una columna
function onSort(ev) {
  sortField.value = ev.sortField || null;
  sortOrder.value = ev.sortOrder || null;
  multiSortMeta.value = ev.multiSortMeta || null;
  first.value = 0; // Vuelve a la primera página al ordenar
  loadData();
}

/* Se llama con el botón "Buscar"
function onSearch() {
  first.value = 0; // Vuelve a la primera página en una nueva búsqueda
  loadData();
}

watchEffect(() => {
  loading.value = false
})

function descriptionStatusInternal(value) {
  const option = descriptionstatusInternalOptions.value.find(option => option.value === value);
  return option ? option.label : 'Estado Desconocido';;
}

/*

function onPage(ev) {
  first.value = ev.first
  pageSize.value = ev.rows
  loadData()
}

function onSort(ev) {
  sortField.value = ev.sortField || null
  sortOrder.value = ev.sortOrder || null
  multiSortMeta.value = ev.multiSortMeta || null
  // cuando cambia el orden, vuelve a la primera página
  first.value = 0
  loadData()
}

*/

</script>

<template>
  <div class="w-full lg:w-full flex page-panel-main">
    <div class="w-full">
      <Panel :pt="panelStyles" class="w-full  shadow-lg rounded-lg overflow-hidden">
        <template #header>
          <div class="flex items-center gap-2">
            <i class="pi pi-file text-x"></i>
            <span class="text-blue-500 font-bold text-title-panel">Seguimiento de PQRS</span>
          </div>
        </template>
        <!----filtros-->

        <Panel toggleable class="p-card bg-white-200">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-filter-fill text-xl pr-2" style="color: #4F46E5;"></i>
              <span class="text-blue-500 font-bold text-subtitle-card">Filtros Búsqueda</span>
            </div>
          </template>
          <div class="bg-white rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div class="col-span-1">
                <label for="request_status_internal" class="block label-form font-bold">Estado
                  Solicitud</label>
                <Dropdown id="request_status_internal" v-model="filters.request_status_internal"
                  :options="statusInternalOptions" optionLabel="label" optionValue="value"
                  placeholder="Seleccione una opción" class="w-full" />
              </div>
              <div class="col-span-1">
                <label for="request_number" class="block label-form font-bold">Radicado</label>
                <InputText id="request_number" v-model="filters.request_number" class="w-full" />
              </div>
              <div class="col-span-1">
                <label for="identification_number" class="block label-form font-bold">Documento
                  Paciente</label>
                <InputText id="identification_number" v-model="filters.identification_number" class="w-full" />
              </div>
              <div class="col-span-1">
                <label for="request_created_at_desde" class="block label-form font-bold">Fecha desde</label>
                <Calendar id="request_created_at_desde" v-model="filters.request_created_at_desde" dateFormat="dd/mm/yy"
                  :maxDate="today" showIcon class="w-full" />
              </div>
              <div class="col-span-1">
                <label for="request_created_at_hasta" class="block label-form font-bold">Fecha hasta</label>
                <Calendar id="request_created_at_hasta" v-model="filters.request_created_at_hasta" dateFormat="dd/mm/yy"
                  :minDate="filters.request_created_at_desde" :maxDate="today" showIcon class="w-full" />
              </div>
              <div
                class="col-span-1 md:col-span-2 lg:col-span-5 flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 md:justify-end">
                <Button label="Buscar" icon="pi pi-search" class="p-button-sm w-full sm:w-auto custom-button-green"
                  @click="loadData" />
                <Button label="Limpiar filtros" icon="pi pi-times"
                  class="p-button-sm w-full sm:w-auto custom-button-pink" @click="restablecerFiltros" />
                <Button label="Descargar" icon="pi pi-file-excel"
                  class="p-button-sm w-full sm:w-auto custom-button-blue" @click="downLoadExcel" />

              </div>
            </div>
          </div>
        </Panel>
        <!--
        <div class="p-card-header bold  bg-white-200 pb-8">
          <i class="pi pi-filter-fill text-xl pr-2" style="color: #4F46E5;"></i>
          <span class="text-blue-500 font-bold text-subtitle-card">Filtros Búsqueda</span>
        </div>
        <div class="bg-white rounded-lg mb-6 flex flex-wrap gap-4 items-end">
          <div class="flex-grow">
            <label for="request_status_internal" class="block text-sm font-medium font-bold">Estado Solicitud</label>
            <Dropdown id="request_status_internal" v-model="filters.request_status_internal"
              :options="statusInternalOptions" optionLabel="label" optionValue="value"
              placeholder="Seleccione una opción" class="w-full" />
          </div>
          <div class="flex-grow">
            <label for="request_number" class="block text-sm font-medium font-bold">Radicado</label>
            <InputText id="request_number" v-model="filters.request_number" class="w-full" />
          </div>
          <div class="flex-grow">
            <label for="identification_number" class="block text-sm font-medium font-bold">Documento Paciente</label>
            <InputText id="identification_number" v-model="filters.identification_number" class="w-full" />
          </div>
          <div class="flex-grow">
            <label for="request_created_at_desde" class="block text-sm font-medium font-bold">Fecha desde</label>
            <Calendar id="request_created_at_desde" v-model="filters.request_created_at_desde" dateFormat="dd/mm/yy"
              showIcon class="w-full" />
          </div>
          <div class="flex-grow">
            <label for="request_created_at_hasta" class="block text-sm font-medium font-bold">Fecha hasta</label>
            <Calendar id="request_created_at_hasta" v-model="filters.request_created_at_hasta" dateFormat="dd/mm/yy"
              showIcon class="w-full" />
          </div>

          <div class="bg-white rounded-lg flex flex-wrap gap-4 items-end">
            <div class="flex-grow flex flex-col md:flex-row gap-4">
              <Button label="Buscar" icon="pi pi-search" class="p-button-sm" @click="loadData" />
              <Button label="Limpiar filtros" icon="pi pi-times" class="p-button-sm" severity="danger"
                @click="restablecerFiltros" />
              <Button label="Descargar" icon="pi pi-file-excel" class="p-button-sm" severity="info"
                @click="downLoadExcel" />
            </div>
          </div>
        </div>
      -->
        <!--fin filtros-->

        <Panel toggleable class="p-card bg-white-200 mt-2">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-comment text-xl pr-2" style="color: #4F46E5;"></i>
              <span class="text-blue-500 font-bold text-subtitle-card">Listado de PQRS</span>
            </div>
          </template>

          <!--DataTable :value="pqrsClientes" showGridlines :paginator="true" :rows="pageSize" :totalRecords="totalRecords"
            v-model:first="first" lazy :loading="loading" @page="onPage" @sort="onSort" :size="'small'"
            class="p-datatable-custom" v-model:selection="selectedProduct" selectionMode="single"
            @rowSelect="onRowSelect" @rowUnselect="onRowUnselect"
            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="Mostrando registros del {first} a {last} de un total {totalRecords}"
            @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" v-model:expandedRows="expandedRows" dataKey="request_id">
        -->
          <DataTable :value="pqrsClientes" showGridlines :paginator="true" :rows="pageSize" :totalRecords="totalRecords"
            v-model:first="first" lazy :loading="loading" @page="onPage" @sort="onSort" :size="'small'"
            class="p-datatable-custom" v-model:selection="selectedProduct" selectionMode="single"
            @rowSelect="onRowSelect" @rowUnselect="onRowUnselect"
            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="Mostrando registros del {first} a {last} de un total {totalRecords}"
            @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" v-model:expandedRows="expandedRows"
            dataKey="request_id">

            <Column expander style="width: 2rem" />
            <template #expansion="slotProps">
              <div class="p-4">
                <p>Descripción: {{ slotProps.data.request_description }}</p>
              </div>
            </template>
            <Column header="Acciones" :exportable="false">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <Button icon="pi pi-eye" severity="success" class="p-button-rounded p-button-sm text-white"
                    @click="goToDetails(slotProps.data.request_id)" title="Ver Registro" />
                </div>
              </template>
            </Column>
            <template #rowexpansion="slotProps">
              <div class="p-4 bg-gray-50 rounded-lg">
                <h5 class="text-lg font-semibold mb-2">Descripción del Reporte:</h5>
                <div v-html="slotProps.data.request_description" class="prose max-w-none"></div>
              </div>
            </template>

            <!-- Número de radicado -->
            <Column field="request_number" header="Núm Solicitud" sortable style="min-width: 5rem"
              headerClass="text-center" />

            <!-- Fecha Registro en el sistema -->
            <Column field="request_created_at" header="Fecha Creación" sortable style="min-width: 5rem"
              headerClass="text-center">
              <template #body="slotProps">
                {{ fechaISO(slotProps.data.request_created_at) }}
              </template>
            </Column>

            <!-- Fecha Registro en el sistema -->
            <Column field="request_date" header="Fecha Solicitud" sortable style="min-width: 50px"
              headerClass="text-center">
              <template #body="slotProps">
                {{ fechaISO(slotProps.data.request_date) }}
              </template>
            </Column>

            <!-- Tipo PQRS-->
            <Column field="type_request_name" header="Tipo Solicitud" sortable style="min-width: 50px"
              headerClass="text-center" />

            <!-- Cliente PQRS  -->
            <Column field="cliente_u_phr_name" header="Cliente" sortable style="min-width: 50px"
              headerClass="text-center" />

            <!-- Remitente PQRS  -->
            <Column field="nombre_remitente" header="Remitente" sortable style="min-width: 50px"
              headerClass="text-center" />

            <!-- Nombre paciente/ -->
            <Column field="nombre_completo" header="Paciente" sortable style="min-width: 200px"
              headerClass="text-center" />

            <!-- documento Paciente  -->
            <Column field="account_number" header="Num. Paciente" sortable style="min-width: 100px"
              headerClass="text-center" />

            <!-- Asignado A
            <Column field="asignado_a" header="Asignado a" sortable style="min-width: 150px"
              headerClass="text-center" />
            -->
            <!-- Estado Solicitud -->
            <Column field="request_status_internal" header="Estado Solicitud" sortable style="min-width: 100px">
              <template #body="slotProps">
                <div :class="['status-tag', getStatusClass(slotProps.data.request_status_user_id)]">
                  {{descriptionstatusUserOptions.find(opt => opt.value ===
                  slotProps.data.request_status_user_id)?.label}}
                </div>
              </template>
            </Column>

            <!-- Plantillas para vacío y loading -->
            <template #empty>
              <div class="p-6 text-center text-sm text-gray-500">Sin datos.</div>
            </template>

            <template #loading>
              <div class="p-6 text-center text-sm">Cargando...</div>
            </template>

          </DataTable>
        </Panel>
      </Panel>
    </div>
  </div>

</template>

<style scoped></style>
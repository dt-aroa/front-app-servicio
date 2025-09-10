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

/***********variables y reference */
const _PqrsService = new PqrsService()
const _authStore = useAuthStore()
const router = useRouter()

const cardcode = ref(_authStore._user.cardcode || '')
const user_id = ref(_authStore.getUser.user_id || _authStore._user.id)

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

onMounted(() => {
  setTimeout(() => {
    loadData();
  }, 1000); // <-- Sin comillas
});

const filters = ref({
  request_number: '',
  identification_number: '',
  request_created_at_desde: null,
  request_created_at_hasta: '',
  request_status_internal: '',
});

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
    sort
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

// Función que navega al detalle de la pqrs
function goToDetails(id) {
  console.log("idddd::" + id);
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

function descriptionStatusInternal(value) {
  const option = descriptionstatusInternalOptions.value.find(option => option.value === value);
  return option ? option.label : 'Estado Desconocido';;
}



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

// Se llama con el botón "Buscar"
function onSearch() {
  first.value = 0; // Vuelve a la primera página en una nueva búsqueda
  loadData();
}


watchEffect(() => {
  loading.value = false
})

</script>

<template>
  <div class="w-full lg:w-full flex items-center justify-center p-20 bg-white-100">
    <div class="w-full">
      <div class="text-center mb-2">
        <h1 class="text-2xl font-bold text-gray-900 text-center mb-6">
          Listado de PQRS
        </h1>
      </div>
      <div class="p-4 bg-white rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label for="request_status_internal" class="block text-sm font-medium text-gray-700">Estado Solicitud</label>

          <Dropdown id="request_status_internal" v-model="filters.request_status_internal"
            :options="statusInternalOptions" optionLabel="label" optionValue="value" placeholder="Seleccione una opción"
            class="w-full" />
        </div>
        <div class="flex-grow">
          <label for="request_number" class="block text-sm font-medium text-gray-700">Radicado</label>
          <InputText id="request_number" v-model="filters.request_number" class="mt-1 w-full" />
        </div>
        <div class="flex-grow">
          <label for="identification_number" class="block text-sm font-medium text-gray-700">Documento
            Paciente</label>
          <InputText id="identification_number" v-model="filters.identification_number" class="mt-1 w-full" />
        </div>
        <div class="flex-grow">
          <label for="request_created_at_desde" class="block text-sm font-medium text-gray-700">Fecha desde</label>
          <Calendar id="request_created_at_desde" v-model="filters.request_created_at_desde" dateFormat="dd/mm/yy"
            showIcon class="mt-1 w-full" />
        </div>
        <div class="flex-grow">
          <label for="request_created_at_hasta" class="block text-sm font-medium text-gray-700">Fecha hasta</label>
          <Calendar id="request_created_at_hasta" v-model="filters.request_created_at_hasta" dateFormat="dd/mm/yy"
            showIcon class="mt-1 w-full" />
        </div>

        <div class="flex items-end">
          <Button label="Buscar" icon="pi pi-search" class="p-button-sm" @click="loadData" />
        </div>
      </div>

      <DataTable :value="pqrsClientes" :paginator="true" :rows="pageSize" :totalRecords="totalRecords"
        v-model:first="first" lazy :loading="loading" @page="onPage" @sort="onSort"
        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="Mostrando registros del {first} a {last} de un total {totalRecords}">

        <!--
      <DataTable :value="pqrsClientes" :paginator="true" :rows="10" :totalRecords="totalRecords" v-model:first="first"
        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="Mostrando registros del {first} a {last} de un total {totalRecords}"
        @page="onPage" 
        >
    -->
        <Column style="width: 5rem; text-align: center">
          <template #body="slotProps">
            <Button icon="pi pi-eye" class="p-button-rounded p-button-sm bg-blue-500 text-white"
              @click="goToDetails(slotProps.data.request_id)" title="Ver Registro" />
          </template>
        </Column>

        <!-- Número de radicado -->
        <Column field="request_number" header="Núm Solicitud" sortable style="min-width: 160px"
          headerClass="text-center" />

        <!-- Fecha Registro en el sistema -->
        <Column field="request_created_at" header="Fecha Creación" sortable style="min-width: 160px"
          headerClass="text-center">
          <template #body="slotProps">
            {{ fechaISO(slotProps.data.request_created_at) }}
          </template>
        </Column>

        <!-- Fecha Registro en el sistema -->
        <Column field="request_date" header="Fecha Solicitud" sortable style="min-width: 160px"
          headerClass="text-center">
          <template #body="slotProps">
            {{ fechaISO(slotProps.data.request_date) }}
          </template>
        </Column>

        <!-- Tipo PQRS-->
        <Column field="type_request_name" header="Tipo Solicitud" sortable style="min-width: 220px"
          headerClass="text-center" />

        <!-- Cliente PQRS  -->
        <Column field="cliente_u_phr_name" header="Cliente" sortable style="min-width: 180px"
          headerClass="text-center" />

        <!-- Remitente PQRS  -->
        <Column field="nombre_remitente" header="Remitente" sortable style="min-width: 180px"
          headerClass="text-center" />

        <!-- Nombre paciente/ -->
        <Column field="nombre_completo" header="Paciente" sortable style="min-width: 180px" headerClass="text-center" />

        <!-- documento Paciente  -->
        <Column field="account_number" header="Num. Paciente" sortable style="min-width: 180px"
          headerClass="text-center" />

        <!-- Asignado A-->
        <Column field="asignado_a" header="Asignado a" sortable style="min-width: 150px" headerClass="text-center" />

        <!-- Estado Solicitud -->
        <Column field="request_status_user_name" header="Estado" sortable style="min-width: 150px"
          headerClass="text-center" />

        <!-- Estado Sistema -->
        <Column field="request_status_internal" header="Fecha Creación" sortable style="min-width: 160px"
          headerClass="text-center">
          <template #body="slotProps">
            {{ descriptionStatusInternal(slotProps.data.request_status_internal) }}
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
    </div>
  </div>

</template>

<style>

.p-datatable-thead th .p-column-header-content {
  display: flex;
  justify-content: center;
  text-align: center !important;
  width: 100%;
}

</style>
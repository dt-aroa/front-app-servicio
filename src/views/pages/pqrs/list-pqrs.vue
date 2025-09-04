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

/***********variables y reference */
const _PqrsService = new PqrsService()
const _authStore = useAuthStore()
const cardcode = ref(_authStore._user.cardcode || '')
const user_id = ref(_authStore._user.id || '')
const statusInternalOptions = ref([
  { label: 'Todas', value: '' },
  { label: 'Solicitudes Abiertas', value: 1 },
  { label: 'Solicitudes En Proceso', value: 2 },
  { label: 'Solicitudes Cerradas', value: 3 },
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

/*
// Texto “Mostrando registros del X al Y…”
const pageReport = computed(() => {
  const total = totalRecords.value || 0
  if (!total) return 'Sin registros'
  const start = first.value + 1
  const end = Math.min(first.value + rows.value.length, total)
  const base = `Mostrando registros del ${start} al ${end} de un total de ${total} registros`
  return grandTotal.value != null
    ? `${base} (filtrado de un total de ${grandTotal.value.toLocaleString()} registros)`
    : base
})
*/
/** Convierte el sort de PrimeVue → query del backend.
 *  multiSort: "request_number:asc,account_number:desc"
 */
function buildSortParam() {
  if (multiSortMeta.value && Array.isArray(multiSortMeta.value) && multiSortMeta.value.length) {
    return multiSortMeta.value
      .map(s => `${s.field}:${s.order === -1 ? 'desc' : 'asc'}`)
      .join(',')
  }
  if (sortField.value) {
    return `${sortField.value}:${sortOrder.value === -1 ? 'desc' : 'asc'}`
  }
  return '' // sin orden
}

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

onMounted(loadData)

const filters = ref({
  request_number: '',
  identification_number: '',
  request_created_at_desde: null,
  request_created_at_hasta: '',
  request_status_internal: '',
});

async function loadData() {
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

    console.log("response");
    console.log(response);

    pqrsClientes.value = response.data.pqrsClientes



    rows.value = response.data.rows || []
    //totalRecords.value = Number(response.data.totalFilter || 0)
    // si decides enviar grandTotal también, úsalo; si no, quedará null y el texto se ajusta solo
    grandTotal.value = typeof response.data.grandTotal === 'number' ? response.data.grandTotal : null

    totalRecords.value = response.data.grandTotal;


    //totalRecords.value = response.pqrsClientes.length

    /*
        console.log(response.data.pqrsClientes);
        pqrsClientes.value = response.data.pqrsClientes
        totalRecords.value = response.pqrsClientes.length
    
        //clasificaciones.value = response.data.clasificaciones; // Asumimos que la API retorna un array "clasificaciones"
       
    
        const data = await response.json();
        console.log('Datos recibidos:', data);*/
    // Aquí puedes actualizar el estado de tu componente con los datos
  } catch (error) {
    console.error('Fallo al obtener los datos:', error);
  }
}

/*
// Dentro del mismo componente o en un archivo de servicio
const getPqrsCliente = async (filterParams) => {
  // Construye un objeto con solo los filtros que tienen valor
  const activeFilters = Object.fromEntries(
    Object.entries(filterParams).filter(([_, value]) => value !== null && value !== '')
  );

  // Convierte los filtros en una cadena de consulta para la URL
  const queryString = new URLSearchParams(filterParams).toString();

  try {
    // Realiza la llamada a la API
    //const response = await fetch(`/api/getPqrsCliente?${queryString}`);

    const result = await _PqrsService.getPqrsCliente(queryString);

    console.log('Respuesta de la API:', result);

    if (!response.ok) {
      throw new Error('Error en la consulta de PQRs');
    }

    const data = await response.json();
    console.log('Datos recibidos:', data);
    // Aquí puedes actualizar el estado de tu componente con los datos
  } catch (error) {
    console.error('Fallo al obtener los datos:', error);
  }
};
*/


/*
// Estado de paginación/ordenamiento (para modo lazy)
const first = ref(0) // índice del primer registro de la página actual
const rowsPerPage = ref(10)
const totalRecords = ref(0)

// Orden simple o múltiple
const sortField = ref(null) // cuando usas sortMode="single"
const sortOrder = ref(null)
const multiSortMeta = ref([]) // cuando usas sortMode="multiple"

// Datos locales (mock). En modo real, vendrán de la API según página/orden.
const allData = ref(generateMock(137))

// Recalcular datos paginados y ordenados en el cliente para el esqueleto
const rows = computed(() => {
  let data = [...allData.value]

  // Ordenamiento simple
  if (sortField.value && sortOrder.value) {
    data.sort((a, b) => compare(a[sortField.value], b[sortField.value]) * sortOrder.value)
  }

  // Ordenamiento múltiple
  if (!sortField.value && multiSortMeta.value?.length) {
    data.sort((a, b) => {
      for (const s of multiSortMeta.value) {
        const res = compare(a[s.field], b[s.field])
        if (res !== 0) return res * (s.order || 1)
      }
      return 0
    })
  }

  totalRecords.value = data.length
  return data.slice(first.value, first.value + rowsPerPage.value)
})

function onPage(event) {
  // event = { first, rows, page }
  first.value = event.first
  rowsPerPage.value = event.rows
  // En modo real: fetch al servidor con paginación
}

function onSort(event) {
  // event = { sortField, sortOrder, multiSortMeta }
  sortField.value = event.sortField ?? null
  sortOrder.value = event.sortOrder ?? null
  multiSortMeta.value = event.multiSortMeta ?? []
  // En modo real: fetch al servidor con ordenamiento
}

function compare(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  const na = isNaN(a) ? a : Number(a)
  const nb = isNaN(b) ? b : Number(b)
  if (typeof na === 'number' && typeof nb === 'number') return na - nb
  return String(a).localeCompare(String(b))
}

/*
// ---- MOCK DATA ----
function generateMock(count = 50) {
  const nombres = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fabio', 'Gina', 'Hugo', 'Iris', 'Jairo']
  const apellidos = ['Roa', 'Gómez', 'Pérez', 'López', 'Martínez', 'Santos', 'Torres', 'Vargas']
  const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Manizales']
  const paises = ['Colombia', 'Perú', 'Chile', 'México', 'Argentina']
  const estados = ['Activo', 'Inactivo', 'Suspendido']
  const roles = ['Admin', 'Editor', 'Viewer', 'Soporte']

  const out = []
  for (let i = 1; i <= count; i++) {
    const nombre = pick(nombres)
    const apellido = pick(apellidos)
    const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@mail.com`
    out.push({
      id: i,
      nombre,
      apellido,
      email,
      telefono: `+57 3${Math.floor(100000000 + Math.random() * 899999999)}`,
      ciudad: pick(ciudades),
      pais: pick(paises),
      estado: pick(estados),
      fechaRegistro: new Date(2022 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)).toISOString().slice(0, 10),
      rol: pick(roles)
    })
  }
  return out
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
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

const sanitizeDateISO = (v) => {
  if (!v) return ''
  const d = typeof v === 'string' ? new Date(v) : v
  if (isNaN(d)) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
*/
// Simular carga inicial (solo visual)


function formatDate(dateString) {
  if (!dateString) return '';
  return dateString.slice(0, 10); // Toma los primeros 10 caracteres (YYYY-MM-DD)
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

      <DataTable :value="pqrsClientes" :paginator="true" :rows="10" :totalRecords="totalRecords" v-model:first="first"
        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="Mostrando registros del {first} a {last} de un total {totalRecords}">

        <!--
      <DataTable :value="pqrsClientes" dataKey="request_id" :loading="loading" :paginator="true" :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]" :totalRecords="totalRecords" :lazy="true" @page="onPage" :first="first"
        :sortField="sortField" :sortOrder="sortOrder" :multiSortMeta="multiSortMeta" sortMode="multiple"
        responsiveLayout="scroll" showGridlines stripedRows>
    -->
        <!-- Número de radicado -->
        <Column field="request_number" header="Núm Solicitud" sortable style="min-width: 160px"  headerClass="text-center" />

        <!-- Fecha Registro en el sistema -->
        <Column field="request_date" header="Fecha Registro" sortable style="min-width: 160px" headerClass="text-center">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.request_date) }}
          </template>
        </Column>
        <!-- Remitente PQRS  -->
        <Column field="cliente_u_phr_name" header="Remitente" sortable style="min-width: 180px" headerClass="text-center"/>

        <!-- Tipo PQRS-->
        <Column field="type_request_name" header="Tipo Solicitud" sortable style="min-width: 220px" headerClass="text-center"/>

        <!-- documento Paciente  -->
        <Column field="account_number" header="Doc. Paciente" sortable style="min-width: 180px" headerClass="text-center" />

        <!-- Nombre paciente/ -->
        <Column field="nombre_completo" header="Paciente" sortable style="min-width: 180px"  headerClass="text-center"/>

        <!-- Dirección -->
        <Column field="request_status_user_name" header="Estado" sortable style="min-width: 150px" headerClass="text-center" />

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

/* Solución definitiva para centrar los títulos de las columnas de PrimeVue */
.p-datatable-thead th .p-column-header-content {
  display: flex;
  justify-content: center;
  text-align: center!important;
  width: 100%;
}

</style>
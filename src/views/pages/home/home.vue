<script setup>
import { ref, computed, onMounted, watchEffect, getCurrentInstance } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Card from 'primevue/card';

/***********variables y reference */

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

const app = getCurrentInstance();

onMounted(() => {
  if (app && app.appContext.config.globalProperties.$primevue) {
    app.appContext.config.globalProperties.$primevue.config.locale = localeEs;
  }
});

const filters = ref({
  radicado: null,
  documento: null,
  fechaDesde: null,
  fechaHasta: null
});

const applyFilters = () => {
  console.log('Filtros a aplicar:', filters.value);

  // Lógica para enviar los filtros a la API
  const params = {
    radicado: filters.value.radicado,
    documento: filters.value.documento,
    fechaDesde: filters.value.fechaDesde ? filters.value.fechaDesde.toISOString().split('T')[0] : null,
    fechaHasta: filters.value.fechaHasta ? filters.value.fechaHasta.toISOString().split('T')[0] : null,
  };
};

const loading = ref(false)

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

// Simular carga inicial (solo visual)
watchEffect(() => {
  loading.value = false
})

</script>

<template>
  <div class="bg-white min-h-screen p-6">
    <Card class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <template #header>
        <div class="bg-gray-300 pl-5">
          <div class="flex items-center space-x-2 text-gray-700">
            <i class="pi pi-list text-lg"></i>
            <span class="text-lg font-bold">Listado PQRS</span>
          </div>
        </div>
      </template>
      <template #content>
        <div class="p-4  bg-white rounded-lg mb-6 flex flex-wrap gap-4 items-end">
          <div class="flex-grow">
            <label for="radicado" class="block text-sm font-medium text-gray-700">Radicado</label>
            <InputText id="radicado" @input="debouncedSearch" class="mt-1 w-full" />
          </div>
          <div class="flex-grow">
            <label for="documento" class="block text-sm font-medium text-gray-700">Documento Paciente</label>
            <InputText id="documento" @input="debouncedSearch" class="mt-1 w-full" />
          </div>
          <div class="flex-grow">
            <label for="fechaDesde" class="block text-sm font-medium text-gray-700">Fecha desde</label>
            <Calendar id="fechaDesde" v-model="filters.fechaDesde" showIcon class="mt-1 w-full"
              @date-select="applyFilters" />
          </div>

          <div class="flex-grow">
            <label for="fechaHasta" class="block text-sm font-medium text-gray-700">Fecha hasta</label>
            <Calendar id="fechaHasta" v-model="filters.fechaHasta" showIcon class="mt-1 w-full"
              @date-select="applyFilters" />
          </div>

          <Button label="Buscar" icon="pi pi-search" class="p-button-sm" @click="applyFilters" />
        </div>

        <DataTable :value="rows" dataKey="id" :loading="loading" :paginator="true" :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]" :totalRecords="totalRecords" :lazy="true" @page="onPage" :first="first"
          :sortField="sortField" :sortOrder="sortOrder" :multiSortMeta="multiSortMeta" sortMode="multiple"
          @sort="onSort" responsiveLayout="scroll" showGridlines stripedRows>
          <!-- 10 columnas -->
          <Column field="id" header="#" sortable style="min-width: 90px" />
          <Column field="nombre" header="Nombre" sortable style="min-width: 160px" />
          <Column field="apellido" header="Apellido" sortable style="min-width: 160px" />
          <Column field="email" header="Email" sortable style="min-width: 220px" />
          <Column field="telefono" header="Teléfono" sortable style="min-width: 150px" />
          <Column field="ciudad" header="Ciudad" sortable style="min-width: 140px" />
          <Column field="pais" header="País" sortable style="min-width: 120px" />
          <Column field="estado" header="Estado" sortable style="min-width: 130px" />
          <Column field="fechaRegistro" header="Fecha registro" sortable style="min-width: 170px" />
          <Column field="rol" header="Rol" sortable style="min-width: 140px" />

          <template #empty>
            <div class="p-6 text-center text-sm text-gray-500">Sin datos.</div>
          </template>

          <template #loading>
            <div class="p-6 text-center text-sm">Cargando...</div>
          </template>
        </DataTable>
      </template>
    </Card>

    <Card class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <template #header>
        <div class="bg-yellow-500 p-4 rounded-t-xl">
          <i class="pi pi-chart-line text-white text-3xl"></i>
        </div>
      </template>
      <template #content>
        <div class="p-4">
          <div class="text-gray-500 font-semibold text-sm">Tasa de Satisfacción</div>
          <div class="text-3xl font-bold text-gray-800 mt-2">98.5%</div>
        </div>
      </template>
    </Card>

    <div class="p-4 bg-gray-100 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
      <h2 bg-gray-100 class="text-2xl font-bold text-gray-900 dark:text-gray-900">
        Listado de PQRS
      </h2>
    </div>
    <div class="p-4">
      <div class="p-4  bg-white rounded-lg mb-6 flex flex-wrap gap-4 items-end">
        <div class="flex-grow">
          <label for="radicado" class="block text-sm font-medium text-gray-700">Radicado</label>
          <InputText id="radicado" @input="debouncedSearch" class="mt-1 w-full" />
        </div>
        <div class="flex-grow">
          <label for="documento" class="block text-sm font-medium text-gray-700">Documento Paciente</label>
          <InputText id="documento" @input="debouncedSearch" class="mt-1 w-full" />
        </div>
        <div class="flex-grow">
          <label for="fechaDesde" class="block text-sm font-medium text-gray-700">Fecha desde</label>
          <Calendar id="fechaDesde" v-model="filters.fechaDesde" showIcon class="mt-1 w-full"
            @date-select="applyFilters" />
        </div>

        <div class="flex-grow">
          <label for="fechaHasta" class="block text-sm font-medium text-gray-700">Fecha hasta</label>
          <Calendar id="fechaHasta" v-model="filters.fechaHasta" showIcon class="mt-1 w-full"
            @date-select="applyFilters" />
        </div>

        <Button label="Buscar" icon="pi pi-search" class="p-button-sm" @click="applyFilters" />
      </div>

      <DataTable :value="rows" dataKey="id" :loading="loading" :paginator="true" :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]" :totalRecords="totalRecords" :lazy="true" @page="onPage" :first="first"
        :sortField="sortField" :sortOrder="sortOrder" :multiSortMeta="multiSortMeta" sortMode="multiple" @sort="onSort"
        responsiveLayout="scroll" showGridlines stripedRows>
        <!-- 10 columnas -->
        <Column field="id" header="#" sortable style="min-width: 90px" />
        <Column field="nombre" header="Nombre" sortable style="min-width: 160px" />
        <Column field="apellido" header="Apellido" sortable style="min-width: 160px" />
        <Column field="email" header="Email" sortable style="min-width: 220px" />
        <Column field="telefono" header="Teléfono" sortable style="min-width: 150px" />
        <Column field="ciudad" header="Ciudad" sortable style="min-width: 140px" />
        <Column field="pais" header="País" sortable style="min-width: 120px" />
        <Column field="estado" header="Estado" sortable style="min-width: 130px" />
        <Column field="fechaRegistro" header="Fecha registro" sortable style="min-width: 170px" />
        <Column field="rol" header="Rol" sortable style="min-width: 140px" />

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

<style scoped>
</style>

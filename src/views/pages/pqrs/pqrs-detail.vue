<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth/auth.store'
import PqrsService from '@/services/pqrs/pqrs.service.js'
import TabView from 'primevue/tabview';
import { useRouter, useRoute } from 'vue-router';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

/***********variables y reference */
const _PqrsService = new PqrsService()
const _authStore = useAuthStore()
const router = useRouter();
const route = useRoute();

const descriptionstatusInternalOptions = ref([
  { label: 'Abierta', value: 1 },
  { label: 'Proceso', value: 2 },
  { label: 'Cerrada', value: 3 },
]);

const pqrs = ref(null);


/************ autorizacion usuario */
const user_id = ref(_authStore.getUser.user_id || _authStore._user.id)
const request_id = ref(null);

onMounted(() => {
  request_id.value = route.params.id
  setTimeout(() => {
    getDetailPQRS();
  }, 200);
});

/************ request de información detallada de la pqrs */
async function getDetailPQRS() {
  const params = {
    request_id: request_id.value,
    user_id: user_id.value,
  };

  try {
    const response = await _PqrsService.getDetailPqrs(params);
    if (response.status !== 200) {
      throw new Error(`Error al obtener informacion: ${response.status}`);
    }
    pqrs.value = response.data.pqrs;
  } catch (error) {
    console.error('Fallo al obtener los datos:', error);
  }
}

function regresarAlListado() {
  router.push({ name: 'pharmasan.siau.pqrs.inicio' });
}


const loading = ref(false)

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


watchEffect(() => {
  loading.value = false
})

</script>

<template>
  <div class="w-full lg:w-full flex items-center justify-center p-10 bg-white-100">
    <div class="w-full">
      <Button label="Regresar al Listado" icon="pi pi-arrow-left" class="p-button-secondary mt-4"
        @click="regresarAlListado" />
      <div class="text-center mb-2">
        <h1 class="text-2xl font-bold text-gray-900 text-center mb-6">
          Detalle de la solicitud {{ }}
        </h1>
      </div>

      <TabView>
        <div v-if="pqrs">
          <!------------------------------------------TAB DATOS SOLICITUD -->
          <TabPanel>
            <template #header>
              <div class="flex items-center gap-2 ">
                <i class="pi pi-info-circle"></i>
                <span class="font-bold">DATOS SOLICITUD</span>
              </div>
            </template>
            <section id="pqrs_solicitud">
              <Card class="h-full-200">
                <template #header>
                  <div class="p-card-header bold p-2 bg-gray-100">
                    <span class="text-blue font-bold">INFORMACIÓN GENERAL DE LA SOLICITUD</span>
                  </div>
                </template>
                <template #content>
                  <div class="portlet-body form">
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Número de la Solicitud: </div>
                      <div class="w-1/2"> {{ pqrs.request_number }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Fecha de Creación: </div>
                      <div class="w-1/2"> {{ fechaISO(pqrs.request_created_at) }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Fecha de Solicitud: </div>
                      <div class="w-1/2"> {{ fechaISO(pqrs.fecha_solicitud) }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2">Tipo de la Solicitud: </div>
                      <div class="w-1/2"> {{ pqrs.type_request_name }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Clasificación de la Solicitud: </div>
                      <div class="w-1/2"> {{ pqrs.type_classification_name }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Estado interno de la Solicitud: </div>
                      <div class="w-1/2"> {{ descriptionStatusInternal(pqrs.request_status_internal) }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Origen de la Solicitud:: </div>
                      <div class="w-1/2"> {{ pqrs.physical_source_name }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Descripción de la Solicitud: </div>
                      <div class="w-1/2"> {{ pqrs.request_description }} </div>
                    </div>
                  </div>
                </template>
              </Card>
            </section>
          </TabPanel>
          <!------------------------------------------FIN DATOS SOLICITUD -->

          <!------------------------------------------TAB Remitente / Paciente -->

          <TabPanel>

            <template #header>
              <div class="flex items-center gap-2">
                <i class="pi pi-file"></i>
                <span class="font-bold ">DATOS REMITENTE/PACIENTE</span>
              </div>
            </template>
            <section id="pqrs_descripcion">
              <Card class="h-full-200">
                <template #header>
                  <div class="p-card-header bold p-2 bg-gray-100">
                    <span class="text-yellow font-bold">INFORMACIÓN REMITENTE</span>
                  </div>
                </template>
                <template #content>
                  <div class="portlet-body form">
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Cliente EPS: </div>
                      <div class="w-1/2"> {{ pqrs.cliente_u_phr_name }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Radicado: </div>
                      <div class="w-1/2"> {{ pqrs.num_radicado }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Nombre Contacto: </div>
                      <div class="w-1/2"> {{ pqrs.nombre_remitente }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2">Cargo Contacto: </div>
                      <div class="w-1/2"> {{ pqrs.cargo_remitente }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Teléfono: </div>
                      <div class="w-1/2"> {{ pqrs.telf_remitente }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Correo Electrónico: </div>
                      <div class="w-1/2"> {{ pqrs.email_remitente }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Departamento: </div>
                      <div class="w-1/2"> {{ pqrs.sender_departamento_name }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Municipio: </div>
                      <div class="w-1/2"> {{ pqrs.sender_municipio_name }} </div>
                    </div>
                  </div>
                </template>
              </Card>
              <Card class="h-full-200 mt-2">
                <template #header>
                  <div class="p-card-header bold p-2 bg-gray-100">
                    <span class="text-yellow font-bold">INFORMACIÓN PACIENTE</span>
                  </div>
                </template>
                <template #content>
                  <div class="portlet-body form">
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Nombre y Apellidos: </div>
                      <div class="w-1/2"> {{ pqrs.nombre_completo }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Tipo de Identificación: </div>
                      <div class="w-1/2"> {{ pqrs.type_identification_name }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Número de Identificación: </div>
                      <div class="w-1/2"> {{ pqrs.account_number }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2">Correo Electrónico: </div>
                      <div class="w-1/2"> {{ pqrs.email }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Teléfono fijo: </div>
                      <div class="w-1/2"> {{ pqrs.phone_number }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Teléfono Celular: </div>
                      <div class="w-1/2"> {{ pqrs.mobile_number }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Dirección: </div>
                      <div class="w-1/2"> {{ pqrs.address_1 }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Departamento: </div>
                      <div class="w-1/2"> {{ pqrs.departamento_name }} </div>
                    </div>
                    <div class="flex flex-wrap pqrs-static-info">
                      <div class="w-1/2"> Municipio: </div>
                      <div class="w-1/2"> {{ pqrs.municipio_name }} </div>
                    </div>
                  </div>
                </template>
              </Card>
            </section>
          </TabPanel>
          <!------------------------------------------FIN Remitente / Paciente -->


          <!------------------------------------------TAB respuestas -->
          <TabPanel>
            <template #header>
              <div class="flex items-center gap-2">
                <i class="pi pi-reply"></i>
                <span class="font-bold">RESPUESTA</span>
              </div>
            </template>
            <section id="pqrs_response">
              <Card class="h-full-200">
                <template #header>
                  <div class="p-card-header bold p-2 bg-gray-100">
                    <span class="text-green font-bold">DESCRIPCIÓN DE LA RESPUESTA</span>
                  </div>
                </template>
                <template #content>
                  <div v-if="pqrs && pqrs.request_response && pqrs.request_response.rows.length > 0" class="timeline">
                    <div v-for="(response, index) in pqrs.request_response.rows" :key="index"
                      class="gap-4 p-4 border-l-2 border-slate-200">
                      <div class="flex-shrink-0 relative">
                        <Image v-if="response.employee_image" :src="`ruta/a/imagen/${response.employee_image}`"
                          alt="Imagen del empleado" class="h-10 w-10 rounded-full object-cover" />
                        <div v-else class="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <i class="pi pi-user text-xl text-slate-500"></i>
                        </div>
                      </div>
                      <div class="flex-grow">
                        <div class="flex items-center gap-4 mb-2">
                          <a href="#" class="font-bold text-blue-600">{{ response.employee_name }}</a>
                          <Tag :value="response.response_type"
                            :severity="response.response_type === 'Parcial' ? 'info' : 'success'" />
                          <span class="text-xs text-slate-500 ml-auto">
                            Respondido en: {{ fechaISO(response.response_created_at) }}
                          </span>
                        </div>
                        <div v-html="response.response_description" class="prose text-sm mb-4"></div>
                        <div v-if="response.response_files && response.response_files.length > 0">
                          <div class="font-bold text-sm text-slate-600 mb-2">Archivos Adjuntos</div>
                          <div class="flex flex-wrap gap-4">
                            <div v-for="(file, fileIndex) in response.response_files" :key="fileIndex"
                              class="flex flex-col items-center">
                              <span class="text-xs text-slate-600 mt-1">{{ file.response_file_url }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8">
                    <i class="pi pi-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                    <h3 class="font-bold text-lg mb-2">Sin respuestas</h3>
                    <p class="text-slate-500">No se han generado respuestas a esta solicitud.</p>
                  </div>
                </template>
              </Card>
            </section>
          </TabPanel>
          <!------------------------------------------FIN TAB respuestas -->

        </div>

      </TabView>
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

.pqrs-static-info {
  margin: 0 !important;
  border-bottom: 1px dashed #efefef;
  padding: 10px 0;
  display: flex;
  align-items: center;
}

.bg-yellow {

  background-color: #c49f47;
  border-color: #c49f47;
}

.text-yellow {
  color: #c49f47 !important;
}

.text-blue {
  color: #3d0cee !important;
}

.text-green {
  color: #3c8649 !important;
}
</style>
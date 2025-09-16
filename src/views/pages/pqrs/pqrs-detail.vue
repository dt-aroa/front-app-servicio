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
import Panel from 'primevue/panel';


/***************************************variables y reference */
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


/*************************************autorizacion usuario */
const user_id = ref(_authStore.getUser.user_id || _authStore._user.id)
const request_id = ref(null);

onMounted(() => {
  request_id.value = route.params.id
  setTimeout(() => {
    getDetailPQRS();
  }, 200);
});

/************************************request de información detallada de la pqrs */
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

/******************************** request de adjunto en codificación base64 */
async function openFileAdjunto(file, type) {
  const params = {
    file: file,
    user_id: user_id.value,
    request_id: request_id.value,
    type: type
  };

  try {
    const response = await _PqrsService.getAdjuntoPqrs(params);
    if (response.status !== 200) {
      throw new Error(`Error al obtener informacion: ${response.status}`);
    }
    const { data } = response;

    const byteCharacters = atob(data.base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    // Creación del Blob a partir de los bytes
    const blob = new Blob(byteArrays, { type: data.mimeType });

    // Creación de URL del Blob
    const blobUrl = URL.createObjectURL(blob);

    // Definición de las dimensiones y posición de la ventana emergente para mostrar el archivo
    const anchoPantalla = window.screen.width;
    const altoPantalla = window.screen.height;

    const anchoVentana = anchoPantalla / 2;
    const altoVentana = altoPantalla / 2;

    // Parámetros para el método window.open()
    const ventanaSpecs = `width=${anchoVentana},height=${altoVentana},top=${altoPantalla / 4},left=${anchoPantalla / 4},resizable=yes,scrollbars=yes`;

    // ventana emergente
    window.open(blobUrl, 'popup', ventanaSpecs);
  } catch (error) {
    console.error('Fallo al obtener los datos:', error);
  }
}

function regresarAlListado() {
  router.push({ name: 'pharmasan.siau.pqrs.inicio' });
}

const loading = ref(false)

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

const tabViewStyles = {
  navContainer: 'p-0 bg-gray-100 rounded-lg',
  nav: 'flex p-1 rounded-md bg-transparent shadow-none',
  tab: ({ props, parent }) => ({
    class: [
      'flex-1 text-center font-bold transition-all duration-200',
      'rounded-md px-4 py-2',
      'shadow-md',
      {
        'text-white bg-blue-500 hover:bg-blue-600': parent.state.d_activeIndex === parent.getIndex(props),
        'text-gray-700 bg-white hover:bg-gray-200': parent.state.d_activeIndex !== parent.getIndex(props),
      },
    ],
  }),
  tablist: 'flex'
};

watchEffect(() => {
  loading.value = false
})

</script>

<template>
  <div class="w-full lg:w-full flex items-center justify-center page-panel-main">
    <div class="w-full">
      <div v-if="pqrs">
        <Panel :pt="panelStyles" class="w-full  shadow-lg rounded-lg overflow-hidden">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <i class="pi pi-file-edit text-xl pr-2"></i>
                <span class="text-xl font-bold text-title-panel">Detalles PQRS</span>
              </div>
                <Button label="Regresar" icon="pi pi-arrow-left" class="p-button-sm w-full sm:w-auto custom-button-green"
                    @click="regresarAlListado" />
                </div>
          </template>
          <div class="p-card pqrs-header-card">
            <div class="pqrs-header-grid">
              <div class="pqrs-details">
                <div class="pqrs-icon">
                  <img src="@/assets/images/pharmasan_pqrs.svg" alt="PQRS Icon" />
                </div>
                <div class="pqrs-info">
                  <h2 class="pqrs-title">N° de Solicitud - {{ pqrs.request_number }}
                    <!--<i class="pi pi-check-circle" style="color: #4CAF50;"></i>-->
                    {{ descriptionStatusInternal(pqrs.request_status_internal)}}
                    <span><i class="pi pi-file-edit text-xl pr-2 tag-cerrada"></i></span>
                  </h2>
                  <div class="pqrs-meta">
                    <span class="pqrs-type"><i class="pi pi-user-plus"></i> {{ pqrs.type_request_name }} </span>
                    <span class="pqrs-reason"><i class="pi pi-briefcase"></i> {{ pqrs.type_classification_name }}
                    </span>
                  </div>
                  <div class="pqrs-user">
                    <i class="pi pi-user"></i> {{ pqrs.nombre_completo }} - {{ pqrs.account_number }}
                  </div>
                </div>
              </div>
              <div class="pqrs-dates">
                <div class="date-item">
                  <span class="date-label">Fecha Solicitud</span>
                  <span class="date-value blue-bg">{{ fechaISO(pqrs.fecha_solicitud) }}</span>
                </div>
                <div class="date-item">
                  <span class="date-label">Fecha Vencimiento</span>
                  <span class="date-value pink-bg">{{ fechaISO(pqrs.fecha_tope) }}</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <TabView :pt="tabViewStyles" class="mb-6 shadow-lg rounded-lg overflow-hidden">
        <div v-if="pqrs">
          <!------------------------------------------TAB DATOS SOLICITUD -->
          <TabPanel>
            <Panel toggleable class="p-card pqrs-panel">
              <template #header>
                <div class="header-content">
                  <i class="pi pi-file-o panel-icon"></i>
                  <span>Descripción de la Solicitud</span>
                </div>
              </template>
              <div class="panel-body">
                <div class="description-section">
                  <div class="description-header">
                    <div class="icon-container">
                      <i class="pi pi-comment description-icon"></i>
                    </div>
                    <div>
                      <span class="description-title">Descripción</span>
                      <span class="description-date">{{ fechaISO(pqrs.request_created_at) }} </span>
                    </div>
                  </div>
                  <div class="description-text">
                    {{ pqrs.request_description }}
                  </div>
                  <div v-if="pqrs.request_info_files && pqrs.request_info_files.row.length > 0">
                    <div class="attachments-section">
                      <div class="attachments-header">
                        <div class="icon-container yellow">
                          <i class="pi pi-paperclip attachments-icon"></i>
                        </div>
                        <div class="attachments-info">
                          <span class="attachments-title">Archivos Adjuntos</span>
                          <span class="attachments-note">Nota: Si desea ver el archivo adjunto, dé clic sobre la imagen
                            o
                            icono correspondiente</span>
                        </div>
                      </div>
                      <div v-for="(file, fileIndex) in pqrs.request_info_files.row" :key="fileIndex">
                        <div class="file-item">
                          <div class="file-preview">
                            <span>{{ file.request_file_url }}</span>
                          </div>
                          <a @click="openFileAdjunto(file, 1)">
                            <div class="download-button">
                              <i class="pi pi-eye"></i>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
            <template #header>
              <div class="flex items-center gap-2 ">
                <i class="pi pi-info-circle"></i>
                <span class="font-bold">Descripción de la Solicitud</span>
              </div>
            </template>
          </TabPanel>
          <!------------------------------------------FIN DATOS SOLICITUD -->
          <!------------------------------------------TAB Remitente / Paciente -->
          <TabPanel>
            <template #header>
              <div class="flex items-center gap-2">
                <i class="pi pi-users"></i>
                <span class="font-bold ">Información Remitente / Paciente</span>
              </div>
            </template>
            <section id="pqrs_descripcion">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Panel de Información Remitente -->
                <Panel class="p-card pqrs-panel">
                  <template #header>
                    <div class="header-content">
                      <i class="pi pi-users panel-icon"></i>
                      <span>Información Remitente</span>
                    </div>
                  </template>
                  <div class="p-4 bg-white grid grid-cols-1 gap-4">
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
                  </div>
                </Panel>
                <!-- Panel de Información Paciente -->
                <Panel class="p-card pqrs-panel">
                  <template #header>
                    <div class="header-content">
                      <i class="pi pi-user panel-icon"></i>
                      <span>Información Paciente</span>
                    </div>
                  </template>
                  <div class="p-4 bg-white grid grid-cols-1 gap-4">

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
                  </div>
                </Panel>
              </div>
            </section>
          </TabPanel>
          <!------------------------------------------FIN Remitente / Paciente -->
          <!------------------------------------------Respuestas -->

          <TabPanel>
            <template #header>
              <div class="flex items-center gap-2 ">
                <i class="pi pi-send"></i>
                <span class="font-bold">Respuestas a la Solicitud</span>
              </div>
            </template>
            <Panel toggleable class="p-card pqrs-panel">
              <template #header>
                <div class="header-content">
                  <i class="pi pi-send panel-icon"></i>
                  <span>Respuestas Solicitud</span>
                </div>
              </template>
              <div class="panel-body">
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
                            <span class="text-xs text-slate-600 mt-1 text-blue cursor-pointer underline"
                              @click="openFileAdjunto(file, 2)">
                              {{ file.response_file_url }}
                            </span>
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
              </div>
            </Panel>
          </TabPanel>
          <!------------------------------------------TAB respuestas -->

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
  color: #c4479f !important;
}

.text-blue {
  color: #3d0cee !important;
}

.text-green {
  color: #3c8649 !important;
}

.pqrs-header-card {
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.pqrs-header-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pqrs-details {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.pqrs-icon img {
  width: 6rem;
  height: auto;
}

.pqrs-info {
  display: flex;
  flex-direction: column;
}

.pqrs-title {
/* font-size: 1.25rem;*/
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.pqrs-meta,
.pqrs-user {
/*  font-size: 0.875rem;*/
  color: #666;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /*gap: 1rem;*/
  margin-bottom: 0.25rem;
}

.pqrs-meta i,
.pqrs-user i {
  margin-right: 0.25rem;
  color: #999;
}

.pqrs-dates {
  display: flex;
  gap: 1.5rem;
  text-align: right;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-label {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.date-value {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #ffffff;
  min-width: 90px;
  text-align: center;
}

.blue-bg {
  background-color: #1a73e8;
}

.pink-bg {
  background-color: #ff69b4;
}

.pqrs-panel {
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

/* Estilos de la cabecera del panel */
.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /*font-size: 1.1rem;*/
  font-weight: 500;
}

.panel-icon {
  color: #4CAF50;
  /* Color verde para el icono de la cabecera */
}

/* Estilos para el cuerpo del panel */
.panel-body {
  /*padding: 1.5rem;*/
}

.description-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #f0f4f8;
  /* Color de fondo del círculo */
}

.description-icon {
  font-size: 1.25rem;
  color: #4a90e2;
  /* Color azul para el icono de burbuja */
}

.description-title {
  font-weight: 600;
  margin-right: 0.5rem;
}

.description-date {
  font-size: 0.85rem;
  color: #777;
}

.description-text {
  line-height: 1.5;
  color: #333;
}

/* --- Estilos de la nueva sección de adjuntos --- */
.attachments-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 1.5rem;
}

.attachments-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.attachments-icon {
  font-size: 1.25rem;
  color: #f7a800;
  /* Color naranja para el icono de clip */
}

.attachments-info {
  display: flex;
  flex-direction: column;
}

.attachments-title {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.attachments-note {
  font-size: 0.75rem;
  color: #999;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.5rem 1rem;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-preview img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #ccc;
}

.download-button {
  background-color: #22c55e;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.download-button:hover {
  background-color: #1a9547;
}

.download-button i {
  font-size: 1rem;
}
</style>
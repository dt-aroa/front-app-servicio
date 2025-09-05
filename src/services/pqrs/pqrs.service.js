import http from '@/libs/http'

const baseUrl = `${import.meta.env.VITE_VUE_APP_MICROSERVICE_API_SERVICIOALCLIENTE}`

export default class PqrsService {

  // Obtener Municipios de un departamento
  getMunicipios(departamentoId) {
    return http.get(`${baseUrl}/municipios/${departamentoId}/`, {
      headers: {
        loading: true,
      },
    })
  }

  // Obtener las clasificaciones de las pqrs 
  getClasificaciones(typeRequestId) {
    return http.get(`${baseUrl}/clasificaciones/${typeRequestId}/`, {
      headers: {
        loading: true,
      },
    })
  }

  // Obtener información inicial para crear la pqrs 
  getCrearPqrs() {
    return http.get(`${baseUrl}/crear/crear-pqrs/`, {
      headers: {
        loading: true,
      },
    })
  }

  // creación de la pqrs
  createPqrs(body) {
    return http.post(`${baseUrl}/store-pqrs/`, body, {
      headers: {
        loading: true,
      },
    })
  }

  // Obtener las pqrs del cliente
  getPqrsCliente(body) {
    return http.post(`${baseUrl}/getPqrsCliente/`, body, {
      headers: {
        loading: true,
      },
    })
  }

 //Descarga plantila excel
  getDownloadTemplate() {
    return http.get(`http://localhost:3035/api/pqrs/getDownloadTemplate/`, {
      headers: { loading: true },
      responseType: 'blob',
    });
  }
}

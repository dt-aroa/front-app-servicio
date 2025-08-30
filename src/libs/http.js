import axios from 'axios'
import { useAuthStore } from '@/stores/auth/auth.store.js'
import router from '@/router/index.js'
import { getValidationErrors } from '@/utils/get-validation-errors'
import { messageError, messageWarning, errorHtml } from '@/utils/messages'
import Swal from 'sweetalert2'

/**
 * Configuración base para los modales de error de Sweetalert2
 */
const baseErrorConfig = {
  confirmButtonText: 'Entendido',
  customClass: {
    container: 'error-modal',
    popup: 'rounded-lg',
    content: 'text-left',
    confirmButton: 'bg-primary-600 hover:bg-primary-700',
  },
}

/**
 * Extrae y formatea mensajes de error de diferentes estructuras de respuesta
 * @param {Object} errorData - Objeto conteniendo los datos del error
 * @returns {string[]} Array de mensajes formateados en HTML
 */
function extractErrorMessages(errorData) {
  const messages = new Set()

  const addMessage = (message, isMainMessage = false) => {
    if (message && typeof message === 'string') {
      // Solo agregamos si el mensaje no existe ya en el Set
      const formattedMessage = isMainMessage
        ? `<div class="mb-2 font-medium">${message}</div>`
        : `<div class="text-sm text-gray-600 mb-1">${message}</div>`

      // Verificar si el mensaje (sin el formato HTML) ya existe
      const exists = Array.from(messages).some((msg) => msg.includes(message))

      if (!exists) {
        messages.add(formattedMessage)
      }
    }
  }

  // Para errores de Joi, solo mostramos el mensaje principal
  if (errorData.details?.joiError?.length > 0) {
    // Usar el mensaje principal que ya está formateado para el usuario
    addMessage(errorData.message, true)

    // Agregar información adicional si existe en el contexto
    errorData.details.joiError.forEach((error) => {
      if (error.context) {
        const { limit, label } = error.context
        if (limit) {
          addMessage(`Campo "${label}": límite máximo ${limit} caracteres`)
        }
      }
    })

    return Array.from(messages)
  }

  // Para otros tipos de errores, continuar con el procesamiento normal
  addMessage(errorData.message, true)

  if (errorData.details) {
    if (Array.isArray(errorData.details)) {
      errorData.details.forEach((detail) => addMessage(detail.message))
    } else if (typeof errorData.details === 'object') {
      addMessage(errorData.details.message)
      Object.entries(errorData.details).forEach(([key, value]) => {
        if (typeof value === 'string' && key !== 'message') {
          addMessage(value)
        }
      })
    }
  }

  if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
    errorData.errors.forEach((error) => {
      if (typeof error === 'string') {
        addMessage(error)
      } else if (error.message) {
        addMessage(error.message)
      }
    })
  }

  return Array.from(messages)
}

/**
 * Actualiza los headers de la petición con el token de autenticación
 * @param {Object} request - Objeto de petición de Axios
 * @returns {Object} Petición con headers actualizados
 */
const updateHeader = (request) => {
  const auth = useAuthStore()
  let newHeaders = {}
  const token = auth.getToken
  if (token) {
    newHeaders = {
      Authorization: `Bearer ${token}`,
      ContentType: 'application/json',
    }
    request.headers = newHeaders
  }
  return request
}

// Interceptor para las peticiones
axios.interceptors.request.use((request) => {
  if (request.url?.includes('assets')) {
    return request
  }

  if (request.headers.loading) {
    document.body.classList.add('loading-indicator')
  }

  return updateHeader(request)
})

// Interceptor para las respuestas
axios.interceptors.response.use(
  (response) => {
    document.body.classList.remove('loading-indicator')
    return response
  },
  async (error) => {
    document.body.classList.remove('loading-indicator')

    if (!error.response) {
      messageError(getValidationErrors(error.code))
      return Promise.reject(error)
    }

    const { status, data } = error.response

    try {
      if (data.type) {
        await handleErrorByType(data)
      } else {
        await handleDefaultError(status, data, error.response)
      }
    } catch (handlerError) {
      console.error('Error en el manejador:', handlerError)
    }

    return Promise.reject(error.response)
  },
)

/**
 * Maneja los diferentes tipos de errores según su tipo
 * @param {Object} data - Datos del error
 */
async function handleErrorByType(data) {
  const handlers = {
    VALIDATION_ERROR: handleValidationError,
    NOT_FOUND_ERROR: handleNotFoundError,
    FOREIGN_KEY_ERROR: handleForeignKeyError,
    DUPLICATE_ERROR: handleDuplicateError,
    BUSINESS_LOGIC_ERROR: handleBusinessError,
    FORMAT_ERROR: handleFormatError,
    DATABASE_ERROR: handleDatabaseError,
  }

  const handler = handlers[data.type] || handleDefaultError
  await handler(data)
}

/**
 * Maneja errores de validación
 * @param {Object} data - Datos del error
 */
async function handleValidationError(data) {
  const messages = extractErrorMessages(data)

  if (messages.length === 0) {
    return messageWarning(data.message)
  }

  await Swal.fire({
    ...baseErrorConfig,
    title: 'Error de Validación',
    html: messages.join(''),
    icon: 'warning',
  })
}

/**
 * Maneja errores de recurso no encontrado
 * @param {Object} data - Datos del error
 */
async function handleNotFoundError(data) {
  const messages = extractErrorMessages({
    message: data.message,
    details: {
      message: data.details.message,
    },
  })

  await Swal.fire({
    ...baseErrorConfig,
    title: 'Recurso no encontrado',
    html: messages.join(''),
    icon: 'warning',
  })
}

/**
 * Maneja errores de llave foránea
 * @param {Object} data - Datos del error
 */
async function handleForeignKeyError(data) {
  const messages = extractErrorMessages({
    message: data.message,
    details: {
      message: data.details.message || JSON.stringify(data.details),
    },
  })

  await Swal.fire({
    ...baseErrorConfig,
    title: 'Error de Referencia',
    html: messages.join(''),
    icon: 'warning',
  })
}

/**
 * Maneja errores de duplicación
 * @param {Object} data - Datos del error
 */
async function handleDuplicateError(data) {
  const detail =
    data.details?.message ||
    (data.details?.fields?.length > 1
      ? `Valores duplicados: ${Object.entries(data.details.values)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      : '')

  const messages = extractErrorMessages({
    message: data.message,
    details: { message: detail },
  })

  await Swal.fire({
    ...baseErrorConfig,
    title: 'Registro Duplicado',
    html: messages.join(''),
    icon: 'warning',
  })
}

/**
 * Maneja errores de formato
 * @param {Object} data - Datos del error
 */
async function handleFormatError(data) {
  const messages = extractErrorMessages({
    message: data.message,
    details: {
      message: data.details.message,
      originalError: data.details.originalError,
    },
  })

  await Swal.fire({
    ...baseErrorConfig,
    title: 'Error de formato',
    html: messages.join(''),
    icon: 'warning',
  })
}

/**
 * Maneja errores de lógica de negocio
 * @param {Object} data - Datos del error
 */
async function handleBusinessError(data) {
  messageWarning(data.message)
}

/**
 * Maneja errores de base de datos
 * @param {Object} data - Datos del error
 */
async function handleDatabaseError(data) {
  const messages = extractErrorMessages({
    message: data.message,
    details: {
      message: data.details.message,
      originalError: data.details.originalError,
    },
  })

  await Swal.fire({
    ...baseErrorConfig,
    title: 'Error de Base de Datos',
    html: messages.join(''),
    icon: 'error',
  })
}

/**
 * Maneja errores por defecto y específicos del servidor
 * @param {number} status - Código de estado HTTP
 * @param {Object} data - Datos del error
 * @param {Object} errorResponse - Respuesta completa del error
 */
async function handleDefaultError(status, data, errorResponse) {
  if (status === 401) {
    const auth = useAuthStore()
    await auth.logout()
    await router.push({ name: 'login' })
    await messageError(data.message)
  } else if (status === 403) {
    messageWarning('Necesitas permisos para realizar esta operación')
  } else if (status >= 500) {
    await handleServerError(errorResponse)
    if (!data.details) {
      messageWarning(data.message)
    } else {
      await Swal.fire({
        ...baseErrorConfig,
        title: 'Error',
        html: extractErrorMessages({
          message: data.message,
          details: {
            message: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
          },
        }).join(''),
        icon: 'error',
      })
    }
  } else if (status === 452) {
    await errorHtml(data)
  } else {
    messageError(data.message)
  }
}

// Variable para controlar que solo se muestre un modal de error de servidor a la vez
let serverErrorModalShown = false

/**
 * Maneja errores 500 del servidor mostrando el contenido HTML si está disponible
 * @param {Object} response - Respuesta del error
 */
async function handleServerError(response) {
  if (serverErrorModalShown) return

  if ((response.headers['content-type'] || '').includes('text/html')) {
    const iframe = document.createElement('iframe')
    if (response.data instanceof Blob) {
      iframe.srcdoc = await response.data.text()
    } else {
      iframe.srcdoc = response.data
    }

    await Swal.fire({
      html: iframe.outerHTML,
      showConfirmButton: false,
      customClass: { container: 'server-error-modal' },
      didDestroy: () => {
        serverErrorModalShown = false
      },
      grow: 'fullscreen',
      padding: 0,
    })
    serverErrorModalShown = true
  }
}

export default axios

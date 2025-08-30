export const getValidationErrors = (errorCode) => {
  const codeMatcher = {
    ERR_NETWORK: 'Error de conexión, verifique su conexión a internet',
    ERR_TIMEOUT: 'Se acabó el tiempo',
    ERR_CANCEL: 'Se canceló la petición',
    ERR_UNKNOWN: 'Error desconocido',
    ERR_400: 'Error 400',
    ERR_401: 'Error 401',
    ERR_403: 'Error 403'
  }

  return codeMatcher[errorCode] || 'Error desconocido'
}

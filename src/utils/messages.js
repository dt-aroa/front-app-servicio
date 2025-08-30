import Swal from 'sweetalert2'

const messageSuccess = (text, title = 'Éxito') => {
  Swal.fire({
    icon: 'success',
    title,
    text
  })
}

const messageError = (text, title = 'Error', html) => {
  Swal.fire({
    icon: 'error',
    title,
    text,
    html
  })
}

const messageInfo = (text, title = 'Información') => {
  Swal.fire({
    icon: 'info',
    title,
    text
  })
}

const messageWarning = (text, title = 'Advertencia') => {
  Swal.fire({
    icon: 'warning',
    title,
    text
  })
}

const messageConfirm = (text = '', title = 'Estas seguro?', icon = 'question', html) => {
  return Swal.fire({
    icon,
    title,
    text,
    html,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'No'
  })
}

const messageWarningDelete = (text = '', title = 'Estas seguro?', icon = 'question', html) => {
  return Swal.fire({
    icon,
    title,
    text,
    html,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, Eliminar!',
    cancelButtonText: 'No, cancelar!'
  })
}

const messageConfirmSave = (text = '', title = 'Estas seguro?', icon = 'question', html) => {
  return Swal.fire({
    icon,
    title,
    text,
    html,
    showCancelButton: true,
    confirmButtonColor: '#24963E',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, Guardar!',
    cancelButtonText: 'No, cancelar!'
  })
}

const errorHtml = (title = 'Error', html) => {
  return Swal.fire({
    icon: 'error',
    title,
    html
  })
}

export {
  messageSuccess,
  messageError,
  messageInfo,
  messageWarning,
  messageConfirm,
  messageWarningDelete,
  messageConfirmSave,
  errorHtml
}

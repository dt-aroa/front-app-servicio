/*
 |--------------------------------------------------------------------------
 | PrimeVue
 |--------------------------------------------------------------------------
*/
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

// Themes and css PrimeVue
import Aura from '@primevue/themes/aura'

// Components
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import Card from 'primevue/card'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import StepPanels from 'primevue/steppanels'
import StepItem from 'primevue/stepitem'
import Step from 'primevue/step'
import StepPanel from 'primevue/steppanel'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import InputMask from 'primevue/inputmask'
import Badge from 'primevue/badge'
import Fieldset from 'primevue/fieldset'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'

import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

const install = (app) => {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: '.dark-mode',
        cssLayer: {
          name: 'primevue',
          order: 'tailwind-base, primevue, tailwind-utilities, global',
        },
      },
    },
    ripple: true,
    // inputStyle: 'filled',
    locale: {
      startsWith: 'Comience con',
      contains: 'Contenga',
      notContains: 'No contenga',
      endsWith: 'Termine con',
      equals: 'Igual a',
      notEquals: 'Diferente a',
      noFilter: 'Sin filtro',
      lt: 'Menor que',
      lte: 'Menor o igual a',
      gt: 'Mayor que',
      gte: 'Mayor o igual a',
      dateIs: 'Fecha igual a',
      dateIsNot: 'Fecha diferente a',
      dateBefore: 'Fecha antes de',
      dateAfter: 'Fecha después de',
      custom: 'Personalizar',
      clear: 'Limpiar',
      apply: 'Aplicar',
      matchAll: 'Coincidir todo',
      matchAny: 'Coincidir con cualquiera',
      addRule: 'Agregar regla',
      removeRule: 'Eliminar regla',
      accept: 'Sí',
      reject: 'No',
      choose: 'Escoger',
      upload: 'Subir',
      cancel: 'Cancelar',
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      dayNamesMin: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      monthNamesShort: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ],
      today: 'Hoy',
      weekHeader: 'Sem',
      firstDayOfWeek: 1,
      dateFormat: 'dd/mm/yy',
      weak: 'Débil',
      medium: 'Medio',
      strong: 'Fuerte',
      passwordPrompt: 'Escriba una contraseña',
      emptyFilterMessage: 'Sin opciones disponibles',
      emptyMessage: 'No se han encontrado resultados',
      aria: {
        trueLabel: 'Verdadero',
        falseLabel: 'Falso',
        nullLabel: 'No seleccionado',
        star: '1 estrella',
        stars: '{star} estrellas',
        selectAll: 'Seleccionar todos',
        unselectAll: 'Deseleccionar todos',
        close: 'Cerrar',
        previous: 'Anterior',
        next: 'Siguiente',
        navigation: 'Navegación',
        scrollTop: 'Desplazarse arriba',
        moveTop: 'Mover arriba',
        moveUp: 'Subir',
        moveDown: 'Bajar',
        moveBottom: 'Desplazarse abajo',
        moveToTarget: 'Mover al objetivo',
        moveToSource: 'Mover al fuente',
        moveAllToTarget: 'Mover todo al objetivo',
        moveAllToSource: 'Mover todo al fuente',
        pageLabel: '{page}',
        firstPageLabel: 'Primera Página',
        lastPageLabel: 'Última Página',
        nextPageLabel: 'Siguiente Página',
        previousPageLabel: 'Página Anterior',
        rowsPerPageLabel: 'Filas por página',
        jumpToPageDropdownLabel: 'Ir al menú desplegable de página',
        jumpToPageInputLabel: 'Ir a la entrada de página',
        selectRow: 'Seleccionar fila',
        unselectRow: 'Desmarcar fila',
        expandRow: 'Expandir Fila',
        collapseRow: 'Reducir Fila',
        showFilterMenu: 'Mostrar menú del filtro',
        hideFilterMenu: 'Ocultar menú del filtro',
        filterOperator: 'Operador de filtro',
        filterConstraint: 'Restricción de filtro',
        editRow: 'Editar fila',
        saveEdit: 'Guardar editado',
        cancelEdit: 'Cancelar editado',
        listView: 'Vista de lista',
        gridView: 'Vista de cuadrícula',
        slide: 'Deslizar',
        slideNumber: '{slideNumber}',
        zoomImage: 'Ampliar imagen',
        zoomIn: 'Ampliar',
        zoomOut: 'Reducir',
        rotateRight: 'Girar derecha',
        rotateLeft: 'Girar izquierda',
      },
    },
  })

  app.use(ToastService)
  app.component('Toast', Toast)
  app.component('Button', Button)
  app.component('Panel', Panel)
  app.component('Card', Card)
  app.component('Stepper', Stepper)
  app.component('StepList', StepList)
  app.component('StepPanels', StepPanels)
  app.component('StepItem', StepItem)
  app.component('Step', Step)
  app.component('StepPanel', StepPanel)
  app.component('Divider', Divider)
  app.component('InputText', InputText)
  app.component('InputNumber', InputNumber)
  app.component('Password', Password)
  app.component('Textarea', Textarea)
  app.component('Select', Select)
  app.component('DatePicker', DatePicker)
  app.component('InputMask', InputMask)
  app.component('Badge', Badge)
  app.component('Fieldset', Fieldset)
  app.component('Message', Message)
  app.component('Dialog', Dialog)
  app.component('ProgressSpinner', ProgressSpinner)
  app.component('DataTable', DataTable)
  app.component('Column', Column)
  app.component('Skeleton', Skeleton)
}
export { install as default }

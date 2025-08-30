import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css' // optional for styling
import 'tippy.js/themes/translucent.css'

export default (app) => {
  app.use(
    VueTippy,
    // optional
    {
      directive: 'tippy', // => v-tippy
      component: 'tippy', // => <tippy/>
      componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
      defaultProps: {
        allowHTML: true,
        interactive: true,
        appendTo: document.body
        // trigger: "click"
      }, // => Global default options * see all props
      popperOptions: {
        positionFixed: false,
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['bottom', 'right']
            }
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true,
              tether: false
            }
          }
        ]
      }
    }
  )
}

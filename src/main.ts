import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: "#757575", // colors.red.darken1, // #E53935
                    secondary: "#F5F5F5", // colors.red.lighten4, // #FFCDD2
                }
            },
        },
    },
})

createApp(App).use(vuetify).mount('#app')

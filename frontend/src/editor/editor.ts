// Ionic
import {IonicVue} from '@ionic/vue';

// Vue + App
import {createApp} from 'vue'
import App from '@/app/App.vue'
import {logDebug} from "@/shared";

// Router
import {createTasteBuddyRouter} from '@/app/router';

// Store
import {createPinia} from "pinia";

// Styles
/* Add service worker */
import '@/registerServiceWorker.ts';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Custom variables */
import '@/app/theme/colors.css';
import '@/app/theme/global.css';
import '@/app/theme/ionic.css'
import '@/app/theme/layout.css';
import '@/app/theme/font.css';

/* Icons */
import 'ionicons/icons';
/* Initialize internalisation */
import {i18n} from "@/app/locales/i18n.ts";

// Initializations

/* Initialize store */
const pinia = createPinia()

/* Initialize router */
const router = createTasteBuddyRouter();

/* Initialize app */
const app = createApp(App)
    .use(IonicVue)
    .use(pinia)
    .use(router)
    .use(i18n)

/* Configure app */
app.config.performance = true
logDebug('main.config', app.config)

router.isReady().then(() => {
    app.mount('#tastebuddy');
});
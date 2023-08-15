// Ionic
import {IonicVue} from '@ionic/vue';

// Vue + App
import {createApp} from 'vue'
import App from './App.vue'

// Router
import {createTasteBuddyRouter} from './router';

// Store
import {createPinia} from "pinia";

// Styles
/* Add service worker */
import './registerServiceWorker';

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
import './theme/colors.css';
import './theme/global.css';
import './theme/ionic.css'
import './theme/layout.css';
import './theme/font.css';

/* Icons */
import 'ionicons/icons';

/* Initialize store */
const pinia = createPinia()

/* Initialize and configure router */
const router = createTasteBuddyRouter();

/* Initialize app */
const app = createApp(App)
    .use(IonicVue)
    .use(pinia)
    .use(router)

router.isReady().then(() => {
    app.mount('#tastebuddy');
});
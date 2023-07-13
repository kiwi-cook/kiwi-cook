// Ionic
import {IonicVue} from '@ionic/vue';

// Vue + App
import {createApp} from 'vue'
import App from './App.vue'

// Router
import {createTasteBuddyRouter} from './router';

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

/* Theme variables */
import './theme/custom.css';
import './theme/layout.css';
import './theme/headers.css';
// import './theme/general.css';
/* iOS */
// import './theme/ios.css';
/* Android */
// import './theme/md.css';
import 'ionicons/icons';
import {createPinia} from "pinia";

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
    app.mount('#app');
});
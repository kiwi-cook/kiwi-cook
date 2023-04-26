// Ionic
import {IonicVue} from '@ionic/vue';

// Vue + App
import {createApp} from 'vue'
import App from './App.vue'

// Router
import {createTasteBuddyRouter} from './router';

// Storage
import {createTasteBuddyStore, ionicStorageVuePlugin, storeKey} from './storage';

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
import './theme/general.css';
/* iOS */
import './theme/ios.css';
/* Android */
import './theme/md.css';
import 'ionicons/icons';

/* Initialize store */
const tasteBuddyStore = createTasteBuddyStore();

/* Initialize and configure router */
const tasteBuddyRouter = createTasteBuddyRouter(tasteBuddyStore);

/* Initialize app */
const app = createApp(App)
    .use(IonicVue)
    .use(tasteBuddyStore, storeKey)
    .use(tasteBuddyRouter)
    .use(ionicStorageVuePlugin)

tasteBuddyRouter.isReady().then(() => {
    app.mount('#app');
});
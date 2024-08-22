<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div class="searchbar-container">
        <div :class="{ 'searchbar-wrapper--active': isActive }" class="searchbar-wrapper">
            <input ref="searchbarInput" v-model.trim="input"
                   :placeholder="$t('Suggestions.SearchbarPrompt')" class="searchbar-input"
                   @focus="onFocus()" @keyup.enter="search()"/>
            <button :class="{ disabled: !input }" class="searchbar-button search" @click="search()">
                <IonIcon :icon="searchOutline"/>
            </button>
            <button v-if="cameraEnabled" :class="{ uploading: imageUploading }"
                    class="searchbar-button camera"
                    @click="takePhoto()">
                <IonIcon v-if="!imageUploading" :icon="cameraOutline"/>
                <IonIcon v-else :icon="sparklesOutline"/>
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { IonIcon } from '@ionic/vue';
import { onMounted, ref, watch } from 'vue';
import { cameraOutline, searchOutline, sparklesOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { logDebug, logError, logWarn } from '@/shared/utils/logging.ts';
import { API_ROUTE, sendToAPI } from '@/shared';

const focus = defineModel('focus', { type: Boolean, default: false });
const input = defineModel('input', { type: String, required: true });
const emit = defineEmits(['onFocus', 'onClose', 'search']);

const search = () => emit('search');
const onFocus = () => emit('onFocus');

/* Search input */
const searchbarInput = ref<HTMLInputElement | null>(null);
const isActive = ref(false);

watch(focus, (value) => {
    if (value) {
        searchbarInput.value?.focus();
    }
    isActive.value = value;
});

/* Camera */
const cameraEnabled = ref(true);
const imageUploading = ref(false);
const checkCameraPermission = async () => Camera.checkPermissions()
    .then((result) => cameraEnabled.value = result.camera !== 'denied')
const askCameraPermission = async () => {
    try {
        await Camera.requestPermissions()
        await checkCameraPermission();
    } catch (e) {
        logError('askCameraPermission', e);
    }
}
const takePhoto = async () => {
    try {
        const capturedPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
            quality: 100,
        });

        if (!capturedPhoto.base64String) {
            logWarn('takePhoto', 'No photo captured');
            return;
        }

        // Convert base64 to Blob
        const base64Response = await fetch(`data:image/jpeg;base64,${capturedPhoto.base64String}`);
        const blob = await base64Response.blob();

        // Create FormData and append the blob
        const formData = new FormData();
        formData.append('image', blob, 'image.jpg');
        imageUploading.value = true;

        const response = await sendToAPI<string[]>(API_ROUTE.IMAGE_TO_INGREDIENTS, { body: formData });
        if (Array.isArray(response.response)) {
            logDebug('takePhoto', 'Ingredients found in image')
            input.value = response.response.join(' ');
        } else {
            logWarn('takePhoto', 'No ingredients found in image')
        }
    } catch (e) {
        logError('takePhoto', e);
    }
    imageUploading.value = false;
}

onMounted(() => {
    askCameraPermission();
});
</script>

<style scoped>
.searchbar-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start;
    align-items: flex-start;
    margin: var(--margin) 0;
    width: 100%;
    max-width: 860px;
}

.searchbar-wrapper {
    min-width: fit-content;
    max-width: 420px;
    height: 50px;
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
    border: var(--border);
    border-color: var(--ion-color-primary);
    border-radius: var(--border-radius-strong);
    padding: 5px 10px;
    box-shadow: var(--box-shadow-neumorphism);
    background-color: rgba(var(--ion-background-color-rgb), 0.9);
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    transition: var(--transition);
}

@media (max-width: 860px) {
    .searchbar-wrapper {
        width: 100%;
        max-width: 420px;
    }
}

@media (max-width: 480px) {
    .searchbar-wrapper {
        min-width: 0;
    }
}

.searchbar-input {
    border: none;
    outline: none;
    font-size: 16px;
    padding: 10px;
    border-radius: var(--border-radius-strong);
    background: none;
    cursor: pointer;
    color: var(--ion-text-color);
    flex-grow: 1;
    min-width: 0;
    width: 250px;
}

.searchbar-button {
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: var(--font-weight-bold);
    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    color: #fff;
    background-size: 200% 200%;
    box-shadow: var(--box-shadow);
    transition: background 1s ease-in-out, transform ease-in-out 300ms, box-shadow ease-in-out 300ms, scale ease-in-out 300ms;
}

.searchbar-button.search {
    background: radial-gradient(circle at top left, #ffc718, #c362b5, #6ab1e1);
}

@keyframes border-flow {
    0% {
        border-color: #ff7e5f;
    }
    25% {
        border-color: #feb47b;
    }
    50% {
        border-color: #ffcb80;
    }
    75% {
        border-color: #feb47b;
    }
    100% {
        border-color: #ff7e5f;
    }
}

.searchbar-button.camera {
    background: radial-gradient(circle at top left, #ff7e5f, #feb47b, #ffcb80);
    position: relative;
}

.searchbar-button.camera::before {
    content: "";
    position: absolute;
    top: -0.5px;
    left: -0.5px;
    right: -0.5px;
    bottom: -0.5px;
    border-radius: 50px;
    border: 2px solid transparent;
    transition: border 0.3s ease-in-out;
}

.searchbar-button.camera.uploading::before {
    animation: border-flow 2s linear infinite; /* Animated border */
}

.searchbar-button.camera.uploading {
    pointer-events: none;
    background: none;
    color: inherit;
    box-shadow: none;
}


@keyframes color-flow {
    0%, 100% {
        background-position: 0% 0%;
    }
    25% {
        background-position: 100% 0%;
    }
    50% {
        background-position: 100% 100%;
    }
    75% {
        background-position: 0% 100%;
    }
}

.searchbar-button.disabled {
    pointer-events: none;
    background: none;
    color: inherit;
    box-shadow: none;
    border: thin solid var(--ion-color-primary);
}

.searchbar-button:hover, .searchbar-button:active {
    scale: 1.05;
}

@media (max-width: 900px) {
    .searchbar-container {
        flex-direction: column;
        align-items: center;
    }
}
</style>

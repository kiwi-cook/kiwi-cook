import {toastController} from "@ionic/vue";
import {DURATIONS} from "@/shared/index.ts";

/**
 * Format a date to DD.MM.YYYY, e.g. 1.1.2020
 * @param date
 * @returns the formatted date
 */
export function formatDate(date?: Date): string {
    if (!date) {
        return '';
    }
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}


/**
 * Present a toast to the user
 * @param message the message to display
 * @param isError
 * @param duration the duration of the toast in milliseconds
 */
export const presentToast = async (message?: string, isError = false, duration = DURATIONS.SHORT) => {
    if ((message ?? '') === '') {
        return
    }

    const toast = toastController.create({
        message,
        duration,
        position: 'top',
        color: isError ? 'danger' : 'success'
    });
    await (await toast).present()
}

// Use matchMedia to check the user preference
export const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Listen for changes to the prefers-color-scheme media query
prefersDark.addEventListener('change', (e) => {
    toggleDarkTheme(e.matches);
});


// Add or remove the "dark" class based on if the media query matches
export const toggleDarkTheme = (shouldAdd: boolean) => document.body.classList.toggle('dark', shouldAdd);

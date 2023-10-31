import {toastController} from "@ionic/vue";
import {DURATIONS} from "@/shared/ts/index.ts";

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


/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see https://stackoverflow.com/a/8831937
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function hash(str: string): number {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        const chr: number = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
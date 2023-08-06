import {toastController} from "@ionic/vue";
import {DURATIONS} from "@/tastebuddy";

/**
 * Create a deep copy of an object
 * This is done by serializing the object to JSON and then parsing it back to an object
 * It does not copy functions
 * @param obj
 * @returns the deep copy of the object
 */
export function deepCopy<T>(obj?: T): T {
    return JSON.parse(JSON.stringify(obj ?? "{}"));
}

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
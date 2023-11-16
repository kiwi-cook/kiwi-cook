/*
 * Copyright (c) 2023 Josef Müller.
 */

import {isPlatform} from '@ionic/vue';
import {APP_NAME, share} from '@/shared';

export const canBeInstalled = () => !isPlatform('pwa') && (isPlatform('mobile') || isPlatform('tablet'))

export function showInstallationPrompt() {
    return share({
        title: `Install ${APP_NAME}`,
        text: `Install ${APP_NAME} to your home screen`,
        url: window.location.href,
        dialogTitle: `Install ${APP_NAME}`,
    })
}
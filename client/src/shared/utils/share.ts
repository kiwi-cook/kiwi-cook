/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { CanShareResult, Share } from '@capacitor/share';
import { logError, logWarn } from '@/shared/utils/logging';

const MODULE = 'shared.utils.share.'

export function share(options: { title: string, text: string, url: string, dialogTitle: string }) {
    const fName = MODULE + 'share'
    const { title, text, url, dialogTitle } = options || {}

    return Share.canShare().then((canShare: CanShareResult) => {
        if (!canShare.value) {
            return
        }

        return Share
            .share({
                title, text, url, dialogTitle,
            })
            .catch((error: Error) => {
                logError(fName, error)
            })
    }).catch((error: Error) => {
        logWarn(fName, error)
    })
}

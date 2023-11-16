/*
 * Copyright (c) 2023 Josef Müller.
 */

import {CanShareResult, Share} from '@capacitor/share';
import {logError} from '@/shared/utils/logging';

export function share(options: { title: string, text: string, url: string, dialogTitle: string }) {
    const {title, text, url, dialogTitle} = options || {}

    return Share.canShare().then((canShare: CanShareResult) => {
        if (!canShare.value) {
            return
        }

        return Share
            .share({
                title,
                text,
                url,
                dialogTitle,
            })
            .catch((error: Error) => {
                logError('sharing failed', error)
            })
    }).catch((error: Error) => {
        logError('sharing failed', error)
    })
}

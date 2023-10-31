import {CanShareResult, Share} from "@capacitor/share";
import {logError} from "@/shared/ts/logging.ts";

export function share(options: { title: string, text: string, url: string, dialogTitle: string }) {
    const {title, text, url, dialogTitle} = options || {}

    return Share.canShare().then((canShare: CanShareResult) => {
        if (!canShare.value) {
            return
        }

        try {
            return Share.share({
                title,
                text,
                url,
                dialogTitle,
            })
        } catch (e) {
            logError('sharing failed', e)
        }
    }).catch((error: Error) => {
        logError('sharing failed', error)
    })
}

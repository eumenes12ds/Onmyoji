import { tr } from '@/i18n';
import { useDataStore } from '@/store';

function notify(title: string, message: string) {
    toastr.success(message, title, { timeOut: 10000 });
}

export function initNotification() {
    const store = useDataStore();

    if (store.settings.internal.設定画面更新を通知済み === false) {
        notify(
            tr('runtime.notification.settingsUiUpdatedTitle'),
            tr('runtime.notification.settingsUiUpdatedBody')
        );
        store.settings.internal.設定画面更新を通知済み = true;
    }
    if (store.settings.internal.自動クリーンアップ旧変数機能を通知済み === false) {
        notify(
            tr('runtime.notification.autoCleanupFeatureTitle'),
            tr('runtime.notification.autoCleanupFeatureBody')
        );
        store.settings.internal.自動クリーンアップ旧変数機能を通知済み = true;
    }
    if (store.settings.internal.API温度等の設定更新を通知済み === false) {
        notify(
            tr('runtime.notification.customApiOptionsTitle'),
            tr('runtime.notification.customApiOptionsBody')
        );
        store.settings.internal.API温度等の設定更新を通知済み = true;
    }

    if (store.settings.internal.自動クリーンアップ旧変数機能を既定で有効化済み === false) {
        notify(
            tr('runtime.notification.cleanupDefaultTitle'),
            tr('runtime.notification.cleanupDefaultBody')
        );
        store.settings.internal.自動クリーンアップ旧変数機能を既定で有効化済み = true;
        store.settings.自動クリーンアップ変数.有効 = true;
    }

    if (store.settings.internal.内蔵脱獄を通知済み === false) {
        notify(
            tr('runtime.notification.builtinJailbreakTitle'),
            tr('runtime.notification.builtinJailbreakBody')
        );
        store.settings.internal.内蔵脱獄を通知済み = true;
    }

    if (store.settings.internal.追加モデル同時リクエストを通知済み === false) {
        notify(
            tr('runtime.notification.concurrentRequestsTitle'),
            tr('runtime.notification.concurrentRequestsBody')
        );
        store.settings.internal.追加モデル同時リクエストを通知済み = true;
    }

    if (store.settings.通知.MVUフレームワーク読み込み成功) {
        toastr.info(
            tr('runtime.notification.buildInfo', {
                date: __BUILD_DATE__ ?? tr('runtime.common.unknown'),
                commit: __COMMIT_ID__ ?? tr('runtime.common.unknown'),
            }),
            tr('runtime.notification.scriptLoadedTitle')
        );
    }

    return () => {};
}

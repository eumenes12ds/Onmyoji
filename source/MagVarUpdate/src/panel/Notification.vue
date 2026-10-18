<template>
    <Section :label="t('panel.notification.section')">
        <template #content>
            <Checkbox v-model="store.settings.通知.MVUフレームワーク読み込み成功">
                <span>{{ t('panel.notification.frameworkLoaded') }}</span>
            </Checkbox>
            <Checkbox v-model="store.settings.通知.変数初期化成功">
                <span>{{ t('panel.notification.variablesInitialized') }}</span>
            </Checkbox>
            <!-- 保留旧版 mvu_zod 使用的 DOM ID，兼容外部脚本读取通知开关。 -->
            <Checkbox id="mvu_notification_error" v-model="store.settings.通知.変数更新エラー">
                <span>{{ t('panel.notification.variableError') }}</span>
            </Checkbox>
            <Checkbox v-model="store.settings.通知.追加モデル解析中">
                <span>{{ t('panel.notification.extraModelParsing') }}</span>
            </Checkbox>
        </template>
    </Section>
</template>

<script setup lang="ts">
import Checkbox from '@/panel/component/Checkbox.vue';
import Section from '@/panel/component/Section.vue';
import { useMvuI18n } from '@/i18n';
import { useDataStore } from '@/store';

const store = useDataStore();
const { t } = useMvuI18n();
</script>

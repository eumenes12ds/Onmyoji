<template>
    <Detail :title="t('panel.request.section')">
        <Field :label="t('panel.request.method')">
            <template #label-suffix>
                <HelpIcon :help="request_method_help" />
            </template>
            <Select
                v-model="store.settings.追加モデル解析設定.リクエスト方式"
                :options="request_method_options"
            />
        </Field>

        <Field :label="t('panel.request.count')">
            <RangeNumber
                v-model="store.settings.追加モデル解析設定.リクエスト回数"
                :min="
                    store.settings.追加モデル解析設定.リクエスト方式 === '最初に1回リクエストし、失敗したら同時に複数回リクエスト'
                        ? 2
                        : 1
                "
                :max="10"
                :step="1"
            />
        </Field>

        <Field :label="t('panel.request.auto')">
            <template #label-suffix>
                <HelpIcon :help="t('panel.request.autoHelp')" />
                <OverrideBadge
                    v-if="store.has_character_settings_override('追加モデル解析設定.自動リクエスト有効')"
                    :value="auto_request_override_label"
                />
            </template>
            <Checkbox v-model="store.settings.追加モデル解析設定.自動リクエスト有効">
                <span>{{ t('common.enabled') }}</span>
            </Checkbox>
        </Field>
    </Detail>
</template>

<script setup lang="ts">
import { useMvuI18n } from '@/i18n';
import Checkbox from '@/panel/component/Checkbox.vue';
import Detail from '@/panel/component/Detail.vue';
import Field from '@/panel/component/Field.vue';
import HelpIcon from '@/panel/component/HelpIcon.vue';
import OverrideBadge from '@/panel/component/OverrideBadge.vue';
import RangeNumber from '@/panel/component/RangeNumber.vue';
import Select from '@/panel/component/Select.vue';
import request_method_help_en from '@/panel/update/request_method.en.md';
import request_method_help_zh_cn from '@/panel/update/request_method.zh-CN.md';
import { useDataStore } from '@/store';
import { compare } from 'compare-versions';
import { computed, watch } from 'vue';

const store = useDataStore();
const { locale, t } = useMvuI18n();
const request_method_help = computed(() =>
    locale.value === 'zh-CN' ? request_method_help_zh_cn : request_method_help_en
);
const auto_request_override_label = computed(() =>
    t(store.effective_settings.追加モデル解析設定.自動リクエスト有効 ? 'common.enabled' : 'common.disabled')
);
const request_method_options = computed(() => [
    { value: "順番にリクエストし、失敗したら再試行", label: t('panel.request.sequential') },
    { value: "同時に複数回リクエスト", label: t('panel.request.parallel') },
    {
        value: "最初に1回リクエストし、失敗したら同時に複数回リクエスト",
        label: t('panel.request.onceThenParallel'),
    },
]);

watch(
    () => store.settings.追加モデル解析設定.リクエスト方式,
    value => {
        if (
            value !== "順番にリクエストし、失敗したら再試行" &&
            compare(store.versions.tavernhelper, '4.4.3', '<')
        ) {
            toastr.warning(t('panel.request.batchWarning'), t('panel.request.batchWarningTitle'), {
                timeOut: 5000,
            });
        }
    }
);
</script>

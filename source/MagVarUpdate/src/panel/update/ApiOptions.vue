<template>
    <Field :label="t('panel.prompt.jailbreakStrategy')">
        <template #label-suffix>
            <HelpIcon :help="prompt_break_help" />
        </template>
        <Select v-model="store.settings.追加モデル解析設定.脱獄方案" :options="jailbreak_options" />
    </Field>

    <Field
        v-if="store.settings.追加モデル解析設定.脱獄方案 === 'その他のプリセットを使用'"
        :label="t('panel.prompt.targetPreset')"
    >
        <Select
            v-if="available_preset_names.length > 0"
            v-model="store.settings.追加モデル解析設定.その他プリセット名"
            :options="available_preset_names"
        />
        <input
            v-else
            class="text_pole"
            type="text"
            disabled
            :value="t('panel.prompt.noSavedPreset')"
        />
    </Field>

    <Field
        v-if="store.settings.追加モデル解析設定.脱獄方案 === '内蔵脱獄を使用'"
        :label="t('panel.prompt.randomHeader')"
    >
        <template #label-suffix>
            <HelpIcon :help="t('panel.prompt.randomHeaderHelp')" />
        </template>
        <Checkbox v-model="store.settings.追加モデル解析設定.ランダムヘッダー">
            <span>{{ t('panel.prompt.randomHeader') }}</span>
        </Checkbox>
    </Field>

    <Field :label="t('panel.prompt.responseFormat')">
        <template #label-suffix>
            <HelpIcon :help="prompt_toolcall_help" />
        </template>
        <Select
            v-model="store.settings.追加モデル解析設定.応答フォーマット"
            :options="response_format_options"
        />
    </Field>

    <Field
        v-if="store.settings.追加モデル解析設定.応答フォーマット === 'フォーマット出力(v4互換)'"
        :label="t('panel.prompt.disableThinking')"
    >
        <template #label-suffix>
            <HelpIcon :help="t('panel.prompt.disableThinkingHelp')" />
        </template>
        <Checkbox v-model="store.settings.追加モデル解析設定.thinking無効">
            <span>{{ t('panel.prompt.disable') }}</span>
        </Checkbox>
    </Field>

    <Field :label="t('panel.prompt.fakeStreaming')">
        <template #label-suffix>
            <HelpIcon :help="t('panel.prompt.fakeStreamingHelp')" />
        </template>
        <Checkbox v-model="fake_streaming_model" :disabled="pi_requires_streaming">
            <span>{{ t('common.enabled') }}</span>
        </Checkbox>
    </Field>
</template>

<script setup lang="ts">
import { getFunctionCallingApiVersionUnsupportedMessage } from '@/function/is_function_calling_supported';
import { getAvailableExtraModelPresetNames } from '@/function/update/extra_model_preset';
import { isPiStreamingRequired } from '@/function/update/pi/provider_target';
import { useMvuI18n } from '@/i18n';
import Checkbox from '@/panel/component/Checkbox.vue';
import Field from '@/panel/component/Field.vue';
import HelpIcon from '@/panel/component/HelpIcon.vue';
import Select from '@/panel/component/Select.vue';
import prompt_break_help_en from '@/panel/update/prompt_break.en.md';
import prompt_break_help_zh_cn from '@/panel/update/prompt_break.zh-CN.md';
import prompt_toolcall_help_en from '@/panel/update/prompt_toolcall.en.md';
import prompt_toolcall_help_zh_cn from '@/panel/update/prompt_toolcall.zh-CN.md';
import { EXTRA_MODEL_RESPONSE_FORMATS, useDataStore } from '@/store';
import { computed, watch } from 'vue';

const store = useDataStore();
const { locale, t } = useMvuI18n();
const pi_requires_streaming = computed(
    () =>
        store.settings.追加モデル解析設定.モデル出典 === "その他" &&
        isPiStreamingRequired(store.settings.追加モデル解析設定.pi.api)
);
const fake_streaming_model = computed({
    get: () => pi_requires_streaming.value || store.settings.追加モデル解析設定.疑似ストリーミング互換,
    set: (enabled: boolean) => {
        store.settings.追加モデル解析設定.疑似ストリーミング互換 = enabled;
    },
});
const available_preset_names = computed(() => getAvailableExtraModelPresetNames());
const prompt_break_help = computed(() =>
    locale.value === 'zh-CN' ? prompt_break_help_zh_cn : prompt_break_help_en
);
const prompt_toolcall_help = computed(() =>
    locale.value === 'zh-CN' ? prompt_toolcall_help_zh_cn : prompt_toolcall_help_en
);
const jailbreak_options = computed(() => [
    { value: "内蔵脱獄を使用", label: t('panel.prompt.jailbreak.builtin') },
    { value: "現在のプリセットを使用", label: t('panel.prompt.jailbreak.currentPreset') },
    { value: "その他のプリセットを使用", label: t('panel.prompt.jailbreak.otherPreset') },
]);
const response_format_options = computed(() =>
    EXTRA_MODEL_RESPONSE_FORMATS.map(value => ({
        value,
        label: {
            チャットメッセージ: t('panel.prompt.response.chatMessage'),
            ツール呼び出し: t('panel.prompt.response.toolCall'),
            フォーマット出力: t('panel.prompt.response.structured'),
            "フォーマット出力(v4互換)": t('panel.prompt.response.structuredV4'),
        }[value],
    }))
);

/** 使用其他预设时保持名称有效；目录为空则清空，原选择失效则选取首项。 */
function ensureValidPresetSelection() {
    if (store.settings.追加モデル解析設定.脱獄方案 !== "その他のプリセットを使用") {
        return;
    }

    if (available_preset_names.value.length === 0) {
        store.settings.追加モデル解析設定.その他プリセット名 = '';
        return;
    }

    if (!available_preset_names.value.includes(store.settings.追加モデル解析設定.その他プリセット名)) {
        [store.settings.追加モデル解析設定.その他プリセット名] = available_preset_names.value;
    }
}

watch(available_preset_names, ensureValidPresetSelection, { immediate: true });
watch(
    () => store.settings.追加モデル解析設定.脱獄方案,
    () => ensureValidPresetSelection(),
    { immediate: true }
);

watch(
    () =>
        [
            store.settings.追加モデル解析設定.応答フォーマット,
            store.settings.追加モデル解析設定.モデル出典,
        ] as const,
    ([value, model_source]) => {
        if (value === "ツール呼び出し" && model_source !== "その他") {
            const version_message = getFunctionCallingApiVersionUnsupportedMessage();
            if (version_message) {
                toastr.error(version_message, t('panel.prompt.toolCallUnavailableTitle'), {
                    timeOut: 5000,
                });
                store.settings.追加モデル解析設定.応答フォーマット = "チャットメッセージ";
                return;
            }
            if (!SillyTavern.ToolManager.isToolCallingSupported()) {
                toastr.error(
                    t('panel.prompt.toolCallUnsupported'),
                    t('panel.prompt.toolCallUnavailableTitle'),
                    {
                        timeOut: 5000,
                    }
                );
                store.settings.追加モデル解析設定.応答フォーマット = "チャットメッセージ";
                return;
            }
        }
        if (value === "フォーマット出力(v4互換)" && model_source === "プラグと同じ") {
            toastr.error(
                t('panel.prompt.structuredV4RequiresCustom'),
                t('panel.prompt.structuredV4UnavailableTitle'),
                {
                    timeOut: 5000,
                }
            );
            store.settings.追加モデル解析設定.応答フォーマット = "チャットメッセージ";
        }
    }
);
</script>

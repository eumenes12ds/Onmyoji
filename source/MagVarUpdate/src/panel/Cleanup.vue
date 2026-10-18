<template>
    <Section :label="t('panel.cleanup.section')">
        <template #content>
            <Checkbox v-model="store.settings.自動クリーンアップ変数.有効">
                <span>{{ t('panel.cleanup.enable') }}</span>
            </Checkbox>

            <Detail :title="t('panel.cleanup.strategy')">
                <Field id="mvu_snapshot_keep_interval" :label="t('panel.cleanup.snapshotInterval')">
                    <input
                        id="mvu_snapshot_keep_interval"
                        v-model.number="store.settings.自動クリーンアップ変数.スナップショット保持間隔"
                        type="number"
                        min="1"
                        step="1"
                        class="text_pole"
                        placeholder="50"
                    />
                </Field>

                <Field id="mvu_keep_recent_floors" :label="t('panel.cleanup.recentFloors')">
                    <input
                        id="mvu_keep_recent_floors"
                        v-model.number="store.settings.自動クリーンアップ変数.保持する変数の最近階層スタック数"
                        type="number"
                        min="1"
                        step="1"
                        class="text_pole"
                        placeholder="20"
                    />
                </Field>

                <Field id="mvu_restore_recent_floors" :label="t('panel.cleanup.restoreFloors')">
                    <input
                        id="mvu_restore_recent_floors"
                        v-model.number="store.settings.自動クリーンアップ変数.復元をトリガーする変数の最近階層スタック数"
                        type="number"
                        min="1"
                        step="1"
                        class="text_pole"
                        placeholder="10"
                    />
                </Field>
            </Detail>
        </template>
    </Section>
</template>

<script setup lang="ts">
import Checkbox from '@/panel/component/Checkbox.vue';
import Detail from '@/panel/component/Detail.vue';
import Field from '@/panel/component/Field.vue';
import Section from '@/panel/component/Section.vue';
import { useMvuI18n } from '@/i18n';
import { useDataStore } from '@/store';

const store = useDataStore();
const { t } = useMvuI18n();
</script>

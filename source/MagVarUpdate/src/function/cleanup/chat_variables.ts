import { useDataStore } from '@/store';

export function checkAndRemoveChatVariables() {
    const store = useDataStore();
    if (store.effective_settings.互換性.チャット変数に更新 === false) {
        updateVariablesWith(
            variables => {
                _.unset(variables, 'initialized_lorebooks');
                _.unset(variables, 'stat_data');
                _.unset(variables, 'schema');
                _.unset(variables, 'display_data');
                _.unset(variables, 'delta_data');
                return variables;
            },
            { type: 'chat' }
        );
    }
}

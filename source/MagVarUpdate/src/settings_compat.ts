import { normalizeMvuSettings } from './settings_contract';
export function decodeMvuSettings(value: unknown): any {
    const result=normalizeMvuSettings(value);
    return result;
}
export const encodeMvuSettings = (value: unknown, _previous?: unknown): any => decodeMvuSettings(value);
export function readMvuSettings(): unknown {
    const settings=SillyTavern.extensionSettings;
    return _.get(settings,'mvu_jp_settings',_.get(settings,'mvu_settings',{}));
}

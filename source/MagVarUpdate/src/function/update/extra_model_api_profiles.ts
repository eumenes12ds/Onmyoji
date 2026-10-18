import { normalizePiThinkingLevel, type PiThinkingLevel } from './pi/thinking_setting';
import { tr } from '@/i18n';
import {
    getPiProviderTargetDefinition,
    resolvePiApiKeyScope,
} from '@/function/update/pi/provider_target';
import { klona } from 'klona';
import { resolvePiCredentialReferences, type PiCredentialReferences } from './pi/credential_refs';

export type ExtraModelApiProfileBackend = 'custom' | 'pi';

export type ExtraModelApiRequestFields = {
    脱獄方案: "内蔵脱獄を使用" | "現在のプリセットを使用" | "その他のプリセットを使用";
    その他プリセット名: string;
    ランダムヘッダー: boolean;
    応答フォーマット: "チャットメッセージ" | "ツール呼び出し" | "フォーマット出力" | "フォーマット出力(v4互換)";
    thinking無効: boolean;
    疑似ストリーミング互換: boolean;
};

const API_REQUEST_FIELDS = [
    "脱獄方案",
    "その他プリセット名",
    "ランダムヘッダー",
    "応答フォーマット",
    "thinking無効",
    "疑似ストリーミング互換",
] as const satisfies readonly (keyof ExtraModelApiRequestFields)[];

/** 提取已配置的请求选项，保留缺失字段，供方案保存和旧方案补全使用。 */
function extractApiRequestFields(
    config: Partial<ExtraModelApiRequestFields>
): Partial<ExtraModelApiRequestFields> {
    return Object.fromEntries(
        API_REQUEST_FIELDS.filter(field => config[field] !== undefined).map(field => [
            field,
            config[field],
        ])
    );
}

export type ExtraModelPiConnectionFields = {
    [key: string]: unknown;
    /** 各服务商绑定的集中 OAuth 凭证编号；空映射表示明确未登录。 */
    credentialIds?: PiCredentialReferences;
    provider: string;
    api: string;
    authType: string;
    endpoint: string;
    useProxy: boolean;
    thinkingLevel?: PiThinkingLevel;
    model: string;
    contextWindow: number | string;
    customHeaders: string;
    customIncludeBody: string;
    customExcludeBody: string;
};

export type ExtraModelPiSettings = ExtraModelPiConnectionFields & {
    credentials: Record<string, unknown>;
    apiKeys?: Record<string, string>;
};

export type ExtraModelApiProfile = Partial<ExtraModelApiRequestFields> & {
    [key: string]: unknown;
    名前: string;
    backend?: ExtraModelApiProfileBackend;
    apiアドレス: string;
    APIキー: string;
    モデル名: string;
    pi?: ExtraModelPiConnectionFields;
};

export type ExtraModelApiProfileFields = Partial<ExtraModelApiRequestFields> & {
    モデル出典?: "プラグと同じ" | "カスタム" | "その他";
    apiアドレス: string;
    APIキー: string;
    customApiKey?: string;
    モデル名: string;
    pi?: ExtraModelPiSettings;
    apiプロファイル一覧: ExtraModelApiProfile[];
    現在のapiプロファイル: string;
};

export const DEFAULT_EXTRA_MODEL_API_PROFILE_NAME = "既定";

/** 统一方案名两端空白，避免查找、去重和保存使用不同的名称。 */
function normalizeExtraModelApiProfileName(name: string): string {
    return name.trim();
}

/**
 * 将方案中的上下文窗口规范为非负整数，0 表示使用目录值。
 * 返回 undefined 表示配置无效，调用方不得将其当作目录默认值。
 */
export function normalizeExtraModelPiProfileContextWindow(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isInteger(value) && value >= 0 ? value : undefined;
    }
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
        return 0;
    }
    const parsed = Number(trimmed);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

/** 根据当前模型来源确定方案保存的是自定义连接还是 Pi 连接。 */
function getExtraModelApiProfileBackend(
    config: ExtraModelApiProfileFields
): ExtraModelApiProfileBackend {
    return config.モデル出典 === "その他" ? 'pi' : 'custom';
}

/**
 * 生成脱离响应式代理的连接快照，并规范连接标识与上下文窗口。
 * 快照不包含 OAuth 凭证或按目标缓存的 API Key，避免方案复制这些共享状态。
 */
function clonePiConnectionFields(
    pi: ExtraModelPiConnectionFields | ExtraModelPiSettings | undefined
): ExtraModelPiConnectionFields | undefined {
    if (pi === undefined) {
        return undefined;
    }

    // Settings and profile entries normally arrive as Vue/Pinia reactive proxies. Native
    // structuredClone rejects proxies with DataCloneError, while klona traverses them into
    // detached plain objects and still preserves unknown forward-compatible fields.
    const cloned = klona(pi);
    delete cloned.credentials;
    delete cloned.apiKeys;
    if (pi.credentialIds !== undefined || pi.credentials !== undefined) {
        cloned.credentialIds = resolvePiCredentialReferences(
            pi,
            (pi.credentials as Record<string, unknown> | undefined) ?? {}
        );
    }
    // Runtime resolution treats surrounding whitespace on connection identifiers as insignificant.
    // Persist the same canonical representation so profile validation, the Source form, dirty
    // checks, and runtime resolution cannot disagree about a target after import.
    for (const field of ['provider', 'api', 'authType', 'endpoint', 'model'] as const) {
        if (typeof cloned[field] === 'string') {
            cloned[field] = cloned[field].trim();
        }
    }
    // Profiles saved before this option existed, and malformed imported values, must retain the
    // direct-transport default rather than becoming enabled through truthiness coercion.
    cloned.useProxy = cloned.useProxy === true;
    cloned.thinkingLevel = normalizePiThinkingLevel(cloned.thinkingLevel);
    const context_window = normalizeExtraModelPiProfileContextWindow(cloned.contextWindow);
    if (context_window !== undefined) {
        cloned.contextWindow = context_window;
    }
    return cloned;
}

/** 仅为完整且受支持的 API Key 目标解析密钥缓存位置；无效连接返回空字符串。 */
function resolvePiConnectionApiKeyScope(
    pi: ExtraModelPiConnectionFields | ExtraModelPiSettings | undefined
): string {
    if (
        pi === undefined ||
        typeof pi.provider !== 'string' ||
        typeof pi.api !== 'string' ||
        typeof pi.authType !== 'string' ||
        typeof pi.endpoint !== 'string'
    ) {
        return '';
    }

    return resolvePiApiKeyScope(
        getPiProviderTargetDefinition(pi.provider.trim()),
        pi.api.trim(),
        pi.authType.trim(),
        pi.endpoint
    );
}

/** 检查导入快照是否具备全部连接字段及合法类型，避免用默认值补成可发送连接。 */
function hasCompletePiConnectionSnapshot(
    pi: ExtraModelPiConnectionFields | ExtraModelPiSettings | undefined
): pi is ExtraModelPiConnectionFields | ExtraModelPiSettings {
    return (
        pi !== undefined &&
        typeof pi.provider === 'string' &&
        typeof pi.api === 'string' &&
        typeof pi.authType === 'string' &&
        (pi.authType.trim() === 'api_key' || pi.authType.trim() === 'oauth') &&
        typeof pi.endpoint === 'string' &&
        typeof pi.useProxy === 'boolean' &&
        typeof pi.model === 'string' &&
        typeof pi.contextWindow === 'number' &&
        Number.isInteger(pi.contextWindow) &&
        pi.contextWindow >= 0 &&
        typeof pi.customHeaders === 'string' &&
        typeof pi.customIncludeBody === 'string' &&
        typeof pi.customExcludeBody === 'string'
    );
}

/** 在结构完整的基础上检查服务商、协议和模型是否已填写。 */
function hasConfiguredPiConnectionSnapshot(
    pi: ExtraModelPiConnectionFields | ExtraModelPiSettings | undefined
): pi is ExtraModelPiConnectionFields | ExtraModelPiSettings {
    return (
        hasCompletePiConnectionSnapshot(pi) &&
        pi.provider.trim().length > 0 &&
        pi.api.trim().length > 0 &&
        pi.model.trim().length > 0
    );
}

/** 判断连接能否归属到有效的 API Key 目标，作为保留方案密钥的条件。 */
function hasValidPiApiKeyTarget(
    pi: ExtraModelPiConnectionFields | ExtraModelPiSettings | undefined
): boolean {
    return hasConfiguredPiConnectionSnapshot(pi) && resolvePiConnectionApiKeyScope(pi) !== '';
}

/** 规范单个方案的名称、后端和连接快照，并清除不属于当前认证方式的密钥。 */
function normalizeExtraModelApiProfile(profile: ExtraModelApiProfile): ExtraModelApiProfile {
    const cloned = klona(profile);
    delete cloned.customApiKey;
    cloned.名前 = normalizeExtraModelApiProfileName(cloned.名前);
    const backend: ExtraModelApiProfileBackend = cloned.backend === 'pi' ? 'pi' : 'custom';
    cloned.backend = backend;

    if (backend === 'pi' && cloned.pi !== undefined) {
        cloned.pi = clonePiConnectionFields(cloned.pi);
    } else {
        delete cloned.pi;
    }
    if (backend === 'pi') {
        // These legacy top-level fields belong to the hidden Custom source. Pi owns its endpoint
        // and model inside `pi`, so importing or saving them here must never overwrite that cache.
        cloned.apiアドレス = '';
        cloned.モデル名 = '';

        // A profile-level key has wire meaning only for a registry-backed, normalizable API-key
        // target. OAuth and malformed/future targets retain metadata but never a dormant secret.
        if (!hasValidPiApiKeyTarget(cloned.pi)) {
            cloned.APIキー = '';
        }
    }
    return cloned;
}

/** 规范方案列表，剔除空名称和重复名称，同名方案只保留首次出现的条目。 */
function normalizeExtraModelApiProfileList(
    profiles: ExtraModelApiProfile[]
): ExtraModelApiProfile[] {
    const names = new Set<string>();
    const normalized_profiles: ExtraModelApiProfile[] = [];
    for (const profile of profiles) {
        const normalized_profile = normalizeExtraModelApiProfile(profile);
        if (normalized_profile.名前 === '' || names.has(normalized_profile.名前)) {
            continue;
        }
        names.add(normalized_profile.名前);
        normalized_profiles.push(normalized_profile);
    }
    return normalized_profiles;
}

/** 将方案连接合并到运行设置，同时保留当前凭证仓库和目标密钥缓存。 */
function mergePiConnectionFields(
    current: ExtraModelPiSettings | undefined,
    profile: ExtraModelPiConnectionFields
): ExtraModelPiSettings {
    const current_clone = current === undefined ? undefined : klona(current);
    const profile_clone = clonePiConnectionFields(profile)!;
    return {
        ...current_clone,
        ...profile_clone,
        credentialIds: resolvePiCredentialReferences(profile, current_clone?.credentials),
        credentials: klona(current_clone?.credentials ?? {}),
        apiKeys: klona(current_clone?.apiKeys ?? {}),
    } as ExtraModelPiSettings;
}

/** 清空可发送的连接字段，保留共享凭证和密钥缓存，等待用户重新配置。 */
function clearPiConnectionFields(pi: ExtraModelPiSettings): ExtraModelPiSettings {
    const cloned = klona(pi);
    return {
        ...cloned,
        credentialIds: {},
        provider: '',
        api: '',
        authType: 'api_key',
        endpoint: '',
        useProxy: false,
        thinkingLevel: 'default',
        model: '',
        contextWindow: 0,
        credentials: klona(cloned.credentials),
        apiKeys: klona(cloned.apiKeys ?? {}),
        customHeaders: '',
        customIncludeBody: '',
        customExcludeBody: '',
    };
}

/** 从当前设置提取可保存的连接和请求选项；Pi 方案必须先通过完整性校验。 */
export function extractExtraModelApiProfileFields(
    config: ExtraModelApiProfileFields
): ExtraModelApiProfile {
    const backend = getExtraModelApiProfileBackend(config);
    const pi_snapshot = backend === 'pi' ? clonePiConnectionFields(config.pi) : undefined;
    if (backend === 'pi' && !hasConfiguredPiConnectionSnapshot(pi_snapshot)) {
        throw new Error(tr('runtime.apiProfile.piConfigRequired'));
    }
    return {
        名前:
            normalizeExtraModelApiProfileName(config.現在のapiプロファイル) ||
            DEFAULT_EXTRA_MODEL_API_PROFILE_NAME,
        backend,
        apiアドレス: backend === 'pi' ? '' : config.apiアドレス,
        APIキー: backend === 'pi' && !hasValidPiApiKeyTarget(pi_snapshot) ? '' : config.APIキー,
        モデル名: backend === 'pi' ? '' : config.モデル名,
        ...extractApiRequestFields(config),
        ...(backend === 'pi' && pi_snapshot !== undefined ? { pi: pi_snapshot } : {}),
    };
}

/**
 * 应用方案的连接及请求选项，并切换到相应模型来源。
 * 无效 Pi 快照会清空活动连接，不能借用其他来源的密钥继续发送。
 */
export function applyExtraModelApiProfile(
    config: ExtraModelApiProfileFields,
    profile: ExtraModelApiProfile
): ExtraModelApiProfileFields {
    const normalized_profile = normalizeExtraModelApiProfile(profile);
    const result: ExtraModelApiProfileFields = {
        ...config,
        ...extractApiRequestFields(normalized_profile),
        モデル出典: normalized_profile.backend === 'pi' ? "その他" : "カスタム",
        APIキー: normalized_profile.APIキー,
        現在のapiプロファイル: normalized_profile.名前,
        ...(normalized_profile.backend === 'custom'
            ? {
                  apiアドレス: normalized_profile.apiアドレス,
                  モデル名: normalized_profile.モデル名,
              }
            : {}),
    };
    if (normalized_profile.backend === 'pi') {
        if (hasConfiguredPiConnectionSnapshot(normalized_profile.pi)) {
            result.pi = mergePiConnectionFields(config.pi, normalized_profile.pi);
        } else {
            // Never combine a malformed Pi profile's key with the previously active provider,
            // endpoint, or model. Preserve credentials, but disable the connection until the
            // user repairs and saves a complete snapshot.
            result.APIキー = '';
            if (config.pi !== undefined) {
                result.pi = clearPiConnectionFields(config.pi);
            }
        }
    }
    return result;
}

/** 按规范化名称新增或更新方案，更新时保留已有条目的其他字段。 */
export function upsertExtraModelApiProfile(
    profiles: ExtraModelApiProfile[],
    profile: ExtraModelApiProfile
): ExtraModelApiProfile[] {
    const normalized_name = normalizeExtraModelApiProfileName(profile.名前);
    if (!normalized_name) {
        throw new Error(tr('runtime.apiProfile.nameRequired'));
    }

    const normalized_profiles = normalizeExtraModelApiProfileList(profiles);
    const next_profile = {
        ...normalizeExtraModelApiProfile(profile),
        名前: normalized_name,
    };
    const existing_index = normalized_profiles.findIndex(item => item.名前 === normalized_name);
    if (existing_index === -1) {
        return [...normalized_profiles, next_profile];
    }

    const next_profiles = [...normalized_profiles];
    next_profiles[existing_index] = normalizeExtraModelApiProfile({
        ...normalized_profiles[existing_index],
        ...next_profile,
    });
    return next_profiles;
}

/** 返回删除指定方案后的规范化列表，不直接修改原列表。 */
export function removeExtraModelApiProfile(
    profiles: ExtraModelApiProfile[],
    profile_name: string
): ExtraModelApiProfile[] {
    const normalized_name = normalizeExtraModelApiProfileName(profile_name);
    return normalizeExtraModelApiProfileList(profiles).filter(
        profile => profile.名前 !== normalized_name
    );
}

/** 按规范化名称检查方案是否存在，供保存和删除操作校验。 */
export function hasExtraModelApiProfile(
    profiles: ExtraModelApiProfile[],
    profile_name: string
): boolean {
    const normalized_name = normalizeExtraModelApiProfileName(profile_name);
    return normalizeExtraModelApiProfileList(profiles).some(
        profile => profile.名前 === normalized_name
    );
}

/** 比较活动方案与当前连接、密钥及请求选项，判断是否存在未保存修改。 */
export function isActiveExtraModelApiProfileDirty(config: ExtraModelApiProfileFields): boolean {
    const active_name = normalizeExtraModelApiProfileName(config.現在のapiプロファイル);
    if (!active_name) {
        return false;
    }

    const profile = normalizeExtraModelApiProfileList(config.apiプロファイル一覧).find(
        item => item.名前 === active_name
    );
    if (!profile) {
        return false;
    }

    const normalized_profile = normalizeExtraModelApiProfile(profile);
    const backend = getExtraModelApiProfileBackend(config);
    if (normalized_profile.backend !== backend || normalized_profile.APIキー !== config.APIキー) {
        return true;
    }

    if (
        API_REQUEST_FIELDS.some(
            field =>
                normalized_profile[field] !== undefined &&
                normalized_profile[field] !== config[field]
        )
    ) {
        return true;
    }

    if (
        backend === 'custom' &&
        (normalized_profile.apiアドレス !== config.apiアドレス ||
            normalized_profile.モデル名 !== config.モデル名)
    ) {
        return true;
    }

    return (
        backend === 'pi' && !_.isEqual(normalized_profile.pi, clonePiConnectionFields(config.pi))
    );
}

/** 解除方案绑定并清空活动连接；使用 Pi 时保留隐藏的自定义连接字段。 */
export function clearUnboundExtraModelApiProfileFields(
    config: ExtraModelApiProfileFields
): ExtraModelApiProfileFields {
    const preserve_hidden_custom_fields = config.モデル出典 === "その他";
    return {
        ...config,
        現在のapiプロファイル: '',
        apiアドレス: preserve_hidden_custom_fields ? config.apiアドレス : '',
        APIキー: '',
        モデル名: preserve_hidden_custom_fields ? config.モデル名 : '',
        ...(config.モデル出典 === "その他" && config.pi !== undefined
            ? { pi: clearPiConnectionFields(config.pi) }
            : {}),
    };
}

/** 校正活动方案引用，使列表、当前名称和连接状态保持一致。 */
export function reconcileExtraModelApiProfileSelection<T extends ExtraModelApiProfileFields>(
    config: T
): T {
    const normalized_config = {
        ...config,
        apiプロファイル一覧: normalizeExtraModelApiProfileList(config.apiプロファイル一覧),
        現在のapiプロファイル: normalizeExtraModelApiProfileName(config.現在のapiプロファイル),
    } as T;
    const active_name = normalized_config.現在のapiプロファイル;
    if (!active_name) {
        return normalized_config;
    }

    if (hasExtraModelApiProfile(normalized_config.apiプロファイル一覧, active_name)) {
        return normalized_config;
    }

    if (normalized_config.apiプロファイル一覧.length === 0) {
        return {
            ...normalized_config,
            現在のapiプロファイル: '',
        };
    }

    return applyExtraModelApiProfile(
        {
            ...normalized_config,
            apiプロファイル一覧: normalized_config.apiプロファイル一覧,
        },
        normalized_config.apiプロファイル一覧[0]
    ) as T;
}

/** 删除指定的活动方案，并同步清理方案选择及相关连接字段。 */
export function deleteActiveExtraModelApiProfile(
    config: ExtraModelApiProfileFields,
    profile_name: string
): ExtraModelApiProfileFields {
    const normalized_name = normalizeExtraModelApiProfileName(profile_name);
    if (
        normalized_name === '' ||
        normalized_name !== normalizeExtraModelApiProfileName(config.現在のapiプロファイル) ||
        !hasExtraModelApiProfile(config.apiプロファイル一覧, normalized_name)
    ) {
        return config;
    }

    const remaining = removeExtraModelApiProfile(config.apiプロファイル一覧, profile_name);
    if (remaining.length === 0) {
        return {
            ...clearUnboundExtraModelApiProfileFields(config),
            apiプロファイル一覧: [],
        };
    }

    return applyExtraModelApiProfile(
        {
            ...config,
            apiプロファイル一覧: remaining,
        },
        remaining[0]
    );
}

export type ExtraModelApiProfileDeletionConfirmation = 'discard_unsaved_changes' | 'delete_profile';

/**
 * 有未保存修改时先确认丢弃，再确认删除，任一步取消都返回 null。
 * 删除前再次核对活动方案，避免等待弹窗期间误删用户新选中的方案。
 */
export async function deleteActiveExtraModelApiProfileWithConfirmation(
    config: ExtraModelApiProfileFields,
    profile_name: string,
    confirm: (confirmation: ExtraModelApiProfileDeletionConfirmation) => Promise<boolean>
): Promise<ExtraModelApiProfileFields | null> {
    const normalized_name = normalizeExtraModelApiProfileName(profile_name);
    if (
        normalized_name === '' ||
        normalized_name !== normalizeExtraModelApiProfileName(config.現在のapiプロファイル) ||
        !hasExtraModelApiProfile(config.apiプロファイル一覧, normalized_name)
    ) {
        return config;
    }

    if (isActiveExtraModelApiProfileDirty(config) && !(await confirm('discard_unsaved_changes'))) {
        return null;
    }

    if (!(await confirm('delete_profile'))) {
        return null;
    }

    return deleteActiveExtraModelApiProfile(config, profile_name);
}

/**
 * 补全方案中缺失的请求选项，并校正方案选择与密钥归属。
 * 不完整的 Pi 快照保持不可发送，不能从遗留自定义字段推导出 Pi 连接。
 */
export function migrateExtraModelApiProfiles<T extends ExtraModelApiProfileFields>(config: T): T {
    let migrated = {
        ...config,
        ...(config.pi === undefined
            ? {}
            : {
                  pi: {
                      ...config.pi,
                      credentialIds: resolvePiCredentialReferences(
                          config.pi,
                          config.pi.credentials
                      ),
                  },
              }),
        // Old profiles only stored connection fields. Copy the current request options into
        // every profile once; saved per-profile values must survive subsequent loads/imports.
        apiプロファイル一覧: normalizeExtraModelApiProfileList(
            config.apiプロファイル一覧.map(profile => ({
                ...profile,
                ...(profile.backend === 'pi' && profile.pi !== undefined
                    ? {
                          pi: {
                              ...profile.pi,
                              credentialIds: resolvePiCredentialReferences(
                                  profile.pi,
                                  config.pi?.credentials
                              ),
                          },
                      }
                    : {}),
                ...extractApiRequestFields(config),
                ...extractApiRequestFields(profile),
            }))
        ),
        現在のapiプロファイル: normalizeExtraModelApiProfileName(config.現在のapiプロファイル),
    } as T;

    // The shared root key has wire meaning only for a registry-backed, normalizable API-key target.
    // Clear stale imported values even when there is no active profile (and before legacy-profile
    // detection), while retaining the source-specific Custom/API-key caches and OAuth store.
    if (
        migrated.モデル出典 === "その他" &&
        resolvePiConnectionApiKeyScope(migrated.pi) === '' &&
        migrated.APIキー !== ''
    ) {
        migrated = {
            ...migrated,
            APIキー: '',
        } as T;
    }

    const active_profile = migrated.apiプロファイル一覧.find(
        profile => profile.名前 === migrated.現在のapiプロファイル
    );
    if (active_profile?.backend === 'pi' && !hasConfiguredPiConnectionSnapshot(active_profile.pi)) {
        migrated = applyExtraModelApiProfile(migrated, active_profile) as T;
    }

    if (migrated.apiプロファイル一覧.length === 0) {
        const has_legacy_custom_api =
            migrated.apiアドレス.trim().length > 0 ||
            migrated.APIキー.trim().length > 0 ||
            migrated.モデル名.trim().length > 0;
        if (has_legacy_custom_api) {
            // A newly selected but not yet configured Pi source may still carry legacy root
            // Custom fields. Do not turn those unrelated fields into a sendable Pi profile.
            if (
                getExtraModelApiProfileBackend(migrated) === 'pi' &&
                !hasConfiguredPiConnectionSnapshot(migrated.pi)
            ) {
                return reconcileExtraModelApiProfileSelection(migrated);
            }
            const profile = extractExtraModelApiProfileFields(migrated);
            migrated = {
                ...migrated,
                apiプロファイル一覧: [
                    {
                        ...profile,
                        名前: DEFAULT_EXTRA_MODEL_API_PROFILE_NAME,
                    },
                ],
                現在のapiプロファイル: migrated.現在のapiプロファイル || DEFAULT_EXTRA_MODEL_API_PROFILE_NAME,
            };
        }
    }

    return reconcileExtraModelApiProfileSelection(migrated);
}

/** 按名称查找并应用方案；不存在时抛出可展示的配置错误。 */
export function selectExtraModelApiProfile(
    config: ExtraModelApiProfileFields,
    profile_name: string
): ExtraModelApiProfileFields {
    const normalized_name = normalizeExtraModelApiProfileName(profile_name);
    const normalized_profiles = normalizeExtraModelApiProfileList(config.apiプロファイル一覧);
    const profile = normalized_profiles.find(item => item.名前 === normalized_name);
    if (!profile) {
        throw new Error(
            tr('runtime.apiProfile.notFound', {
                name: normalized_name,
            })
        );
    }
    return applyExtraModelApiProfile(
        {
            ...config,
            apiプロファイル一覧: normalized_profiles,
        },
        profile
    );
}

/** 保存当前连接和请求选项，支持更新活动方案或指定名称，并防止覆盖其他同名方案。 */
export function saveCurrentExtraModelApiProfile(
    config: ExtraModelApiProfileFields,
    profile_name?: string
): ExtraModelApiProfileFields {
    const target_name = normalizeExtraModelApiProfileName(profile_name ?? config.現在のapiプロファイル);
    if (!target_name) {
        throw new Error(tr('runtime.apiProfile.selectOrEnterName'));
    }

    if (
        hasExtraModelApiProfile(config.apiプロファイル一覧, target_name) &&
        normalizeExtraModelApiProfileName(config.現在のapiプロファイル) !== target_name
    ) {
        throw new Error(
            tr('runtime.apiProfile.alreadyExists', {
                name: target_name,
            })
        );
    }

    const normalized_profiles = normalizeExtraModelApiProfileList(config.apiプロファイル一覧);
    const source_profile = normalized_profiles.find(
        item => item.名前 === normalizeExtraModelApiProfileName(config.現在のapiプロファイル)
    );
    const normalized_source_profile =
        source_profile === undefined ? undefined : normalizeExtraModelApiProfile(source_profile);
    const profile: ExtraModelApiProfile = {
        ...normalized_source_profile,
        ...extractExtraModelApiProfileFields(config),
        名前: target_name,
    };
    if (profile.backend !== 'pi') {
        delete profile.pi;
    }
    return applyExtraModelApiProfile(
        {
            ...config,
            apiプロファイル一覧: upsertExtraModelApiProfile(normalized_profiles, profile),
        },
        profile
    );
}

/** 校验新名称不为空且未占用，再将当前配置另存为独立方案。 */
export function saveAsNewExtraModelApiProfile(
    config: ExtraModelApiProfileFields,
    profile_name: string
): ExtraModelApiProfileFields {
    const target_name = normalizeExtraModelApiProfileName(profile_name);
    if (!target_name) {
        throw new Error(tr('runtime.apiProfile.enterNewName'));
    }
    if (hasExtraModelApiProfile(config.apiプロファイル一覧, target_name)) {
        throw new Error(
            tr('runtime.apiProfile.alreadyExists', {
                name: target_name,
            })
        );
    }
    return saveCurrentExtraModelApiProfile(config, target_name);
}

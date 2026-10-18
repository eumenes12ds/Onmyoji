import { findUpdateMarkupBlocks, scanUpdateMarkup } from './structured_update';

const failure = '状態の更新を適用できませんでした。更新データが不完全、または形式が不正です。本文は保存されています。';

function validPointer(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('/') && value.length > 1
        && !/~(?![01])/.test(value) && !/[\u0000-\u001f]/.test(value)
        && value.slice(1).split('/').every(part => !['__proto__', 'prototype', 'constructor'].includes(part.replace(/~1/g, '/').replace(/~0/g, '~')));
}

function finiteData(value: unknown): boolean {
    if (typeof value === 'number') return Number.isFinite(value);
    if (Array.isArray(value)) return value.every(finiteData);
    if (value && typeof value === 'object') return Object.entries(value).every(([key, v]) => !['__proto__', 'prototype', 'constructor'].includes(key) && finiteData(v));
    return true;
}

function validOperation(op: any): boolean {
    if (!op || typeof op !== 'object' || Array.isArray(op) || !finiteData(op)) return false;
    if (!['replace', 'delta', 'insert', 'add', 'remove', 'move'].includes(op.op)) return false;
    if (!validPointer(op.path ?? (op.op === 'move' ? op.to : undefined))) return false;
    const fields = op.op === 'move' ? ['op', 'from', 'path', 'to'] : op.op === 'remove' ? ['op', 'path'] : ['op', 'path', 'value'];
    if (Object.keys(op).some(key => !fields.includes(key))) return false;
    if (op.op === 'move') return validPointer(op.from) && !(op.path && op.to);
    if (op.op === 'remove') return true;
    if (!Object.hasOwn(op, 'value')) return false;
    return op.op !== 'delta' || (typeof op.value === 'number' && Number.isFinite(op.value));
}

/** Recover only one omitted inner closing tag; never alter saved text or invent data. */
export function recoverMissingPatchClose(input: string): { text: string; recovered: boolean; error?: string } {
    const patches = findUpdateMarkupBlocks(input, 'patch');
    if (!patches.some(block => !block.closed)) return { text: input, recovered: false };
    const reject = () => ({ text: input, recovered: false, error: failure });
    const updates = findUpdateMarkupBlocks(input, 'update');
    const tokens = scanUpdateMarkup(input).tokens;
    // Multiple/nested blocks, missing outer tags and extra closers are ambiguous.
    if (patches.length !== 1 || updates.length !== 1 || !updates[0].closed || tokens.length !== 3) return reject();
    const [open, patch, close] = tokens;
    if (open.name !== 'update' || open.closing || patch.name !== 'patch' || patch.closing || close.name !== 'update' || !close.closing) return reject();
    if (!/^<UpdateVariable\s*>$/i.test(input.slice(open.start, open.end))
        || !/^<JSONPatch\s*>$/i.test(input.slice(patch.start, patch.end))
        || !/^<\/UpdateVariable\s*>$/i.test(input.slice(close.start, close.end))) return reject();
    const raw = input.slice(patch.end, close.start).trim();
    // Deliberately strict JSON: no partial arrays, prose, comments or fence repair.
    try {
        const operations = JSON.parse(raw);
        if (!Array.isArray(operations) || !operations.every(validOperation)) return reject();
    } catch { return reject(); }
    return { text: input.slice(0, close.start) + '</JSONPatch>\n' + input.slice(close.start), recovered: true };
}

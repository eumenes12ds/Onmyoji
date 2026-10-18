# Onmyoji Japanese runtime assets

Card-owned dependencies for `平安異聞録`. Release: `v2026.10.19.1`.


This repository contains runtime code, its maintained source, dependency modules, and licenses. It contains no character narrative, preset payload, cover image, account data, connection settings or credentials.

## Origins and modifications

- MagVarUpdate: `MagicalAstrogy/MagVarUpdate` commit `54be11b09f21b1c4266e2d54b6f1ba9a3598db05`, the exact source version of the Chinese card's original runtime. The original bundle SHA-256 is `cd02eb51e63af4f3ee9edc57c2d9f46f27063bf535c2fec45f66945af9429d60`. Japanese UI, help, settings keys/enums, isolated `mvu_jp_settings` persistence, and seven action names are localized. Upstream request behavior, including incremental correction, is retained. See `LICENSE-MagVarUpdate`.
- `mvu_zod`: `StageDog/tavern_resource` commit `12983fa53d4da19dc1f2a5e6b8c37a0eb12f2aa5`. Its original bundle SHA-256 is `e540ab99589ad83de1495056a84693bda00af92f8848926bcb9a53b9263a0302`. Changes are Japanese diagnostics and relative dependency imports. **This component retains the Aladdin Free Public License**, reproduced in `LICENSE-tavern-resource`; it is not relicensed as MIT. Corresponding source is in `source/tavern_resource`.
- 87 browser ESM dependency modules are mirrored under `vendor/esm`, with exact origins and hashes in `vendor/manifest.json`. Original versions are retained; import specifiers are rewritten to local relative files. Package notices are in `vendor/licenses` and indexed in `vendor/licenses.json`.

Modifications were made by eumenes12ds on 2026-10-17. Each upstream component retains its own license and copyright. See the individual notices before redistributing a component.

## Build

Install the dependencies recorded by `source/MagVarUpdate/package.json` and its lockfile. Set `CI=true` (which disables Vue production devtools), run its production webpack build, then run `node postprocess.cjs` at this repository root. The postprocessor rewrites imports against the existing reviewed vendor manifest; it refuses a new unresolved dependency. The checked-in `runtime/mvu_zod.js` is the upstream distribution with only the documented string/import substitutions; its corresponding TypeScript source is included separately.

The build used Node 24.18.1, webpack 5.111.0 and TypeScript 5.9.3. Webpack's build/version information can vary across machines; release integrity is determined by the checked-in SHA-256 manifest, not by an assertion of deterministic build metadata.

The host supplies Vue, jQuery, lodash, Zod and YAML APIs. Model-provider API addresses in SDKs are endpoints, not downloadable static assets. Two variable import helpers belong to Node-only SDK paths; browser execution was tested separately. No image assets are downloaded by the card runtime.

Japanese story variables are defined by the character card. The runtime's old settings spellings are accepted only at its input-normalization boundary to avoid corrupting shared Chinese settings; canonical writes use Japanese business keys and enums.

## Onmyoji assets

The initial v2026.10.18.1 runtime was copied from Hogwarts v2026.10.17.2 and therefore did not include the subsequent missing-JSONPatch-close recovery. Release v2026.10.19.1 ports that bounded parser recovery into this card-owned runtime without replacing its upstream version. Only one missing inner closing tag is recovered when a single outer UpdateVariable block closes and its strict JSON array and operations validate. Recovery uses a parsing copy and the existing native update/Zod path; incomplete JSON and ambiguous boundaries are rejected with a Japanese error. Stored message text is never rewritten, and no model retry or historical backfill is introduced. The Chinese Onmyoji runtime bundle has the same upstream SHA-256 documented above.

Three.js 0.160.0 retains its MIT license under vendor/three/0.160.0/LICENSE. Noto Serif JP v34 retains its SIL Open Font License under fonts/OFL.txt; the 124 variable-weight browser subsets are mirrored with origins and hashes. The 122 portrait images retain their original bytes; their origins are documented in asset-origins.json and no new license is asserted. Map lettering was localized with built-in ImageGen in two passes on 2026-10-18.

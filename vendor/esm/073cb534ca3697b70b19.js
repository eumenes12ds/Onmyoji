/**
 * Bundled by jsDelivr using Rollup v4.62.2 and esbuild v0.28.1.
 * Original file: /npm/@anthropic-ai/sdk@0.124.0/internal/node.browser.mjs
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
class s extends Error{}function t(n){return new Proxy({},{get(u,o){if(typeof o!="symbol")throw new s(`\`${n}.${o}\` is not available in this environment; it needs a Node.js-compatible runtime`)}})}const e=t("child_process"),r=t("crypto"),c=t("fs"),i=t("os"),a=t("path"),l=t("stream"),p=t("util");export{e as child_process,r as crypto,c as fs,i as os,a as path,l as stream,p as util};

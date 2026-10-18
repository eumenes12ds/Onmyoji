// Canonical Japanese MVU contract. Legacy spellings are input-only aliases.
type Node = { fields?: Record<string, [string, Node?]>; values?: Record<string, string>; items?: Node };
export const MVU_JP_CONTRACT = 'mvu-ja-v1';
export const MVU_JP_STORE_ID = 'MVU変数フレームワーク';
export const MVU_JP_SETTINGS_KEY = 'mvu_jp_settings';
export const MVU_JP_MODES = ['主AI追従出力', '追加モデル解析'] as const;
export const MVU_JP_BUTTONS = ["変数を再処理","初期変数を再読み込み","スナップショット階層","階層を再演","追加モデル解析を再試行","古い階層の変数をクリア"] as const;
const fields: Node = {
  "fields": {
    "通知": [
      "通知",
      {
        "fields": {
          "MVU框架加载成功": [
            "MVUフレームワーク読み込み成功"
          ],
          "变量初始化成功": [
            "変数初期化成功"
          ],
          "变量更新出错": [
            "変数更新エラー"
          ],
          "额外模型解析中": [
            "追加モデル解析中"
          ]
        }
      }
    ],
    "更新方式": [
      "更新方式",
      {
        "values": {
          "随AI输出": "主AI追従出力",
          "额外模型解析": "追加モデル解析"
        }
      }
    ],
    "额外模型解析配置": [
      "追加モデル解析設定",
      {
        "fields": {
          "破限方案": [
            "脱獄方案",
            {
              "values": {
                "使用内置破限": "内蔵脱獄を使用",
                "使用当前预设": "現在のプリセットを使用",
                "使用其他预设": "その他のプリセットを使用"
              }
            }
          ],
          "其他预设名称": [
            "その他プリセット名"
          ],
          "发送预设": [
            "プリセット送信"
          ],
          "使用函数调用": [
            "関数呼び出しを使用"
          ],
          "应答格式": [
            "応答フォーマット",
            {
              "values": {
                "聊天消息": "チャットメッセージ",
                "工具调用": "ツール呼び出し",
                "格式化输出": "フォーマット出力",
                "格式化输出(v4兼容)": "フォーマット出力(v4互換)"
              }
            }
          ],
          "关闭thinking": [
            "thinking無効"
          ],
          "兼容假流式": [
            "疑似ストリーミング互換"
          ],
          "随机头部": [
            "ランダムヘッダー"
          ],
          "启用自动请求": [
            "自動リクエスト有効"
          ],
          "请求方式": [
            "リクエスト方式",
            {
              "values": {
                "依次请求，失败后重试": "順番にリクエストし、失敗したら再試行",
                "同时请求多次": "同時に複数回リクエスト",
                "先请求一次, 失败后再同时请求多次": "最初に1回リクエストし、失敗したら同時に複数回リクエスト"
              }
            }
          ],
          "请求次数": [
            "リクエスト回数"
          ],
          "世界书条目白名单正则": [
            "ワールドブックエントリホワイトリスト正規表現"
          ],
          "世界书条目黑名单正则": [
            "ワールドブックエントリブラックリスト正規表現"
          ],
          "模型来源": [
            "モデル出典",
            {
              "values": {
                "与插头相同": "プラグと同じ",
                "自定义": "カスタム",
                "更多": "その他"
              }
            }
          ],
          "api地址": [
            "apiアドレス"
          ],
          "密钥": [
            "APIキー"
          ],
          "模型名称": [
            "モデル名"
          ],
          "频率惩罚": [
            "頻度ペナルティ"
          ],
          "存在惩罚": [
            "存在ペナルティ"
          ],
          "最大回复token数": [
            "最大応答トークン数"
          ],
          "api方案列表": [
            "apiプロファイル一覧",
            {
              "items": {
                "fields": {
                  "名称": [
                    "名前"
                  ],
                  "api地址": [
                    "apiアドレス"
                  ],
                  "密钥": [
                    "APIキー"
                  ],
                  "模型名称": [
                    "モデル名"
                  ]
                }
              }
            }
          ],
          "当前api方案": [
            "現在のapiプロファイル"
          ],
          "温度": [
            "温度"
          ]
        }
      }
    ],
    "自动清理变量": [
      "自動クリーンアップ変数",
      {
        "fields": {
          "启用": [
            "有効"
          ],
          "快照保留间隔": [
            "スナップショット保持間隔"
          ],
          "要保留变量的最近楼层数": [
            "保持する変数の最近階層スタック数"
          ],
          "触发恢复变量的最近楼层数": [
            "復元をトリガーする変数の最近階層スタック数"
          ]
        }
      }
    ],
    "兼容性": [
      "互換性",
      {
        "fields": {
          "更新到聊天变量": [
            "チャット変数に更新"
          ],
          "显示老旧功能": [
            "旧機能を表示"
          ],
          "sendas不视为user消息": [
            "sendasをuserメッセージとみなさない"
          ],
          "sandas不视为user消息": [
            "sandasをuserメッセージとみなさない"
          ],
          "额外模型解析非阻塞": [
            "追加モデル解析を非同期化"
          ]
        }
      }
    ],
    "自动触发额外模型解析": [
      "追加モデル解析を自動トリガー"
    ],
    "快照保留间隔": [
      "スナップショット保持間隔"
    ],
    "更新到聊天变量": [
      "チャット変数に更新"
    ],
    "auto_cleanup": [
      "auto_cleanup",
      {
        "fields": {
          "启用": [
            "有効"
          ],
          "快照保留间隔": [
            "スナップショット保持間隔"
          ],
          "要保留变量的最近楼层数": [
            "保持する変数の最近階層スタック数"
          ],
          "触发恢复变量的最近楼层数": [
            "復元をトリガーする変数の最近階層スタック数"
          ]
        }
      }
    ],
    "legacy": [
      "legacy",
      {
        "fields": {
          "更新到聊天变量": [
            "チャット変数に更新"
          ],
          "显示老旧功能": [
            "旧機能を表示"
          ],
          "sendas不视为user消息": [
            "sendasをuserメッセージとみなさない"
          ],
          "sandas不视为user消息": [
            "sandasをuserメッセージとみなさない"
          ],
          "额外模型解析非阻塞": [
            "追加モデル解析を非同期化"
          ]
        }
      }
    ],
    "internal": [
      "internal",
      {
        "fields": {
          "已提醒更新了配置界面": [
            "設定画面更新を通知済み"
          ],
          "已提醒自动清理旧变量功能": [
            "自動クリーンアップ旧変数機能を通知済み"
          ],
          "已提醒更新了API温度等配置": [
            "API温度等の設定更新を通知済み"
          ],
          "已默认开启自动清理旧变量功能": [
            "自動クリーンアップ旧変数機能を既定で有効化済み"
          ],
          "已提醒内置破限": [
            "内蔵脱獄を通知済み"
          ],
          "已提醒额外模型同时请求": [
            "追加モデル同時リクエストを通知済み"
          ],
          "已开启默认不兼容假流式": [
            "既定で疑似ストリーミング非互換を有効化済み"
          ]
        }
      }
    ]
  }
};
const buttonAliases: Record<string,string> = {
  "增量校正额外模型解析": "追加モデル解析を差分補正",
  "追加モデル解析を差分補正": "追加モデル解析を差分補正",
  "変数を再処理": "変数を再処理",
  "初期変数を再読み込み": "初期変数を再読み込み",
  "スナップショット階層": "スナップショット階層",
  "階層を再演": "階層を再演",
  "追加モデルの解析を再試行": "追加モデル解析を再試行",
  "古い階層の変数をクリア": "古い階層の変数をクリア",
  "再演階層": "階層を再演",
  "追加モデル解析を再試行": "追加モデル解析を再試行",
  "旧階層の変数をクリア": "古い階層の変数をクリア",
  "重新处理变量": "変数を再処理",
  "重新读取初始变量": "初期変数を再読み込み",
  "快照楼层": "スナップショット階層",
  "重演楼层": "階層を再演",
  "重试额外模型解析": "追加モデル解析を再試行",
  "清除旧楼层变量": "古い階層の変数をクリア",
  "メッセージをスナップショット": "スナップショット階層",
  "メッセージを再処理": "階層を再演",
  "古いメッセージ変数を削除": "古い階層の変数をクリア",
  "変数の再処理": "変数を再処理",
  "初期変数の再読み込み": "初期変数を再読み込み",
  "初期変数を再読込": "初期変数を再読み込み",
  "フロアのスナップショット": "スナップショット階層",
  "フロアの再演": "階層を再演",
  "フロアのリプレイ": "階層を再演",
  "追加モデル解析の再試行": "追加モデル解析を再試行",
  "旧フロア変数のクリア": "古い階層の変数をクリア",
  "旧階層変数を消去": "古い階層の変数をクリア",
  "古いフロア変数をクリア": "古い階層の変数をクリア"
};
const object = (v: any): v is Record<string, any> => v !== null && typeof v === 'object' && !Array.isArray(v);
const own = (v: any,k: string) => object(v) && Object.prototype.hasOwnProperty.call(v,k);
function merge(a: any,b: any): any {
    if (!object(a) || !object(b)) return b;
    return Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].map(k=>[k,own(b,k)?(own(a,k)?merge(a[k],b[k]):b[k]):a[k]]));
}
function normalize(value: any,node: Node): any {
    if (node.values) {
        if (value === 'AI出力に従う' && node.values.随AI输出) return '主AI追従出力';
        return typeof value === 'string' && own(node.values,value) ? node.values[value] : value;
    }
    if (node.items) return Array.isArray(value)?value.map(item=>normalize(item,node.items!)):value;
    if (!object(value)) return value;
    const result = {...value};
    for (const [alias,[canonical,child]] of Object.entries(node.fields||{})) {
        if (!own(value,alias) && !own(value,canonical)) continue;
        const oldValue=child?normalize(value[alias],child):value[alias];
        const newValue=child?normalize(value[canonical],child):value[canonical];
        const selected=own(value,canonical)?(own(value,alias)?merge(oldValue,newValue):newValue):oldValue;
        if (alias!==canonical) delete result[alias];
        result[canonical]=selected;
    }
    return result;
}
export const normalizeMvuSettings = (value: unknown): any => normalize(value,fields);
export function normalizeMvuButtons(buttons: {name:string;visible:boolean;[key:string]:unknown}[]) {
    const result: typeof buttons=[];
    for (const button of buttons) {
        const name=own(buttonAliases,button.name)?buttonAliases[button.name]:button.name,found=result.find(x=>x.name===name);
        if (found) found.visible=found.visible||button.visible;
        else result.push({...button,name});
    }
    return result;
}

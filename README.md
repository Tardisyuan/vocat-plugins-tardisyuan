# VoCat 插件合集

给 [VoCat](https://github.com/MengMengCode/VoCat) 用的几个侧边栏插件，每个功能单独打包，可以在 VoCat 的「设置 → 插件」里分别安装、启用和停用。

> **以下内容都还没有经过完整验证。** 插件只在模拟数据和作者自己的几台设备上试过；运营商查询代码大多来自网上资料，标注为「未经验证」的条目没有人实际用过。用之前请先自己试一次。

## 插件列表

| 安装包 | 侧边栏名称 | 做什么 | 状态 |
|---|---|---|---|
| `vocat-balance.zip` | 余额与保号 | 按设备卡片查看每张 SIM 卡。**余额**：按卡的国家和运营商显示查询预设，USSD 或短信查询，提取余额、流量、通话、短信、到期日，到期日自动回写，查询在 VoCat 页面后台运行。**保号**：离到期或「太久没用被停卡」还剩几天、上次使用时间、卡片档案（号码、套餐、月费、充值方式、备注），一键在 VoCat 自动任务里创建保号短信任务。**余额趋势**：每张卡的金额变化曲线。**费用汇总**：按卡片档案里的月费分币种合计每月和每年花费。**充值记录**：每张卡记每次充值的日期、金额、渠道和成败，费用汇总显示近 12 个月实际充值。**日历提醒**：把到期日和保号截止日导出成 .ics，加进手机日历后到期前会提醒。**数据备份**：导出、导入所有插件数据 | 余额部分实测；其余未经验证 |
| `vocat-diag.zip` | 诊断 | **WiFi Calling**：每台设备的自动重连和失败次数、最近掉线时间、失败原因和时间分布，以及每次重连前 3 分钟内的相关日志（VoCat 记了原因才看得到）。**警告和错误**：按类型合并 VoCat 日志，显示次数和时间范围，用中文解释常见报错（SIP 状态码、CME/CMS 错误、AT 口、IKE、超时等）；读卡器没有 AT 口这类无害警告单独折叠起来 | 未经验证，解读是经验说明 |
| `vocat-signal.zip` | 信号记录 | 页面打开时采样服务小区 RSRP/SINR，画曲线并记录小区切换。开着 WiFi Calling 的设备没有蜂窝信号可记录 | 部分实测，可不装 |

## 安装

安装包发布在本仓库的 [Releases](https://github.com/Tardisyuan/vocat-plugins-tardisyuan/releases) 里，两种装法：

**通过链接安装（推荐）**：在 VoCat「设置 → 插件」里选通过链接安装，填：

| 插件 | 始终安装最新版 |
|---|---|
| 余额与保号 | `https://github.com/Tardisyuan/vocat-plugins-tardisyuan/releases/latest/download/vocat-balance.zip` |
| 诊断 | `https://github.com/Tardisyuan/vocat-plugins-tardisyuan/releases/latest/download/vocat-diag.zip` |
| 信号记录 | `https://github.com/Tardisyuan/vocat-plugins-tardisyuan/releases/latest/download/vocat-signal.zip` |

- 「最新版」链接每次发版后文件都会变，所以 SHA-256 留空。
- 想装固定版本并校验文件，用发布页里那个版本的链接（`.../releases/download/v版本号/文件名`），再把发布页上列的 SHA-256 填进去。

**上传安装**：从 Releases 下载 zip，在「设置 → 插件」里上传。

注意：

1. 升级某个插件时，先卸载旧版本再安装。卸载不会清掉插件数据（数据存在浏览器里）。之前装过 `vocat-keepalive`、`vocat-vowifi`、`vocat-logs` 的话，把它们卸载掉，功能已经并进上面两个插件。
2. 升级余额插件后刷新一次 VoCat 页面，后台查询才会用上新代码。

## 已知限制

- 数据（查询记录、卡片档案、信号样本）存在当前浏览器的 localStorage 里，换浏览器或清理站点数据会丢失，不会在设备之间同步。建议定期用「余额与保号」页面底部的「导出备份」存一份，换浏览器后用「导入备份」恢复。
- 插件只在 VoCat 网页开着时运行。余额查询切到 VoCat 的其他页面不会中断，但刷新或关闭标签页会中断。
- VoCat 开 WiFi Calling 时会关闭蜂窝射频（`CFUN=4`）：这时没有信号可记录，USSD 只能走 IMS（USSI），很多运营商会拒绝。
- USB SIM 读卡器没有 AT 口，不能发 USSD，只能用短信查询。
- 「保号周期」需要你按运营商规则自己填。插件不会替你填数字，只对少数运营商给出**建议值**，用建议值算出的天数会标「约」：giffgaff 官方说法是 6 个月内没有使用会停号（[来源](https://help.giffgaff.com/en/articles/242797-why-is-my-phone-number-deactivated)），建议按约 180 天估算；giffgaff 没有短信或其他方式能查到具体停号日期。
- 「上次使用」取以下几项里最新的一条：这张卡发出的短信、成功执行的自动任务、运营商的扣费提醒短信（目前只识别 giffgaff 的 “that text was charged from your giffgaff credit”）。发给运营商服务号码的短信（6 位及以内的短号码，或「giffgaff」这类名字，比如余额查询）会显示出来，但不计入保号，因为运营商很可能不把它们算作使用。扣费提醒只在产生套餐外计费时才会收到；它能说明运营商记到了一次使用，但运营商具体把哪些操作算作「使用」，未经验证。
- WiFi Calling 稳定性和日志解读依赖 VoCat 日志，VoCat 每次最多返回 2000 行，更早的事件看不到。

## 定期自动查余额

在「余额与保号」页面，短信方式的查询卡片上可以开启「定期查询」：插件在 VoCat 的自动任务里建一个定期发短信的任务，运营商的回复短信会在你下次打开页面时被自动读进历史，到期日也会回写。

- **只对确认免费的查询开放**：运营商官网写明免费（Optus、2degrees、One NZ、Spark/Skinny、EE、Tesco、TIM、Odido），或有真实 SIM 卡实测发送前后余额没变、也没收到扣费提醒（giffgaff `INFO` → 85075）。其他查询一律不提供定期查询。
- **USSD 不能定期查询**：VoCat 自动任务只能发短信和打电话。
- **扣费保护**：如果某次定期查询执行后 15 分钟内收到运营商的扣费提醒（目前只识别 giffgaff），插件会在下次打开页面时自动停用这个任务，并不再为这张卡提供这条定期查询。这一步依赖页面被打开，停用之前任务可能已经多执行了一次。
- 「官方写明免费」来自调研时对运营商页面的摘录，除 Optus 外没有逐条复核；运营商随时可能改规则。

## 余额查询预设

预设按 SIM 卡的归属网络（MCC+MNC）匹配，同一网络上有多个品牌时再按运营商名称区分。

- **已实测可用**：有人用真实 SIM 卡试过，能收到结果。
- **实测不可用**：试过，在备注写的条件下不可用。
- **未经验证**：只有资料来源，没人试过。即使来源是运营商官网，也可能已经过时，或者在 WiFi Calling 下不可用。

下表由 `tools/gen-presets.js` 根据 `research/*.json` 生成，修改预设请改 JSON 文件后运行 `./build.sh`。

<!-- PRESETS:BEGIN -->
| 国家/地区 | 运营商 | 方式 | 状态 | 定期查询 | 来源 | 备注 |
|---|---|---|---|---|---|---|
| 美国 | Ultra Mobile | 短信 `BAL` → 6700 | 已实测可用 | 不提供 | [官方](https://ultramobile.zendesk.com/hc/en-us/articles/115006576308-How-do-I-check-my-account-balance-and-usage) | 用户实测可用：返回通话、短信、流量、到期日和钱包余额。是否收费没有官方说明，可能会占用套餐里的短信条数 |
| 美国 | Ultra Mobile | USSD `*777#` | 未经验证 | 不提供 | [第三方](https://cellularnews.com/mobile-phone/how-to-check-balance-on-ultra-mobile/) | 只有第三方文章提到；读卡器发不了 USSD |
| 美国 | T-Mobile | USSD `#225#` | 未经验证 | 不提供 | [第三方](https://www.t-mobile.com/community/discussions/accounts-services/balance-check-problem-on-phone-225/42318) | 只有第三方文章提到 |
| 英国 | giffgaff | 短信 `INFO` → 85075（回复来自 giffgaff） | 已实测可用 | 可以（用户实测未扣费） | [官方](https://help.giffgaff.com/en/articles/258898-guide-to-texting-43430-inbound-sms) | 用户实测可用：发到 85075，回复来自「giffgaff」，返回剩余余额（如 9.31 GBP）。发送前后余额都是 £9.31，也没收到扣费提醒，所以按「实测未扣费」处理；官方没有写明免费 |
| 英国 | giffgaff | 短信 `PLAN` → 43430（回复来自 giffgaff） | 未经验证 | 不提供 | [官方](https://help.giffgaff.com/en/articles/258898-guide-to-texting-43430-inbound-sms) | 官方关键词，返回当前套餐信息；是否包含续期日未验证。giffgaff 没有查询停号日期的方式 |
| 英国 | giffgaff | USSD `*100#` | 实测不可用（见备注） | 不提供 | [第三方](https://www.uswitch.com/mobiles/guides/giffgaff-international-roaming-faq/) | 用户实测：走 WiFi Calling 时被网络拒绝（SIP 487），只有注册上蜂窝网才可能可用 |
| 美国 | Verizon Prepaid | USSD `#225` | 未经验证 | 不提供 | [官方](https://www.verizon.com/support/pound-star-codes/) | 查询余额（#BAL） |
| 美国 | Verizon Prepaid | USSD `#3282` | 未经验证 | 不提供 | [官方](https://www.verizon.com/support/pound-star-codes/) | 查询流量使用（#DATA） |
| 美国 | Verizon Prepaid | USSD `#646` | 未经验证 | 不提供 | [官方](https://www.verizon.com/support/pound-star-codes/) | 查询剩余分钟数（#MIN） |
| 美国 | AT&T Prepaid | USSD `*777#` | 未经验证 | 不提供 | [官方](https://www.att.com/support/article/bdpreae/KM1048283) | 短信回复余额、流量和套餐信息 |
| 美国 | Mint Mobile | 短信 `DATA` → 6700 | 未经验证 | 不提供 | [官方](https://www.mintmobile.com/faqs/how-do-i-keep-track-of-my-monthly-usage/) | 回复剩余流量；官方页面未能直接打开核实 |
| 美国 | Tello | 短信 `BALANCE` → 800 | 未经验证 | 不提供 | [官方](https://tello.com/help_center/balance/where-can-i-check-my-service-balances) | 回复剩余分钟、短信和流量 |
| 加拿大 | chatr | USSD `*225#` | 未经验证 | 不提供 | [第三方](https://www.whistleout.ca/CellPhones/Faqs/115012867508-Can-I-check-my-Chatr-account-balance-) | 屏幕直接显示余额 |
| 美国 | Metro by T-Mobile | USSD `#225#` | 未经验证 | 不提供 | [第三方](https://www.teloa.com/cms/en/landing/ret/metro-by-t-mobile) | 只有一个弱来源，可信度低 |
| 澳大利亚 | Optus | 短信 `BAL` → 9999 | 已实测可用 | 可以（官方写明免费） | [官方](https://optus.com.au/support/answer/check_your_prepaid_phone_credit_balance_expiry_date_1386) | 免费，返回余额、流量/通话/短信和到期日；用户实测可用 |
| 澳大利亚 | Vodafone AU | 短信 `BAL` → 1511 | 未经验证 | 不提供 | [官方](https://www.vodafone.com.au/support/prepaid/balance) | 官方另一页写 1512，有冲突 |
| 澳大利亚 | Telstra | 短信 `balance` → 125100 | 未经验证 | 不提供 | [官方](https://www.telstra.com.au/support/pre-paid/recharge-my-pre-paid-service) | 官方页转述，关键词大小写未核对 |
| 新西兰 | 2degrees | 短信 `BAL` → 233 | 未经验证 | 可以（官方写明免费） | [官方](https://www.2degrees.nz/help/account-and-billing/manage-account/ussd-shutdown) | 免费；USSD 短码已于 2025-05-12 停用 |
| 新西兰 | One NZ | 短信 `BAL` → 777 | 未经验证 | 可以（官方写明免费） | [官方](https://one.nz/faq/account-balance-check-prepay-balance-via-txt) | 免费；回复含余额和到期日 |
| 新西兰 | Spark / Skinny | 短信 `BAL` → 2424 | 未经验证 | 可以（官方写明免费） | [官方](https://spark.co.nz/help/other-help/text-self-service) | 免费；发 INFO 到 2424 可查套餐和续期日 |
| 中国香港 | SmarTone | USSD `*111#` | 未经验证 | 不提供 | [官方](https://www.smartone.com/other/tchinese/CL48%20User%20Guide_Chi.pdf) | 查储值余额和有效期 |
| 新加坡 | Singtel | USSD `*100#` | 未经验证 | 不提供 | [官方](https://singtel.com/content/dam/singtel/personal/products-services/mobile/prepaid-plans/Terms%20&%20Conditions/FAQ%20and%20where%20to%20buy.pdf) | hi!Card；3G 关闭后在 4G 下是否可用未验证 |
| 泰国 | True | USSD `*123#` | 未经验证 | 不提供 | [官方](https://www.true.th/en/betterliv/support/prepaid-ussd-ivr) | 查余额和有效期 |
| 泰国 | True | USSD `*935#` | 未经验证 | 不提供 | [官方](https://www.true.th/en/betterliv/support/prepaid-ussd-ivr) | 查主套餐剩余流量 |
| 泰国 | dtac | USSD `*101#` | 未经验证 | 不提供 | [官方](https://www.true.th/en/betterliv/support/prepaid-ussd-ivr) | 查余额和有效期 |
| 泰国 | dtac | USSD `*165*1#` | 未经验证 | 不提供 | [官方](https://www.true.th/en/betterliv/support/prepaid-ussd-ivr) | 查主套餐剩余流量 |
| 菲律宾 | Globe | USSD `*143#` | 未经验证 | 不提供 | [官方](https://www.globe.com.ph/help/globeone/payment-subscriptions) | 菜单里有查余额 |
| 菲律宾 | Smart | USSD `*121#` | 未经验证 | 不提供 | [第三方](https://unbox.ph/?p=32578) | 预付费菜单 |
| 印度尼西亚 | Telkomsel | USSD `*888#` | 未经验证 | 不提供 | [官方](https://www.telkomsel.com/jelajah/jelajah-lifestyle/cara-cek-pulsa-telkomsel-lengkap-dan-mudah) | 查余额和有效期；流量菜单 *363# |
| 印度尼西亚 | XL Axiata | USSD `*123#` | 未经验证 | 不提供 | [第三方](https://momsmoney.kontan.co.id/news/simak-ini-caranya-cek-sisa-pulsa-xl) | 菜单里选 Cek Pulsa |
| 印度尼西亚 | Indosat | USSD `*123#` | 未经验证 | 不提供 | [第三方](https://teknologi.bisnis.com/read/20220111/101/1487805/cara-cek-pulsa-telkomsel-indosat-xl-dan-smartfren) | 来源有冲突（另有 *555#） |
| 马来西亚 | Maxis / Hotlink | USSD `*100#` | 未经验证 | 不提供 | [第三方](https://blogmalaysia.com/how-to-check-hotlink-prepaid-balance/) | 主菜单里查余额和到期日 |
| 英国 | EE | 短信 `BALANCE` → 150 | 未经验证 | 可以（官方写明免费） | [官方](https://ee.co.uk/help/mobile/manage-use/pay-as-you-go/get-help-by-texting-150-on-pay-as-you-go) | 免费，返回余额和剩余套餐额度 |
| 英国 | O2 | 短信 `BALANCE` → 20202 | 未经验证 | 不提供 | [第三方](https://community.o2.co.uk/t5/Other-Devices/Balance/m-p/880660) | 只有 O2 社区帖子提到，官方帮助页没列 |
| 英国 | Tesco Mobile | 短信 `BALANCE` → 282 | 未经验证 | 可以（官方写明免费） | [官方](https://www.tescomobile.com/help/usage-and-top-up/pay-as-you-go/check-your-pay-as-you-go-usage) | 免费，返回充值余额和套餐剩余额度 |
| 英国 | Tesco Mobile | 短信 `BALANCE` → 2112 | 未经验证 | 可以（官方写明免费） | [官方](https://www.tescomobile.com/help/usage-and-top-up/pay-as-you-go/check-your-pay-as-you-go-usage) | 免费，只查套餐包剩余额度 |
| 英国 | Vodafone UK | USSD `*#1345#` | 未经验证 | 不提供 | [官方](https://www.vodafone.co.uk/help/billing/how-can-i-check-my-balance) | PAYG 屏幕显示余额，可能需要 4 位 PIN |
| 爱尔兰 | Three Ireland | 短信 `BALANCE` → 50272 | 未经验证 | 不提供 | [官方](https://community.three.ie/t5/Billing/Check-Remaining-Minutes-or-Credit/ta-p/519317) | 返回余额和剩余分钟/短信/流量 |
| 爱尔兰 | eir | 短信 `Balance Data` → 50104 | 未经验证 | 不提供 | [官方](https://eir.ie/mobile/prepay/) | 只查本月已用流量，不返回余额或到期日 |
| 爱尔兰 | Vodafone Ireland | 短信 `BAL` → 50233 | 未经验证 | 不提供 | [第三方](https://selectra.ie/broadband/providers/vodafone/mobile) | 来源表格有些混乱 |
| 德国 | Telekom | USSD `*100#` | 未经验证 | 不提供 | [官方](https://www.telekom.de/hilfe/mobilfunk/prepaid/guthaben-abfragen) | 预付费（CallYa 以外的 Telekom Prepaid）屏幕显示余额 |
| 德国 | Vodafone DE | USSD `*100#` | 未经验证 | 不提供 | [第三方](https://www.heise.de/tipps-tricks/Vodafone-Guthaben-abfragen-4921578.html) | CallYa 屏幕显示余额；部分资费用 *106# |
| 德国 | o2 DE | USSD `*101#` | 未经验证 | 不提供 | [官方](https://hilfe.o2online.de/o2-prepaid-19/wo-kann-ich-mein-guthaben-sehen-175118) | 免费，显示预付费余额；o2 帮助社区 |
| 德国 | o2 DE | USSD `*105#` | 未经验证 | 不提供 | [第三方](https://finanztip.de/handytarife/guthaben/) | 第三方汇总 |
| 法国 | Free Mobile | 短信 `CONSO` → 555 | 未经验证 | 不提供 | [官方](https://assistance.free.fr/articles/suivre-ma-consommation-884) | 官方只说发短信到 555，关键词 CONSO 来自社区；返回本月消费 |
| 法国 | Orange France | USSD `#123#` | 未经验证 | 不提供 | [第三方](https://dundle.com/fr/orange/) | Mobicarte 预付费，短信回复余额 |
| 法国 | La Poste Mobile | 短信 `SOLDE` → 950 | 未经验证 | 不提供 | [第三方](https://selectra.info/telecom/fournisseurs/la-poste-mobile/contact) | 来源有出入（另有 conso 发到 954） |
| 西班牙 | Movistar | USSD `*133#` | 未经验证 | 不提供 | [第三方](https://www.xatakamovil.com/movistar/movistar-prepago-todas-maneras-consultar-saldo-tu-tarjeta) | 据称每次收费 0.15 欧 |
| 西班牙 | Vodafone ES | 短信 `saldo` → 22134 | 未经验证 | 不提供 | [第三方](https://comparaiso.es/gestiones/consultar-saldo/vodafone) | 免费 |
| 西班牙 | Vodafone ES | USSD `*134#` | 未经验证 | 不提供 | [第三方](https://roams.es/companias-telefonicas/vodafone/guias/tramites/consultar-saldo/) | 多个第三方指南一致 |
| 西班牙 | Orange España | USSD `*111#` | 未经验证 | 不提供 | [第三方](https://comparaiso.es/gestiones/consultar-saldo/orange) | 据称每月前 5 次免费，之后 0.25 欧 |
| 西班牙 | Yoigo | USSD `*111#` | 未经验证 | 不提供 | [第三方](https://comparaiso.es/gestiones/consultar-saldo/yoigo) | 多个第三方一致 |
| 意大利 | TIM | 短信 `qual è il mio credito residuo` → 119 | 未经验证 | 可以（官方写明免费） | [官方](https://www.tim.it/assistenza/costi-e-pagamenti/verifica-credito-residuo-minuti-giga-sms) | 免费，回复余额和最近续费日期 |
| 意大利 | WindTre | 短信 `SALDO` → 4155 | 未经验证 | 不提供 | [第三方](https://www.smartworld.it/news/windtre-chiude-123.html) | *123# 已于 2024-10-16 停用；短信方式据称只对部分资费有效 |
| 意大利 | iliad | 短信 `credito` → 400 | 未经验证 | 不提供 | [第三方](https://www.facile.it/telefonia-mobile/compagnie/iliad/verifica-credito-residuo.html) | 免费 |
| 荷兰 | KPN | USSD `*101#` | 未经验证 | 不提供 | [官方](https://community.kpn.com/prepaid-16/prepaid-beltegoed-opvragen-528078) | 查通话余额；*107# 查赠送余额 |
| 荷兰 | KPN | 短信 `SALDO` → 1266 | 未经验证 | 不提供 | [官方](https://community.kpn.com/prepaid-16/prepaid-beltegoed-opvragen-528078) | KPN 社区版主回复 |
| 荷兰 | Odido | 短信 `SALDO` → 1144 | 未经验证 | 可以（官方写明免费） | [官方](https://www.odido.nl/service/veelgestelde-vragen/hoe-kan-ik-mijn-prepaid-tegoed-opvragen/000453605) | 免费；预付费需每 6 个月至少活跃一次 |
| 荷兰 | Vodafone NL | 短信 `status` → 4000 | 未经验证 | 不提供 | [第三方](https://selectra.nl/telecom/telecomaanbieder/vodafone/prepaid) | 第三方 |
<!-- PRESETS:END -->

## 开发

```
src/shared/     所有插件共用：core.js（API、存储、查询任务、回复解析、SIM 识别）、common.js、common.css
src/<插件>/      各插件的页面和 vocat-plugin.json
research/       余额查询预设的资料来源
tools/          生成预设和 README 表格的脚本
tests/          自测：for t in tests/*.test.js; do node "$t"; done
```

`./build.sh` 会重新生成预设，并把每个插件打包到 `dist/`（`dist/` 不提交到仓库）。

发布新版本：推送一个 `v` 开头的标签（例如 `git tag v1.1.0 && git push origin v1.1.0`），GitHub Actions 会运行测试、打包，并创建带三个 zip 和 `SHA256SUMS` 的 Release。

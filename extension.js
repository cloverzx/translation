var hx = require("hbuilderx");
const {
	youdao,
	baidu,
	google
} = require("translation.js"); //引入翻译库
const pinyin = require("chinese-to-pinyin"); //引入拼音库
// const allLang = ['be', 'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'bn', 'bs', 'bg', 'ca', 'ceb', 'zh-CN', 'zh', 'zh-TW',
// 	'tw', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha',
// 	'haw', 'he', 'iw', 'hi', 'hum', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jv', 'kn', 'kk', 'km', 'rw', 'ko', 'ku',
// 	'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ny', 'or',
// 	'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su',
// 	'sw', 'sv', 'tl', 'tg', 'ta', 'tt', 'te', 'th', 'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo',
// 	'zu'
// ] //语言列表

const langPick = [{
	label: '简体/繁体/拼音',
	description: '',
	lang: 'zh'
}, {
	label: '英语',
	description: '',
	lang: 'en'
}, {
	label: '日语',
	description: '',
	lang: 'ja'
}, {
	label: '法语',
	description: '',
	lang: 'fr'
}, {
	label: '韩语',
	description: '',
	lang: 'ko'
}, {
	label: '德语',
	description: '',
	lang: 'de'
}, {
	label: '意大利语',
	description: '',
	lang: 'it'
}, {
	label: '希腊语',
	description: '',
	lang: 'el'
}, {
	label: '荷兰语',
	description: '',
	lang: 'nl'
}, {
	label: '芬兰语',
	description: '',
	lang: 'fi'
}, {
	label: '捷克语',
	description: '',
	lang: 'cs'
}, {
	label: '马来语',
	description: '',
	lang: 'ms'
}]

function activate(context) {
	let replace = hx.commands.registerCommand('extension.translatereplace', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration();
			let source = config.get("source", false);
			let fy = google;
			let listArray = []
			if (source === "baidu") {
				fy = baidu;
			} else if (source === "google") {
				fy = google;
			} else if (source === "youdao") {
				fy = youdao;
			} else {
				config.update("source", "google")
				fy = google
			}
			if (word.length > 0) {
				const selectLang = hx.window.showQuickPick(langPick, {
					placeHolder: '选择语种'
				});
				list = new Promise((resolve, reject) => {
					selectLang.then(result => {
						if (!result) {
							return
						}
						buildList(result, fy, word).then(list => {
							const finalWord = hx.window.showQuickPick(list, {
								placeHolder: '请选择'
							});
							finalWord.then(res=>{
								console.log(res)
								editor.edit(editBuilder => {
									editBuilder.replace(selection, res.label)
								})
							})
						})
					})
				})
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	});
	let setbaidu = hx.commands.registerCommand('extension.setbaidu', () => {
		sets("source", "baidu", "切换到百度翻译源成功!")
	});
	let setyoudao = hx.commands.registerCommand('extension.setyoudao', () => {
		sets("source", "youdao", "切换到有道翻译源成功!")
	});
	let setgoogle = hx.commands.registerCommand('extension.setgoogle', () => {
		sets("source", "google", "切换到谷歌翻译源成功!")
	});
}
//生成列表
function buildList(l, fy, str) {
	return new Promise((resolve, reject) => {
		if (l.lang === 'zh') {
			resolve(zhword(fy, str))
		} else if (l.lang === 'en') {
			words(fy, str).then(res=>{
				resolve(res)
			})
		} else {
			fystr(fy, str, l.lang).then(res => {
				resolve([{
					label: res,
					description: l.label
				}])
			})
		}
	})
}

//翻译
function fystr(fy, str, lang) {
	return new Promise((resolve, reject) => {
		fy.translate({
			'text': str,
			'to': lang
		}).then(result => {
			resolve(result.result[0])
		})
	})
}
//处理中文
async function zhword(fy, str) {
	let z1 = await fystr(fy, str, 'zh')
	let z2 = await fystr(fy, str, 'zh-tw')
	let z3 = await new Promise((resolve, reject) => {
		resolve([{
			label: pinyin(z1, {
				"removeTone": true,
				"removeSpace": true
			}),
			description: '拼音'
		}, {
			label: pinyin(z1, {
				"removeTone": true,
				"removeSpace": true,
				"firstCharacter": true
			}),
			description: '拼音首字母'
		}])
	})
	return [{
			label: z1,
			description: '简体'
		},
		{
			label: z2,
			description: '繁体'
		}, ...z3
	]
}


//处理英语的几个模式
function words(fy, str) {
	return new Promise((resolve, reject) => {
		fy.translate({
			'text': str,
			'to': 'en'
		}).then(result => {
			strs = result.result[0].split(" ")
			if (strs.length > 1) {
				let [k1, k2, k3, k4, k5, k6, k7] = ['', '', '', '', '', '', '']
				let b = ['大驼峰', '全小写', '全大写', '小驼峰', '空格连接', '-连接', '_连接']
				strs.map((data, i) => {
					let kkk = strs[i].toLowerCase()
					k2 += kkk
					k1 += kkk.replace(kkk[0], kkk[0].toUpperCase())
					k5 = (i + 1 < strs.length) ? k5 + kkk + " " : k5 + kkk
					k6 = (i + 1 < strs.length) ? k6 + kkk + " " : k6 + kkk
					k7 = (i + 1 < strs.length) ? k7 + kkk + " " : k7 + kkk
				})
				k3 = k2.toUpperCase()
				k4 = k1.replace(k1[0], k1[0].toLowerCase())
				k6 = k6.replace(/ /g, '-')
				k7 = k7.replace(/ /g, '_')
				resolve([k1, k2, k3, k4, k5, k6, k7].map((data, i) => ({
					label: data,
					description: b[i]
				})))
			} else {
				let [k1, k2, k3] = ['', '', '']
				let b = ['小驼峰', '全大写', '大驼峰']
				k1 = str.toLowerCase()
				k2 = str.toUpperCase()
				k3 = k1.replace(k1[0], k1[0].toUpperCase())
				resolve([k1, k2, k3].map((data, i) => ({
					label: data,
					description: b[i]
				})))
			}
		})
	})
}

/**
 * 设置配置,给予反馈
 * @description 设置配置,给予反馈
 * @param {Number} type 
 * @param {String} data
 * @param {String} desc 文字信息 
 */
function sets(type, data, desc) {
	hx.workspace.getConfiguration().update(type, data)
		.then(() => {
			hx.window.showWarningMessage(desc)
		})
		.catch(() => {
			hx.window.showWarningMessage("设置失败!")
		});
}

// function deactivate() {

// }
module.exports = {
	activate
}

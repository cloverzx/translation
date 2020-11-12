var hx = require("hbuilderx");
const {
	youdao,
	baidu,
	google
} = require("translation.js"); //引入翻译库
const pinyin = require("chinese-to-pinyin"); //引入拼音库
const allLang = ['be', 'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'bn', 'bs', 'bg', 'ca', 'ceb', 'zh-CN', 'zh', 'zh-TW',
	'tw', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha',
	'haw', 'he', 'iw', 'hi', 'hum', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jv', 'kn', 'kk', 'km', 'rw', 'ko', 'ku',
	'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ny', 'or',
	'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su',
	'sw', 'sv', 'tl', 'tg', 'ta', 'tt', 'te', 'th', 'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo',
	'zu'
] //语言列表
const otherModeZh = ['py', 'szm']
const otherModeEn = ['dt', 'xt', 'xx', 'dx', 'en1', 'en2', 'en3']

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
			let config = hx.workspace.getConfiguration('translation');
			let source = config.get("source", 'google');
			if (source === 'google') fy = google
			if (source === 'baidu') fy = baidu
			if (source === 'youdao') fy = youdao
			let listArray = []
			if (word.length > 0) {
				const selectLang = hx.window.showQuickPick(langPick, {
					placeHolder: '选择语种'
				});
				selectLang.then(result => {
					if (!result) return
					buildList(result, fy, word).then(list => {
						const finalWord = hx.window.showQuickPick(list, {
							placeHolder: '请选择'
						});
						finalWord.then(res => {
							editor.edit(editBuilder => {
								editBuilder.replace(selection, res.label)
							})
						})
					})
				})
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	});

	let quickerreplace = hx.commands.registerCommand('extension.translatequickerreplace', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration('translation');
			let source = config.get("source", 'google');
			if (source === 'google') fy = google
			if (source === 'baidu') fy = baidu
			if (source === 'youdao') fy = youdao
			let defaultlang = config.get("defaultlang", 'en');
			let replaceword = (w) => {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, w)
				})
			}
			if (word.length > 0) {
				let a = word.split('-')
				let alength = a.length
				if (alength > 1) {
					if (allLang.includes(a[alength - 1])) {
						let bl = a[alength - 1] !== 'tw' ? a[alength - 1] : "zh-TW"
						fystr(fy, a.slice(0, -1).join('-'), a[alength - 1]).then(res => {
							replaceword(res)
						})
					} else if (otherModeZh.includes(a[alength - 1])) {
						zhword(fy, a.slice(0, -1).join('-')).then(res1 => {
							if (a[alength - 1] === 'py') replaceword(res1[2]['label'])
							if (a[alength - 1] === 'szm') replaceword(res1[3]['label'])
						})
					} else if (otherModeEn.includes(a[alength - 1])) {
						words(fy, a.slice(0, -1).join('-')).then(res1 => {
							if (a[alength - 1] === 'dt') {
								res1.length > 3 ? replaceword(res1[0]['label']) : replaceword(res1[2]['label'])
							} else if (a[alength - 1] === 'xt') {
								res1.length > 3 ? replaceword(res1[3]['label']) : replaceword(res1[0]['label'])
							} else if (a[alength - 1] === 'xx') {
								res1.length > 3 ? replaceword(res1[1]['label']) : replaceword(res1[0]['label'])
							} else if (a[alength - 1] === 'dx') {
								res1.length > 3 ? replaceword(res1[2]['label']) : replaceword(res1[1]['label'])
							} else if (a[alength - 1] === 'en1') {
								res1.length > 3 ? replaceword(res1[4]['label']) : replaceword(res1[0]['label'])
							} else if (a[alength - 1] === 'en2') {
								res1.length > 3 ? replaceword(res1[5]['label']) : replaceword(res1[0]['label'])
							} else if (a[alength - 1] === 'en3') {
								res1.length > 3 ? replaceword(res1[6]['label']) : replaceword(res1[0]['label'])
							}
						})
					}
				} else {
					fystr(fy, word, defaultlang).then(res => {
						replaceword(res)
					})
				}
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	})

	//中英
	let translatezhen = hx.commands.registerCommand('extension.translatezhen', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration('translation');
			let source = config.get("source", 'google');
			if (source === 'google') fy = google
			if (source === 'baidu') fy = baidu
			if (source === 'youdao') fy = youdao
			let replaceword = (w) => {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, w)
				})
			}
			if (word.length > 0) {
				checklang(word).then(res => {
					if (['zh', 'zh-CN', 'en'].includes(res)) {
						if (res === 'en') {
							fystr(fy, word, 'zh').then(res1 => {
								replaceword(res1)
							})
						}
						if (['zh', 'zh-CN'].includes(res)) {
							fystr(fy, word, 'en').then(res1 => {
								replaceword(res1)
							})
						}
					} else {
						hx.window.showErrorMessage('当前选中词不是中文或英文!');
					}
				})
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	})
	//中日
	let translatezhja = hx.commands.registerCommand('extension.translatezhja', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration('translation');
			let source = config.get("source", 'google');
			if (source === 'google') fy = google
			if (source === 'baidu') fy = baidu
			if (source === 'youdao') fy = youdao
			let replaceword = (w) => {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, w)
				})
			}
			if (word.length > 0) {
				checklang(word).then(res => {
					if (['zh', 'zh-CN', 'ja'].includes(res)) {
						if (res === 'ja') {
							fystr(fy, word, 'zh').then(res1 => {
								replaceword(res1)
							})
						}
						if (['zh', 'zh-CN'].includes(res)) {
							fystr(fy, word, 'ja').then(res1 => {
								replaceword(res1)
							})
						}
					} else {
						hx.window.showErrorMessage('当前选中词不是中文或日文!');
					}

				})
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	})

	//中韩
	let translatezhko = hx.commands.registerCommand('extension.translatezhko', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration('translation');
			let source = config.get("source", 'google');
			if (source === 'google') fy = google
			if (source === 'baidu') fy = baidu
			if (source === 'youdao') fy = youdao
			let replaceword = (w) => {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, w)
				})
			}
			if (word.length > 0) {
				checklang(word).then(res => {
					if (['zh', 'zh-CN', 'ko'].includes(res)) {
						if (res === 'ko') {
							fystr(fy, word, 'zh').then(res1 => {
								replaceword(res1)
							})
						}
						if (['zh', 'zh-CN'].includes(res)) {
							fystr(fy, word, 'ko').then(res1 => {
								replaceword(res1)
							})
						}
					} else {
						hx.window.showErrorMessage('当前选中词不是中文或韩文!');
					}

				})
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	})
	//中法
	let translatezhfr = hx.commands.registerCommand('extension.translatezhfr', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration('translation');
			let source = config.get("source", 'google');
			if (source === 'google') fy = google
			if (source === 'baidu') fy = baidu
			if (source === 'youdao') fy = youdao
			let replaceword = (w) => {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, w)
				})
			}
			if (word.length > 0) {
				checklang(word).then(res => {
					if (['zh', 'zh-CN', 'fr'].includes(res)) {
						if (res === 'fr') {
							fystr(fy, word, 'zh').then(res1 => {
								replaceword(res1)
							})
						}
						if (['zh', 'zh-CN'].includes(res)) {
							fystr(fy, word, 'fr').then(res1 => {
								replaceword(res1)
							})
						}
					} else {
						hx.window.showErrorMessage('当前选中词不是中文或法文!');
					}

				})
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	})
	//中德
	let translatezhde = hx.commands.registerCommand('extension.translatezhde', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration('translation');
			let source = config.get("source", 'google');
			if (source === 'google') fy = google
			if (source === 'baidu') fy = baidu
			if (source === 'youdao') fy = youdao
			let replaceword = (w) => {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, w)
				})
			}
			if (word.length > 0) {
				checklang(word).then(res => {
					if (['zh', 'zh-CN', 'de'].includes(res)) {
						if (res === 'en') {
							fystr(fy, word, 'zh').then(res1 => {
								replaceword(res1)
							})
						}
						if (['zh', 'zh-CN'].includes(res)) {
							fystr(fy, word, 'de').then(res1 => {
								replaceword(res1)
							})
						}
					} else {
						hx.window.showErrorMessage('当前选中词不是中文或德文!');
					}

				})
			} else {
				hx.window.showErrorMessage('未选取内容!');
			}
		})
	})
}
//生成列表
function buildList(l, fy, str) {
	return new Promise((resolve, reject) => {
		if (l.lang === 'zh') {
			resolve(zhword(fy, str))
		} else if (l.lang === 'en') {
			words(fy, str).then(res => {
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
		}).catch(error => {
			error(error.code)
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
			console.log(str)
			console.log(result)
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
			} else if (strs.length === 1) {
				let [k1, k2, k3] = ['', '', '']
				let b = ['小驼峰', '全大写', '大驼峰']
				k1 = strs[0].toLowerCase()
				k2 = strs[0].toUpperCase()
				k3 = k1.replace(k1[0], k1[0].toUpperCase())
				resolve([k1, k2, k3].map((data, i) => ({
					label: data,
					description: b[i]
				})))
			} else {
				resolve({
					label: '暂无翻译,您可尝试更换翻译源',
					description: '失败'
				})
			}
		}).catch(error => {
			error(error.code)
		})
	})
}

function checklang(text) {
	return new Promise((resolve, reject) => {
		google.detect(text).then(result => {
			resolve(result)
		}).catch(error => {
			error(error.code)
		})
	})
}

function error(errorCode) {
	let mes = "发生错误！"
	if (errorCode === 'NETWORK_ERROR') {
		mes = '网络错误，可能是运行环境没有网络连接造成的'
	}
	if (errorCode === 'API_SERVER_ERROR') {
		mes = '翻译接口返回了错误的数据'
	}
	if (errorCode === 'UNSUPPORTED_LANG') {
		mes = '接口不支持的语种'
	}
	if (errorCode === 'NETWORK_TIMEOUT') {
		mes = '查询接口时超时了'
	}
	hx.window.showErrorMessage(mes);
}





// "onCommand:extension.translatezhen",
// 		"onCommand:extension.translatezhja",
// 		"onCommand:extension.translatezhko",
// 		"onCommand:extension.translatezhfr",
// 		"onCommand:extension.translatezhde"

// function deactivate() {

// }

module.exports = {
	activate
}

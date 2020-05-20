var hx = require("hbuilderx");
const {
	youdao,
	baidu,
	google
} = require("translation.js");//引入翻译库
const pinyin = require("chinese-to-pinyin");//引入拼音库

function activate(context) {
	let replace = hx.commands.registerCommand('extension.replace', () => {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			let selection = editor.selection;
			let word = editor.document.getText(selection);
			let config = hx.workspace.getConfiguration();
			let mode = config.get("mode", false);
			if (!mode) {
				config.update("mode", "5")
					.then(() => {
						mode = "5"
					})
			}
			if (word.length > 0) {
				//1 - 大驼峰、2 - 小驼峰、3 - 全小写、4 - 全大写、5 - 原始、98 - 拼音首字母、99 - 拼音全拼
				if (["1", "2", "3", "4", "5","6","7"].includes(mode)) {
					//翻译源的配置和处理
					let source = config.get("source", false);
					let fy = baidu;
					if (!source) {
						source = "baidu"
						config.update("source", "baidu")
					}
					if (source === "baidu") {
						fy = baidu;
					} else if (source === "google") {
						fy = google;
					} else if (source === "youdao") {
						fy = youdao;
					}
					fy.translate(word)
						.then(result => {
							let newWord = result.result[0]
							if(newWord.length > 0){
								//不同翻译模式,进行不同的处理
								if(mode === "1"){
									let k = words(newWord,1)
									newWord = k.replace(k[0],k[0].toUpperCase());
								}else if(mode === "2"){
									let k = words(newWord,1)
									newWord = k.replace(k[0],k[0].toLowerCase());
								}else if(mode === "3"){
									newWord = words(newWord,2).toLowerCase()
								}else if(mode === "4"){
									newWord = words(newWord,2).toUpperCase()
								}
								else if(mode === "5"){
									newWord = newWord.replace(newWord[0],newWord[0].toLowerCase());
								}
								else if(mode === "6"){
									newWord = newWord.replace(newWord[0],newWord[0].toLowerCase());
									newWord = newWord.replace(" ","-");
								}
								else if(mode === "7"){
									newWord = newWord.replace(newWord[0],newWord[0].toLowerCase());
									newWord = newWord.replace(" ","_");
								}
								//执行替换选中词
								editor.edit(editBuilder => {
									editBuilder.replace(selection, newWord)
								});
							}
						})
				} else if (["99", "98"].includes(mode)) {
					//不同的拼音模式处理
					let condition = {
						"removeTone": true,
						"removeSpace": true
					}
					if (mode === "98") {
						condition["firstCharacter"] = true
					}
					//执行替换选中词
					editor.edit(editBuilder => {
						editBuilder.replace(selection, pinyin(word, condition))
					});

				}
			}
		})
	});
	let mode98 = hx.commands.registerCommand('extension.mode98', () => {
		sets("mode", "98","切换到拼音首字母模式成功!")
	});
	let mode99 = hx.commands.registerCommand('extension.mode99', () => {
		sets("mode", "99","切换到拼音全拼模式成功!")
	});
	let mode1 = hx.commands.registerCommand('extension.mode1', () => {
		sets("mode", "1","切换到大驼峰模式成功!")
	});
	let mode2 = hx.commands.registerCommand('extension.mode2', () => {
		sets("mode", "2","切换到小驼峰模式成功!")
	});
	let mode3 = hx.commands.registerCommand('extension.mode3', () => {
		sets("mode", "3","切换到全小写模式成功!")
	});
	let mode4 = hx.commands.registerCommand('extension.mode4', () => {
		sets("mode", "4","切换到全大写模式成功!")
	});
	let mode5 = hx.commands.registerCommand('extension.mode5', () => {
		sets("mode", "5","切换到空格分隔模式成功!")
	});
	let mode6 = hx.commands.registerCommand('extension.mode6', () => {
		sets("mode", "6","切换到横线分隔模式成功!")
	});
	let mode7 = hx.commands.registerCommand('extension.mode7', () => {
		sets("mode", "7","切换到下划线分隔模式成功!")
	});
	let setbaidu = hx.commands.registerCommand('extension.setbaidu', () => {
		sets("source", "baidu","切换到百度翻译源成功!")
	});
	let setyoudao = hx.commands.registerCommand('extension.setyoudao', () => {
		sets("source", "youdao","切换到有道翻译源成功!")
	});
	let setgoogle = hx.commands.registerCommand('extension.setgoogle', () => {
		sets("source", "google","切换到谷歌翻译源成功!")
	});
	// context.subscriptions.push(replace);
}
/**
 * 去除单词空格,根据参数处理每个单词首字母
 * @description 去除单词空格,根据参数处理每个单词首字母
 * @param {String} str 原始字符串
 * @param {Number} type 模式1:首字母均大写2:不做处理
 */
function words(str,type){
	strs=str.split(" ")
	let k = ""
	for (i=0;i<strs.length ;i++ )
	{
		if(type === 1){
			k += strs[i].replace(strs[i][0],strs[i][0].toUpperCase())
		}else if(type === 2){
			k += strs[i]
		}
	}
	return k
}

/**
 * 设置配置,给予反馈
 * @description 设置配置,给予反馈
 * @param {Number} type 
 * @param {String} data
 * @param {String} desc 文字信息 
 */
function sets(type,data,desc){
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

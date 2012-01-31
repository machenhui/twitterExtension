/**
 * Created by IntelliJ IDEA.
 * User: hangyin
 * Date: 11-11-22
 * Time: 下午5:35
 * To change this template use File | Settings | File Templates.
 */
kola("mvc.view.template.engine.Elapse", [], function() {
	var REG_EXP = {
		R_N : /\n/g,
		R_R : /\r/g,
		R_T : /\t/g,
		R_F : /\f/g,
		R_QUOTE : /\"/g,
		R_SLASH : /\\/g,
		R_TRIM : /(^\s*)|(\s*$)/g
	};

	function trim(str) {
		return str.replace(REG_EXP.R_TRIM, "");
	};

	var RUNTIME = "#TERUNTIME";
	var TEMPLATES = {};

	window[RUNTIME] = {
		outputVal : function(value, filter_data) {
			if(filter_data != false)
				return window[RUNTIME].outputUnicode(value);
			else {
				return value;
			}
		},
		outputUnicode : function(str) {
			str += "";
			var newStr = "";
			for(var i = 0, l = str.length; i < l; ++i) {
				newStr += "&#" + str.charCodeAt(i);
			}
			return newStr;
		},
		register : function(uri, template) {
			TEMPLATES[uri] = template;
		},
		include : function(uri, data) {
			if(TEMPLATES[uri] == undefined)
				throw "include exception: package \"" + uri + "\" not found.";
			return TEMPLATES[uri].render({
				data : data
			});
		}
	};

	//状态码
	var STATE = {
		STATIC_CONTENT : 0,
		JAVASCRIPT : 1,
		OUTPUT_VAL : 2,
		END_MARKER : 3,
		KEYWORD : 4,
		IF_CON : 5,
		ELSEIF_CON : 6,
		FORARR_CON : 7,
		SWITCH_CON : 8,
		CASE_CON : 9,
		FOREACH_CON : 10,
		FOR_CON : 11,
		EVAL_CON : 12,
		SET_CON : 13,
		IDEL : 14,
		PACKAGE_CON : 15,
		INCLUDE_CON : 16,
		LOOP_CON : 17,
		WHILE_CON : 18
	};

	//关键字映射
	var KEYWORD = {
		IF : "if",
		FOREACH : "foreach",
		FORARR : "forarr",
		FOR : "for",
		SWITCH : "switch",
		ELSE : "else",
		ELSE_IF : "elseif",
		CASE : "case",
		BREAK : "break",
		CONTINUE : "continue",
		EVAL : "eval",
		SET : "set",
		PACKAGE : "package",
		INCLUDE : "include",
		LOOP : "loop",
		WHILE : "while",
		DEFAULT : "default"
	};

	//关键字实际值
	var KEYWORD_STR = [];
	for(var keyWordName in KEYWORD) {
		KEYWORD_STR.push(KEYWORD[keyWordName]);
	}

	//字面常量列表
	var WORD_CONSTANT = ["true", "false", "undefined", "null", "NaN", "new", "delete"];

	var SINGLE_KEYWORD = [KEYWORD.BREAK, KEYWORD.CONTINUE, KEYWORD.CASE, KEYWORD.ELSE, KEYWORD.ELSE_IF, KEYWORD.EVAL, KEYWORD.SET, KEYWORD.PACKAGE, KEYWORD.INCLUDE, KEYWORD.DEFAULT];

	//临时变量映射
	var TEMP_VAR_MAP = {
        length: "l",
        index: "i",
        value: "tv",
        key: "k",
        over: "o",
        step: "st"
	};

	//临时变量访问名称
	var TEMP_SHORTVARNAME = [];
	for(var name in TEMP_VAR_MAP) {
		TEMP_SHORTVARNAME.push(TEMP_VAR_MAP[name]);
	}

	var PARSEVAL_STATE = {
		FOUND_VAL : 0,
		FINDING : 1,
		FOUND_STR_START_QUOTE : 2,
		FOUND_STR_START_SINGLEQUOTE : 3,
		FOUND_LEFT_SQUARE : 4,
		FOUND_RIGHT_SQUARE : 5
	};

	var PARSE_ITERVALNAME = {
		FOUND_AS : 1,
		FOUND_STR_START_QUOTE : 2,
		FOUND_STR_START_SINGLEQUOTE : 3,
		FOUND_LEFT_SQUARE : 4,
		FOUND_RIGHT_SQUARE : 5,
		FINDING : 6,
		FOUND_VAL : 7
	};

	var FIND_LOOP_SETTINGS = {
		FOUND_STR_START_QUOTE : 2,
		FOUND_STR_START_SINGLEQUOTE : 3,
		FOUND_LEFT_SQUARE : 4,
		FOUND_RIGHT_SQUARE : 5,
		FINDING : 6,
		FOUND_VAL : 7
	};

	function inArray(value, arr) {
		for(var i = 0, l = arr.length; i < l; ++i) {
			if(arr[i] == value)
				return true;
		}
		return false;
	};

	var Translater = {
		parseStaticContent : function(staticContent) {
			return "cb+=\"" + staticContent.replace(REG_EXP.R_SLASH, "\\\\").replace(REG_EXP.R_QUOTE, "\\\"") + "\";";
		},
		parseLoopSetting : function(source) {
			var state = FIND_LOOP_SETTINGS.FINDING;
			//目标迭代集合是否找到？
			var settings = [];
			var valBuffer = "";
			source = trim(source);
			for(var i = 0, l = source.length; i < l; ++i) {
				var curChar = source.charAt(i);
				switch(state) {
					case FIND_LOOP_SETTINGS.FINDING:
						if(curChar == ",") {
							settings.push(valBuffer);
							valBuffer = "";
							continue;
						}
						if(i == source.length - 1) {
							settings.push(valBuffer + curChar);
							valBuffer = "";
							continue;
						}
						valBuffer += curChar;
						if(curChar == "\"") {
							state = FIND_LOOP_SETTINGS.FOUND_STR_START_QUOTE;
							continue;
						}
						if(curChar == "\'") {
							state = FIND_LOOP_SETTINGS.FOUND_STR_START_SINGLEQUOTE;
							continue;
						}
						var charCode = curChar.charCodeAt(0);
						if(curChar == "@" || curChar == "#" || charCode == 36 || charCode == 95 || (charCode >= 97 && charCode <= 122 ) || (charCode >= 65 && charCode <= 90 )) {
							state = FIND_LOOP_SETTINGS.FOUND_VAL;
							continue;
						}
						break;
					case FIND_LOOP_SETTINGS.FOUND_STR_START_QUOTE:
						valBuffer += curChar;
						if(curChar == "\"") {
							state = FIND_LOOP_SETTINGS.FINDING;
							continue;
						}
						break;
					case FIND_LOOP_SETTINGS.FOUND_STR_START_SINGLEQUOTE:
						valBuffer += curChar;
						if(curChar == "\'") {
							state = FIND_LOOP_SETTINGS.FINDING;
							continue;
						}
						break;
					case FIND_LOOP_SETTINGS.FOUND_LEFT_SQUARE:
						valBuffer += curChar;
						if(curChar == "]") {
							state = FIND_LOOP_SETTINGS.FOUND_VAL;
							continue;
						}
						break;
					case FIND_LOOP_SETTINGS.FOUND_VAL:
						var charCode = curChar.charCodeAt(0);
						if(curChar == "[") {
							valBuffer += curChar;
							state = FIND_LOOP_SETTINGS.FOUND_LEFT_SQUARE;
							continue;
						}
						if(curChar == "#" || parseInt(curChar) == curChar || curChar == "." || curChar == "[" || curChar == "]" || charCode == 36 || charCode == 95 || (charCode >= 97 && charCode <= 122 ) || (charCode >= 65 && charCode <= 90 )) {
							valBuffer += curChar;
							continue;
						} else {
							if(curChar == ",")
								--i;
							state = FIND_LOOP_SETTINGS.FINDING;
							continue;
						}
						break;
				}
			}
			return settings;
		},
		parseIterValName : function(source, keyword) {
			var state = PARSE_ITERVALNAME.FINDING;
			//目标迭代集合是否找到？
			var parsedSource = "";
			var tmpVars = [];
			var tmpVarBuffer = "";
			for(var i = 0, l = source.length; i < l; ++i) {
				var curChar = source.charAt(i);
				switch(state) {
					case PARSE_ITERVALNAME.FINDING:
						if(curChar == "a" && source.charAt(i + 1) == "s" && source.charAt(i + 2) == " ") {
							i += 2;
							state = PARSE_ITERVALNAME.FOUND_AS;
							continue;
						}
						parsedSource += curChar;
						if(curChar == "\"") {
							state = PARSE_ITERVALNAME.FOUND_STR_START_QUOTE;
							continue;
						}
						if(curChar == "\'") {
							state = PARSE_ITERVALNAME.FOUND_STR_START_SINGLEQUOTE;
							continue;
						}
						var charCode = curChar.charCodeAt(0);
						if(curChar == "@" || curChar == "#" || charCode == 36 || charCode == 95 || (charCode >= 97 && charCode <= 122 ) || (charCode >= 65 && charCode <= 90 )) {
							state = PARSE_ITERVALNAME.FOUND_VAL;
							continue;
						}
						break;
					case PARSE_ITERVALNAME.FOUND_AS:
						if(curChar == " " || i == (source.length - 1)) {
							if(tmpVarBuffer.length <= 0)
								continue;
							else {
								tmpVarBuffer += curChar;
								state = PARSE_ITERVALNAME.FINDING;
								tmpVars.push(tmpVarBuffer);
								tmpVarBuffer = "";
								continue;
							}
						} else {
							tmpVarBuffer += curChar;
							continue;
						}
						break;
					case PARSE_ITERVALNAME.FOUND_STR_START_QUOTE:
						parsedSource += curChar;
						if(curChar == "\"") {
							state = PARSE_ITERVALNAME.FINDING;
							continue;
						}
						break;
					case PARSE_ITERVALNAME.FOUND_STR_START_SINGLEQUOTE:
						parsedSource += curChar;
						if(curChar == "\'") {
							state = PARSE_ITERVALNAME.FINDING;
							continue;
						}
						break;
					case PARSE_ITERVALNAME.FOUND_LEFT_SQUARE:
						parsedSource += curChar;
						if(curChar == "]") {
							state = PARSE_ITERVALNAME.FOUND_VAL;
							continue;
						}
						break;
					case PARSE_ITERVALNAME.FOUND_VAL:
						var charCode = curChar.charCodeAt(0);
						if(curChar == "[") {
							parsedSource += curChar;
							state = PARSE_ITERVALNAME.FOUND_LEFT_SQUARE;
							continue;
						}
						if(curChar == "#" || parseInt(curChar) == curChar || curChar == "." || curChar == "[" || curChar == "]" || charCode == 36 || charCode == 95 || (charCode >= 97 && charCode <= 122 ) || (charCode >= 65 && charCode <= 90 )) {
							parsedSource += curChar;
							continue;
						} else {
							parsedSource += curChar;
							state = PARSE_ITERVALNAME.FINDING;
							continue;
						}
						break;
				}
			}
			return [parsedSource, tmpVars[0]];
		},
		/**
		 * 处理变量
		 */
		parseVal : function(source) {
			source += " ";
			var state = PARSEVAL_STATE.FINDING;
			var parsedSource = "";
			var varBuffer = "";
			for(var i = 0, l = source.length; i < l; ++i) {
				var curChar = source.charAt(i);
				switch(state) {
					case PARSEVAL_STATE.FINDING:
						if(curChar == "\"") {
							state = PARSEVAL_STATE.FOUND_STR_START_QUOTE;
							parsedSource += curChar;
							continue;
						}
						if(curChar == "\'") {
							state = PARSEVAL_STATE.FOUND_STR_START_SINGLEQUOTE;
							parsedSource += curChar;
							continue;
						}
						var charCode = curChar.charCodeAt(0);
						if(curChar == "@" || curChar == "#" || charCode == 36 || charCode == 95 || (charCode >= 97 && charCode <= 122 ) || (charCode >= 65 && charCode <= 90 )) {
							varBuffer = curChar;
							state = PARSEVAL_STATE.FOUND_VAL;
							continue;
						}
						parsedSource += curChar;
						break;
					case PARSEVAL_STATE.FOUND_STR_START_QUOTE:
						parsedSource += curChar;
						if(curChar == "\"") {
							state = PARSEVAL_STATE.FINDING;
							continue;
						}
						break;
					case PARSEVAL_STATE.FOUND_STR_START_SINGLEQUOTE:
						parsedSource += curChar;
						if(curChar == "\'") {
							state = PARSEVAL_STATE.FINDING;
							continue;
						}
						break;
					case PARSEVAL_STATE.FOUND_LEFT_SQUARE:
						varBuffer += curChar;
						if(curChar == "]") {
							//处理方括号内的内容
							var leftSquareIndex = varBuffer.indexOf("[");
							var rightSquareIndex = varBuffer.lastIndexOf("]");
							if(leftSquareIndex != -1 && rightSquareIndex != -1) {
								//处理值表达式
								var content = Translater.parseVal(trim(varBuffer.substring(leftSquareIndex + 1, rightSquareIndex)));
								varBuffer = varBuffer.substring(0, leftSquareIndex + 1) + content + varBuffer.substr(rightSquareIndex);
								state = PARSEVAL_STATE.FOUND_VAL;
								continue;
							}
						}
						break;
					case PARSEVAL_STATE.FOUND_VAL:
						var charCode = curChar.charCodeAt(0);
						if(curChar == "[") {
							state = PARSEVAL_STATE.FOUND_LEFT_SQUARE;
							varBuffer += curChar;
							continue;
						}
						if(curChar == "#" || parseInt(curChar) == curChar || curChar == "." || curChar == "[" || curChar == "]" || charCode == 36 || charCode == 95 || (charCode >= 97 && charCode <= 122 ) || (charCode >= 65 && charCode <= 90 )) {
							varBuffer += curChar;
						} else {
							state = PARSEVAL_STATE.FINDING;
							if(inArray(varBuffer, WORD_CONSTANT) == false) {
								//三种变量:
								//#:注入数据,@:全局变量,局部临时变量
								switch(varBuffer.charAt(0)) {
									//注入数据
									case "#":
										varBuffer = varBuffer.substr(1);
										//直接访问子对象?
										if(varBuffer.charAt(0) == ".")
											varBuffer = varBuffer.substr(1);
										//通过判断变量长度来确定是直接访问父对象还是访问子对象
										if(varBuffer && varBuffer.length > 0) {
											if(varBuffer.charAt(0) == "[") {
												varBuffer = "vsb" + varBuffer;
											} else {
												varBuffer = "vsb." + varBuffer;
											}
										} else {
											varBuffer = "vsb";
										}
										break;
									//window全局
									case "@":
										varBuffer = varBuffer.substr(1);
										//直接访问子对象?
										if(varBuffer.charAt(0) == ".")
											varBuffer = varBuffer.substr(1);
										//通过判断变量长度来确定是直接访问父对象还是访问子对象
										if(varBuffer && varBuffer.length > 0) {
											if(varBuffer.charAt(0) == "[") {
												varBuffer = "window" + varBuffer;
											} else {
												varBuffer = "window." + varBuffer;
											}
										} else {
											varBuffer = "window";
										}
										break;
									//局部临时变量
									default:
                                        var tempNameSplited = varBuffer.split(".");
                                        var subVars = tempNameSplited.shift().split("#");
                                        var varName = subVars.shift();
                                        if(subVars.length > 0)
                                        {
                                            var subVar = TEMP_VAR_MAP[subVars[0]];
                                            if(subVar === undefined)
                                            {
                                                throw "tempvar exception: no such tempvar \"#" + subVar + "\".";
                                                varBuffer = "\"\"";
                                            }
                                            else
                                            {
                                                tempNameSplited.unshift(subVar);
                                            }
                                        }
                                        else
                                        {
                                            tempNameSplited.unshift("v");
                                        }
                                        varBuffer = "tsb[\"" + varName + "\"]." + tempNameSplited.join(".");
								}
							}
							parsedSource += (varBuffer + curChar );
							varBuffer = "";
							continue;
						}
						break;
				}
			}
			return parsedSource.substr(0, parsedSource.length - 1);
		},
		/**
		 * 开始翻译
		 * @option source 源代码
		 */
		start : function(source) {
			source += " ";
			var javascriptSource = "var vsb=arguments[0],tsb={},settings={},rt=window[\"" + RUNTIME + "\"],cb=\"\";";
			var staticContentBuffer = "";
			var keywordBuffer = "";
			var outputValBuffer = "";
			var valBuffer = "";
			var codeFound = 0;
			var userSettings = {};
			var state = STATE.STATIC_CONTENT;
			//代码现在是否为回归完成翻译阶段?
			var returnComplete = false;
            for(var i = 0, l = source.length; i < l; ++i) {
                var curChar = source.charAt(i);
                //判断是否进入代码段
                if(curChar == "{") {
                    if(staticContentBuffer.length > 0) {
                        //保护代码不被空白内容破坏
                        if(trim(staticContentBuffer).length > 0) {
                            javascriptSource += Translater.parseStaticContent(staticContentBuffer);
                        }
                    }
                    //清空静态缓存，保证不会出问题。
                    staticContentBuffer = "";
                    state = STATE.JAVASCRIPT;
                    //记录翻译器可以识别的代码的发现数量，用于判断每次新发现的位置有一些语法要依据位置，例如直接输出变量{T.abc}，发现$并且codeFound==0即可确认这是输出变量语句。
                    codeFound = 0;
                    continue;
                }
                //判断是否离开代码段
                if(curChar == "}") {
                    //进行一些补全操作，将来优化翻译器逻辑可能会避免以下的switch的出现。
                    switch(state) {
                        //如果是输出代码，补全输出语句。
                        case STATE.OUTPUT_VAL:
                            javascriptSource += "cb+=rt.outputVal(" + Translater.parseVal(outputValBuffer) + ",settings[\"filter_data\"]);";
                            outputValBuffer = "";
                            break;
                    }
                    //如果关键字语句段还未处理完毕，回归到上一次循环，完成关键字代码。
                    if(keywordBuffer.length > 0) {
                        state = STATE.KEYWORD;
                        returnComplete = true;
                        i -= 2;
                        continue;
                    }
                    returnComplete = false;
                    state = STATE.STATIC_CONTENT;
                    continue;
                }
                switch(state) {
                    case STATE.STATIC_CONTENT:
                        staticContentBuffer += curChar;
                        break;
                    case STATE.JAVASCRIPT:
                        switch(curChar) {
                            //输出转义静态内容
                            case "\\":
                                if(codeFound == 0) {
                                    staticContentBuffer += source.charAt(i + 1);
                                    if(source.charAt(i + 2) != "}") {"static content exception: {\\" + source.charAt(i + 1);
                                        return;
                                    }
                                    state = STATE.STATIC_CONTENT; ++i; ++codeFound;
                                    continue;
                                }
                                break;
                            case "/":
                                if(codeFound == 0) {
                                    javascriptSource += "}";
                                    state = STATE.END_MARKER; ++codeFound;
                                    continue;
                                }
                            default:
                                if(curChar != " ") {
                                    keywordBuffer += curChar;
                                } else {
                                    if(keywordBuffer.length > 0) {
                                        state = STATE.KEYWORD; ++codeFound;
                                        continue;
                                    }
                                }
                                break;
                        }
                        break;
                    case STATE.OUTPUT_VAL:
                        outputValBuffer += curChar;
                        break;
                    case STATE.IF_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.ELSEIF_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.FORARR_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.FOREACH_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.FOR_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.SWITCH_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.CASE_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.LOOP_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.EVAL_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.SET_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.END_MARKER:
                        break;
                    case STATE.PACKAGE_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.WHILE_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.INCLUDE_CON:
                        valBuffer += curChar;
                        break;
                    case STATE.IDEL:
                        break;
                    case STATE.KEYWORD:
                        switch(keywordBuffer) {
                            case KEYWORD.IF:
                                if(valBuffer.length > 0) {
                                    javascriptSource += Translater.parseVal(valBuffer) + "){";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    javascriptSource += "if(";
                                    valBuffer = curChar;
                                    state = STATE.IF_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.ELSE:
                                javascriptSource += "}else{";
                                keywordBuffer = "";
                                state = STATE.STATIC_CONTENT;
                                break;
                            case KEYWORD.ELSE_IF:
                                if(valBuffer.length > 0) {
                                    javascriptSource += Translater.parseVal(valBuffer) + "){";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    javascriptSource += "}else if(";
                                    valBuffer = curChar;
                                    state = STATE.ELSEIF_CON;
                                }
                                break;
                            case KEYWORD.SWITCH:
                                if(valBuffer.length > 0) {
                                    javascriptSource += Translater.parseVal(valBuffer) + "){";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    javascriptSource += "switch(";
                                    valBuffer = curChar;
                                    state = STATE.SWITCH_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.CASE:
                                if(valBuffer.length > 0) {
                                    javascriptSource += Translater.parseVal(valBuffer) + ":";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    javascriptSource += "case ";
                                    valBuffer = curChar;
                                    state = STATE.CASE_CON;
                                }
                                break;
                            case KEYWORD.BREAK:
                                javascriptSource += "break;";
                                keywordBuffer = "";
                                state = STATE.STATIC_CONTENT;
                                break;
                            case KEYWORD.CONTINUE:
                                javascriptSource += "continue;";
                                keywordBuffer = "";
                                state = STATE.STATIC_CONTENT;
                                break;
                            case KEYWORD.DEFAULT:
                                javascriptSource += "default:";
                                keywordBuffer = "";
                                state = STATE.STATIC_CONTENT;
                                break;
                            case KEYWORD.EVAL:
                                if(valBuffer.length > 0) {
                                    javascriptSource += Translater.parseVal(valBuffer) + ";";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.EVAL_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.SET:
                                if(valBuffer.length > 0) {
                                    var setting = valBuffer.split(":");
                                    javascriptSource += "settings[\"" + trim(setting[0]) + "\"]=" + trim(setting[1]) + ";";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.SET_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.PACKAGE:
                                if(valBuffer.length > 0) {
                                    userSettings[KEYWORD.PACKAGE] = trim(valBuffer);
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.PACKAGE_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.INCLUDE:
                                if(valBuffer.length > 0) {
                                    var setting = valBuffer.split(":");
                                    setting[1] = setting.length >= 2 ? trim(setting.slice(1).join(":")) : null;
                                    javascriptSource += "cb+=rt.include(\"" + setting[0] + "\"," + (setting[1] ? Translater.parseVal(setting[1]) : null) + ");";
                                    userSettings[KEYWORD.INCLUDE] = userSettings[KEYWORD.INCLUDE] || {};
                                    userSettings[KEYWORD.INCLUDE][setting[0]] = true;
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.INCLUDE_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.FORARR:
                                if(valBuffer.length > 0) {
                                    var iterInfo = Translater.parseIterValName(valBuffer);
                                    var tsbval = "tsb[\"" + (iterInfo[1] || new Date().getTime()) + "\"]";
                                    var indexName = tsbval + ".i";
                                    var lengthName = tsbval + ".l";
                                    var finalValName = trim(Translater.parseVal(iterInfo[0]));
                                    javascriptSource += tsbval + "={};for(" + indexName + "=0," + lengthName + "=" + finalValName + ".length;" + indexName + "<" + lengthName + ";++" + indexName + "){" + tsbval + ".v" + "=" + finalValName + "[" + indexName + "];";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.FORARR_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.FOREACH:
                                if(valBuffer.length > 0) {
                                    var iterInfo = Translater.parseIterValName(valBuffer);
                                    var tsbval = "tsb[\"" + (iterInfo[1] || new Date().getTime()) + "\"]";
                                    var keyName = tsbval + ".k";
                                    var finalValName = Translater.parseVal(iterInfo[0]);
                                    javascriptSource += tsbval + "={};for(" + keyName + " in " + finalValName + "){" + tsbval + ".v=" + finalValName + "[" + keyName + "];";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.FOREACH_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.LOOP:
                                if(valBuffer.length > 0) {
                                    var iterInfo = Translater.parseIterValName(valBuffer);
                                    var tsbval = "tsb[\"" + ( iterInfo[1] || new Date().getTime() ) + "\"]";
                                    var indexName = tsbval + ".v";
                                    var lengthName = tsbval + ".o";
                                    var stepName = tsbval + ".st";
                                    var setting = Translater.parseLoopSetting(iterInfo[0]);
                                    if(setting.length <= 1)
                                        setting.push(1);
                                    if(setting.length <= 2)
                                        setting.push(0);
                                    javascriptSource += tsbval + "={};for(" + indexName + "=" + Translater.parseVal(setting[2]) + "," + lengthName + "=" + Translater.parseVal(setting[0]) + "," + stepName + "=" + Translater.parseVal(setting[1]) + ";" + indexName + "<" + lengthName + ";" + indexName + "+=" + stepName + "){";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.LOOP_CON;
                                    continue;
                                }
                                break;
                            case KEYWORD.WHILE:
                                if(valBuffer.length > 0) {
                                    javascriptSource += "while(" + Translater.parseVal(valBuffer) + "){";
                                    valBuffer = "";
                                    keywordBuffer = "";
                                    state = STATE.STATIC_CONTENT;
                                    continue;
                                } else {
                                    valBuffer = curChar;
                                    state = STATE.WHILE_CON;
                                    continue;
                                }
                                break;
                            default:
                                ++codeFound;
                                //回归完成翻译阶段不要将当前char添加到缓存，会导致char重复。
                                outputValBuffer += keywordBuffer + ( returnComplete ? "" : curChar);
                                state = STATE.OUTPUT_VAL;
                                valBuffer = "";
                                keywordBuffer = "";
                                continue;
                        }
                        break;
                }
			}
			if(staticContentBuffer.length > 0)
				javascriptSource += Translater.parseStaticContent(staticContentBuffer);
			javascriptSource += "return cb;";
			return {
				builderSource : javascriptSource.replace(REG_EXP.R_N, "\\n").replace(REG_EXP.R_R, "\\r").replace(REG_EXP.R_T, "\\t").replace(REG_EXP.R_F, "\\f"),
				userSettings : userSettings
			};
		}
	};

	/**
	 * @option source
	 * @option complete
	 */
	function Template(options) {
		this.compiled = Translater.start(options.source);
        //console.log(this.compiled.builderSource)
		this.builder = new Function(this.compiled.builderSource);
		var self = this;
		if(this.compiled.userSettings) {
			var packageName = this.compiled.userSettings[KEYWORD.PACKAGE];
			var includes = this.compiled.userSettings[KEYWORD.INCLUDE];
			var loadCount = 0;
			var hasInclude = false;
			if(includes) {
				for(var includeName in includes) {
					if(TEMPLATES.hasOwnProperty(includeName) == false) {
						hasInclude = true; ++loadCount;
						loadTemplate(includeName, function() {
							if(--loadCount <= 0) {
								if(packageName)
									window[RUNTIME].register(packageName, self);
								options.complete(self);
							}
						});
					}
				}
			}
			if(hasInclude == false) {
				if(packageName)
					window[RUNTIME].register(packageName, this);
				options.complete(self);
			}
		}
        delete this.compiled;
	};

	/**
	 * data
	 */
	Template.prototype.render = function(options) {
        options  = options || {};
		return this.builder(options.data);
	};
	//模板loader
	var templateLoader = function (packageName, setter) {
        setter("\"" + packageName + "\"无法加载，未设置loader。");
    };
	//load模板方法
	function loadTemplate(packageName, complete) {
		templateLoader(packageName, function(source) {
			Engine.compile({
				source : source,
				complete : function(template) {
					if(complete)
						complete(template);
				}
			});
		});
	};

	var Engine = {
		/**
		 * loader
		 */
		setLoader : function(options) {
			templateLoader = options.loader;
		},
		/**
		 * return void
		 * @option source
		 * @option data
		 * @option complete
		 */
		renderFromSource : function(options) {
            options  = options || {};
			Engine.compile({
				source : options.source,
				complete : function(template) {
					var text = Engine.render({
						template : template,
						data : options.data
					});
					options.complete(text);
				}
			});
		},
		/**
		 * return String
		 * @option template
		 * @option data
		 */
		render : function(options) {
            options  = options || {};
			return options.template.render({
				data : options.data || {}
			});
		},
		/**
		 * return Template
		 * @option source
		 * @option complete
		 */
		compile : function(options) {
            options  = options || {};
			new Template({
				source : options.source,
				complete : function(template) {
					options.complete(template);
				}
			});
		},
		/**
		 * packageName
		 * complete
		 */
		getTemplate : function(options) {
            options  = options || {};
			if(TEMPLATES.hasOwnProperty(options.packageName)) {
				if(options.complete)
					options.complete(TEMPLATES[options.packageName]);
			} else {
				loadTemplate(options.packageName, function(template) {
					if(options.complete)
						options.complete(template);
				});
			}
		},
		/**
		 * packageName
		 */
		removeTemplate : function(options) {
            options  = options || {};
			delete TEMPLATES[options.packageName];
		}
	};
	return Engine;
});

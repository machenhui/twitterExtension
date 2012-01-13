/**
 * Created by IntelliJ IDEA.
 * User: hangyin
 * Date: 11-11-22
 * Time: ����5:35
 * To change this template use File | Settings | File Templates.
 */
(function(){
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

	//״̬��
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

	//�ؼ���ӳ��
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

	//�ؼ���ʵ��ֵ
	var KEYWORD_STR = [];
	for(var keyWordName in KEYWORD) {
		KEYWORD_STR.push(KEYWORD[keyWordName]);
	}

	//���泣���б�
	var WORD_CONSTANT = ["true", "false", "undefined", "null", "NaN", "new", "delete"];

	var SINGLE_KEYWORD = [KEYWORD.BREAK, KEYWORD.CONTINUE, KEYWORD.CASE, KEYWORD.ELSE, KEYWORD.ELSE_IF, KEYWORD.EVAL, KEYWORD.SET, KEYWORD.PACKAGE, KEYWORD.INCLUDE, KEYWORD.DEFAULT];

	//��ʱ����ӳ��
	var TEMP_VAR_MAP = {
        length: "l",
        index: "i",
        value: "tv",
        key: "k",
        over: "o",
        step: "st"
	};

	//��ʱ�����������
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
		COUNT : 0,
		parseStaticContent : function(staticContent) {
			return "cb+=\"" + staticContent.replace(REG_EXP.R_SLASH, "\\\\").replace(REG_EXP.R_QUOTE, "\\\"") + "\";";
		},
		parseLoopSetting : function(source, deep) {
			var state = FIND_LOOP_SETTINGS.FINDING;
			//Ŀ������Ƿ��ҵ���
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
		parseIterValName : function(source, deep, keyword) {
			var state = PARSE_ITERVALNAME.FINDING;
			//Ŀ������Ƿ��ҵ���
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
		 * �������
		 */
		parseVal : function(source, deep) {
			if(deep <= 0) {
				deep = "_n";
			} else {--deep;
			}
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
							//���?�����ڵ�����
							var leftSquareIndex = varBuffer.indexOf("[");
							var rightSquareIndex = varBuffer.lastIndexOf("]");
							if(leftSquareIndex != -1 && rightSquareIndex != -1) {
								//����ֵ���ʽ
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
								//���ֱ���:
								//#:ע�����,@:ȫ�ֱ���,�ֲ���ʱ����
								switch(varBuffer.charAt(0)) {
									//ע�����
									case "#":
										varBuffer = varBuffer.substr(1);
										//ֱ�ӷ����Ӷ���?
										if(varBuffer.charAt(0) == ".")
											varBuffer = varBuffer.substr(1);
										//ͨ���жϱ���������ȷ����ֱ�ӷ��ʸ������Ƿ����Ӷ���
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
									//windowȫ��
									case "@":
										varBuffer = varBuffer.substr(1);
										//ֱ�ӷ����Ӷ���?
										if(varBuffer.charAt(0) == ".")
											varBuffer = varBuffer.substr(1);
										//ͨ���жϱ���������ȷ����ֱ�ӷ��ʸ������Ƿ����Ӷ���
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
									//�ֲ���ʱ����
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
		 * ����"���"��
		 */
		buildCodeTree : function(source) {
			var codeTree = [];
			var contentTree = [];
			var contentBuffer = "";
			var deep = 0;
			var tagClose = true;
			var tagBuffer = "";
			for(var i = 0, l = source.length; i < l; ++i) {
				var curChar = source.charAt(i);
				if(curChar == "{") {
					tagBuffer = curChar;
					nextChar = source.charAt(i + 1);
					//����ת�徲̬����
					if(nextChar == "\\") {
						tagBuffer += nextChar + source.charAt(i + 2);
						i += 2;
					}
					tagClose = false;
					continue;
				}
				if(curChar == "}") {
					tagBuffer += curChar;
					var codeEntity = trim(tagBuffer.substring(1, tagBuffer.length - 1));
					var firstWord = codeEntity.split(" ")[0];
					//����������
					//�պϱ�ǩ
					if(codeEntity.charAt(0) == "/") {--deep;
						codeTree.push({
							d : deep,
							s : contentBuffer + tagBuffer
						});
					}
					//�ǵ���ǩ�ؼ���
					else if(firstWord != "\\" && inArray(firstWord, SINGLE_KEYWORD) == false) {
						//���ǵ���ǩ�ؼ��֣�������һ��˫��ǩ�ؼ��֡�
						if(inArray(firstWord, KEYWORD_STR)) {
							codeTree.push({
								d : deep,
								s : contentBuffer + tagBuffer
							}); ++deep;
						} else {
							//���ǹؼ��֣�Ӧ�������������䡣
							codeTree.push({
								d : deep,
								s : contentBuffer + tagBuffer
							});
						}
					}
					//����ǩ�ؼ���
					else {
						codeTree.push({
							d : deep,
							s : contentBuffer + tagBuffer
						});
					}
					tagClose = true;
					tagBuffer = "";
					contentBuffer = "";
					continue;
				}
				if(tagClose == false) {
					tagBuffer += curChar;
				} else {
					contentBuffer += curChar;
				}
			}
			if(contentBuffer.length > 0)
				codeTree.push({
					d : deep,
					s : contentBuffer
				});
			return codeTree;
		},
		/**
		 * ��ʼ����
		 * @option source Դ����
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
			var codeTree = Translater.buildCodeTree(source);
			//���������Ƿ�Ϊ�ع���ɷ���׶�?
			var returnComplete = false;
			for(var ci = 0, cl = codeTree.length; ci < cl; ++ci) {
				var section = codeTree[ci];
				for(var i = 0, l = section.s.length; i < l; ++i) {
					var curChar = section.s.charAt(i);
					//�ж��Ƿ��������
					if(curChar == "{") {
						if(staticContentBuffer.length > 0) {
							//�������벻���հ������ƻ�
							if(trim(staticContentBuffer).length > 0) {
								javascriptSource += Translater.parseStaticContent(staticContentBuffer);
							}
						}
						//��վ�̬���棬��֤��������⡣
						staticContentBuffer = "";
						state = STATE.JAVASCRIPT;
						//��¼����������ʶ��Ĵ���ķ��������������ж�ÿ���·��ֵ�λ����һЩ�﷨Ҫ����λ�ã�����ֱ���������{T.abc}������$����codeFound==0����ȷ���������������䡣
						codeFound = 0;
						continue;
					}
					//�ж��Ƿ��뿪�����
					if(curChar == "}") {
						//����һЩ��ȫ�����������Ż��������߼����ܻ�������µ�switch�ĳ��֡�
						switch(state) {
							//�����������룬��ȫ�����䡣
							case STATE.OUTPUT_VAL:
								javascriptSource += "cb+=rt.outputVal(" + Translater.parseVal(outputValBuffer, section.d) + ",settings[\"filter_data\"]);";
								outputValBuffer = "";
								break;
						}
						//���ؼ������λ�δ������ϣ��ع鵽��һ��ѭ������ɹؼ��ִ��롣
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
								//���ת�徲̬����
								case "\\":
									if(codeFound == 0) {
										staticContentBuffer += section.s.charAt(i + 1);
										if(section.s.charAt(i + 2) != "}") {"static content exception: {\\" + section.s.charAt(i + 1);
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
										javascriptSource += Translater.parseVal(valBuffer, section.d) + "){";
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
										javascriptSource += Translater.parseVal(valBuffer, section.d) + "){";
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
										javascriptSource += Translater.parseVal(valBuffer, section.d) + "){";
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
										javascriptSource += Translater.parseVal(valBuffer, section.d) + ":";
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
										javascriptSource += Translater.parseVal(valBuffer, section.d) + ";";
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
										javascriptSource += "cb+=rt.include(\"" + setting[0] + "\"," + (setting[1] ? Translater.parseVal(setting[1], section.d) : null) + ");";
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
                                        var iterInfo = Translater.parseIterValName(valBuffer, section.d);
										var tsbval = "tsb[\"" + (iterInfo[1] || new Date().getTime()) + "\"]";
										var indexName = tsbval + ".i";
										var lengthName = tsbval + ".l";
										var finalValName = trim(Translater.parseVal(iterInfo[0], section.d));
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
                                        var iterInfo = Translater.parseIterValName(valBuffer, section.d);
										var tsbval = "tsb[\"" + (iterInfo[1] || new Date().getTime()) + "\"]";
										var keyName = tsbval + ".k";
										var finalValName = Translater.parseVal(iterInfo[0], section.d);
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
                                        var iterInfo = Translater.parseIterValName(valBuffer, section.d);
										var tsbval = "tsb[\"" + ( iterInfo[1] || new Date().getTime() ) + "\"]";
										var indexName = tsbval + ".v";
										var lengthName = tsbval + ".o";
										var stepName = tsbval + ".st";
										var setting = Translater.parseLoopSetting(iterInfo[0]);
										if(setting.length <= 1)
											setting.push(1);
										if(setting.length <= 2)
											setting.push(0);
										javascriptSource += tsbval + "={};for(" + indexName + "=" + Translater.parseVal(setting[2], section.d) + "," + lengthName + "=" + Translater.parseVal(setting[0], section.d) + "," + stepName + "=" + Translater.parseVal(setting[1], section.d) + ";" + indexName + "<" + lengthName + ";" + indexName + "+=" + stepName + "){";
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
										javascriptSource += "while(" + Translater.parseVal(valBuffer, section.d) + "){";
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
									//�ع���ɷ���׶β�Ҫ����ǰchar��ӵ����棬�ᵼ��char�ظ���
									outputValBuffer += keywordBuffer + ( returnComplete ? "" : curChar);
									state = STATE.OUTPUT_VAL;
									valBuffer = "";
									keywordBuffer = "";
									continue;
							}
							break;
					}
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
	//ģ��loader
	var templateLoader = function (packageName, setter) {
        setter("\"" + packageName + "\"�޷����أ�δ����loader��");
    };
	//loadģ�巽��
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
})();


Engine.setLoader({
        loader: function (packageName, setter) {
            kola(packageName, function (templateSource) {
                setter(templateSource + "{package " + packageName + "}");
                //{packageName:templateSource}
            });
        }
    });
TemplateEngine.getTemplate({
                    packageName: "template.main.app.recommends.guess",
                    complete: function (template) {
                        self.dataBuffer.getData({
                            num: self.pageSize,
                            complete: function (data) {
                                if(data.length <= 0 && self.firstGetData)
                                {
                                    self.target.remove();
                                    return;
                                }
                                self.firstGetData = false;
                                var face = $(template.render({
                                    data: data
                                }));
                                for(var i = 0,l = data.length; i < l; ++i)
                                {
                                    StatisticService.log('Guess', "be-recommend", {
                                        uid : data[i].id,
                                        recmdReason: data[i].recmdReason
                                    });
                                }
                                self.target.html("").append(face);
                                self.target.find("div.js-guess-userlist").fadeIn(300);
                            }
                        })
                    }
                });    
    
    
    





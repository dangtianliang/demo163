(function ($) {
	ChiliBook = { //implied global
		automatic : true,
		automaticSelector : "pre",
		lineNumbers : !true,
		codeLanguage : function (el) {
			var recipeName = $(el).attr("class");
			return recipeName ? recipeName : '';
		},
		recipeLoading : false,
		recipeFolder : "" // used like: recipeFolder + recipeName + '.js'
		// IE and FF convert &#160; to "&nbsp;", Safari and Opera do not
	,
		replaceSpace : "&#160;",
		replaceTab : "&#160;&#160;&#160;&#160;",
		replaceNewLine : "&#160;<br/>",
		selectionStyle : ["position:absolute; z-index:3000; overflow:scroll;", "width:16em;", "height:9em;", "border:1px solid gray;", "padding:15px;", "background-color:yellow;"
		].join(' ')
		// ------------------------------------------------------------- end of options
	,
		defaultReplacement : '<span class="$0">$$</span>' // TODO: make this an option again
	,
		recipes : {}
		//repository
	,
		queue : {}
		//registry
	,
		unique : function () {
			return (new Date()).valueOf();
		}
	};
	var book = ChiliBook;
	function cook(ingredients, recipe, blockName) {
		function prepareBlock(recipe, blockName) {
			var steps = [];
			for (var stepName in recipe[blockName]) {
				steps.push(prepareStep(recipe, blockName, stepName));
			}
			return steps;
		} // prepareBlock
		function prepareStep(recipe, blockName, stepName) {
			var step = recipe[blockName][stepName];
			var exp = (typeof step._match == "string") ? step._match : step._match.source;
			return {
				recipe : recipe,
				blockName : blockName,
				stepName : stepName,
				exp : "(" + exp + ")",
				length : 1 // add 1 to account for the newly added parentheses
				 + (exp // count number of submatches in here
					.replace(/\\./g, "%") // disable any escaped character
					.replace(/\[.*?\]/g, "%") // disable any character class
					.match(/\((?!\?)/g) // match any open parenthesis, not followed by a ?
					 || []// make sure it is an empty array if there are no matches
				).length // get the number of matches
			,
				replacement : step._replace ? step._replace : book.defaultReplacement
			};
		} // prepareStep
		function knowHow(steps) {
			var prevLength = 1;
			var exps = [];
			for (var i = 0; i < steps.length; i++) {
				var exp = steps[i].exp;
				// adjust backreferences
				exp = exp.replace(/\\\\|\\(\d+)/g, function (m, aNum) {
						return !aNum ? m : "\\" + (prevLength + 1 + parseInt(aNum, 10));
					});
				exps.push(exp);
				prevLength += steps[i].length;
			}
			var prolog = '((?:\\s|\\S)*?)';
			var epilog = '((?:\\s|\\S)+)';
			var source = '(?:' + exps.join("|") + ')';
			source = prolog + source + '|' + epilog;
			return new RegExp(source, recipe._case ? "g" : "gi");
		} // knowHow
		function escapeHTML(str) {
			return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
		} // escapeHTML
		function replaceSpaces(str) {
			return str.replace(/ +/g, function (spaces) {
				return spaces.replace(/ /g, replaceSpace);
			});
		} // replaceSpaces
		function filter(str) {
			str = escapeHTML(str);
			if (replaceSpace) {
				str = replaceSpaces(str);
			}
			return str;
		} // filter
		function applyRecipe(subject, recipe) {
			return cook(subject, recipe);
		} // applyRecipe
		function applyBlock(subject, recipe, blockName) {
			return cook(subject, recipe, blockName);
		} // applyBlock
		function applyStep(subject, recipe, blockName, stepName) {
			var step = prepareStep(recipe, blockName, stepName);
			var steps = [step];
			var perfect = subject.replace(knowHow(steps), function () {
					return chef.apply({
						steps : steps
					}, arguments);
				});
			return perfect;
		} // applyStep
		function applyModule(subject, module, context) {
			if (!module) {
				return filter(subject);
			}
			var sub = module.split('/');
			var recipeName = '';
			var blockName = '';
			var stepName = '';
			switch (sub.length) {
			case 1:
				recipeName = sub[0];
				break;
			case 2:
				recipeName = sub[0];
				blockName = sub[1];
				break;
			case 3:
				recipeName = sub[0];
				blockName = sub[1];
				stepName = sub[2];
				break;
			default:
				return filter(subject);
			}
			function getRecipe(recipeName) {
				var path = getPath(recipeName);
				var recipe = book.recipes[path];
				if (!recipe) {
					throw {
						msg : "recipe not available"
					};
				}
				return recipe;
			}
			try {
				var recipe;
				if ('' == stepName) {
					if ('' == blockName) {
						if ('' == recipeName) {
							//nothing to do
						} else { // ( '' != recipeName )
							recipe = getRecipe(recipeName);
							return applyRecipe(subject, recipe);
						}
					} else { // ( '' != blockName )
						if ('' == recipeName) {
							recipe = context.recipe;
						} else {
							recipe = getRecipe(recipeName);
						}
						if (!(blockName in recipe)) {
							return filter(subject);
						}
						return applyBlock(subject, recipe, blockName);
					}
				} else { // ( '' != stepName )
					if ('' == recipeName) {
						recipe = context.recipe;
					} else {
						recipe = getRecipe(recipeName);
					}
					if ('' == blockName) {
						blockName = context.blockName;
					}
					if (!(blockName in recipe)) {
						return filter(subject);
					}
					if (!(stepName in recipe[blockName])) {
						return filter(subject);
					}
					return applyStep(subject, recipe, blockName, stepName);
				}
			} catch (e) {
				if (e.msg && e.msg == "recipe not available") {
					var cue = 'chili_' + book.unique();
					if (book.recipeLoading) {
						var path = getPath(recipeName);
						if (!book.queue[path]) {
							/* this is a new recipe to download */
							try {
								book.queue[path] = [{
										cue : cue,
										subject : subject,
										module : module,
										context : context
									}
								];
								$.getJSON(path, function (recipeLoaded) {
									book.recipes[path] = recipeLoaded;
									var q = book.queue[path];
									for (var i = 0, iTop = q.length; i < iTop; i++) {
										var replacement = applyModule(q[i].subject, q[i].module, q[i].context);
										if (book.replaceTab) {
											replacement = replacement.replace(/\t/g, book.replaceTab);
										}
										if (book.replaceNewLine) {
											replacement = replacement.replace(/\n/g, book.replaceNewLine);
										}
										$('#' + q[i].cue).replaceWith(replacement);
									}
								});
							} catch (recipeNotAvailable) {
								alert("the recipe for '" + recipeName + "' was not found in '" + path + "'");
							}
						} else {
							/* not a new recipe, so just enqueue this element */
							book.queue[path].push({
								cue : cue,
								subject : subject,
								module : module,
								context : context
							});
						}
						return '<span id="' + cue + '">' + filter(subject) + '</span>';
					}
					return filter(subject);
				} else {
					return filter(subject);
				}
			}
		} // applyModule
		function addPrefix(prefix, replacement) {
			return replacement.replace(/(<span\s+class\s*=\s*(["']))((?:(?!__)\w)+\2\s*>)/ig, "$1" + prefix + "__$3");
		} // addPrefix
		function chef() {
			if (!arguments[0]) {
				return '';
			}
			var steps = this.steps;
			var i = 0; // iterate steps
			var j = 2; // iterate chef's arguments
			var prolog = arguments[1];
			var epilog = arguments[arguments.length - 3];
			if (!epilog) {
				var step;
				while (step = steps[i++]) {
					var aux = arguments; // this unmasks chef's arguments inside the next function
					if (aux[j]) {
						var replacement = '';
						if (!$.isFunction(step.replacement)) { //we expect step.replacement to be a string
							replacement = step.replacement
								.replace(/(\\\$)|(?:\$\$)|(?:\$(\d+))/g, function (m, escaped, K) {
									if (escaped) {
										/* \$ */
										return "$";
									} else if (!K) {
										/* $$ */
										return filter(aux[j]);
									} else if (K == "0") {
										/* $0 */
										return step.stepName;
									} else {
										/* $K */
										return filter(aux[j + parseInt(K, 10)]);
									}
								});
						} else {
							var matches = []; //Array.slice.call( aux, j, step.length );
							for (var k = 0, kTop = step.length; k < kTop; k++) {
								matches.push(aux[j + k]);
							}
							matches.push(aux[aux.length - 2]);
							matches.push(aux[aux.length - 1]);
							replacement = step.replacement
								.apply({
									x: function () {
										var subject = arguments[0];
										var module = arguments[1];
										var context = {
											recipe: step.recipe,
											blockName: step.blockName
										};
										return applyModule(subject, module, context);
									}
								}, matches);
						}
						replacement = addPrefix(step.recipe._name, replacement);
						return filter(prolog) + replacement;
					} else {
						j += step.length;
					}
				}
			} else {
				return filter(epilog);
			}
		} // chef
		if (!blockName) {
			blockName = '_main';
		}
		if (!(blockName in recipe)) {
			return filter(ingredients);
		}
		var replaceSpace = book.replaceSpace;
		var steps = prepareBlock(recipe, blockName);
		var kh = knowHow(steps);
		return ingredients.replace(kh, function () {
				return chef.apply({
					steps : steps
				}, arguments);
			});
	} // cook
	function getPath(recipeName) {
		// return book.recipeFolder + recipeName + ".js?jsoncallback=?";
		return recipeName;
	} // getPath
	window.brush = function(str, recipePath) {////保留一个闭包环境，写我想要的一个工具函数！(str+"js")
		var recipe = book.recipes[recipePath];
		if (!recipe) {
			return;
		}
		var ingredients = str;
		if (!ingredients) {
			return;
		}
		ingredients = ingredients.replace(/\r\n?/g, "\n");
		// console.log(str+":"+cook(ingredients, recipe));
		return cook(ingredients, recipe); // all happens here
	}; // makeDish
	ChiliBook.recipes = {
		"sql" : {
			"_name" : "sql",
			"_case" : false,
			"_main" : {
				"mlcom" : {
					"_match" : /\/\*[^*]*\*+([^\/][^*]*\*+)*\//
				},
				"com" : {
					"_match" : /(?:--\s+.*)|(?:[^\\]\#.*)/
				},
				"string" : {
					"_match" : /([\"\'])(?:(?:[^\1\\\r\n]*?(?:\1\1|\\.))*[^\1\\\r\n]*?)\1/
				},
				"quid" : {
					"_match" : /(`)(?:(?:[^\1\\\r\n]*?(?:\1\1|\\.))*[^\1\\\r\n]*?)\1/
				},
				"value" : {
					"_match" : /\b(?:NULL|TRUE|FALSE)\b/
				},
				"number" : {
					"_match" : /\b[+-]?(\d*\.?\d+|\d+\.?\d*)([eE][+-]?\d+)?\b/
				},
				"hexnum" : {
					"_match" : /\b0[xX][\dA-Fa-f]+\b|\b[xX]([\'\"])[\dA-Fa-f]+\1/
				},
				"variable" : {
					"_match" : /@([$.\w]+|([`\"\'])(?:(?:[^\2\\\r\n]*?(?:\2\2|\\.))*[^\2\\\r\n]*?)\2)/,
					"_replace" : '<span class="keyword">@</span><span class="variable">$1</span>'
				},
				"keyword" : {
					"_match" : /\b(?:A(?:CTION|DD|FTER|G(?:AINST|GREGATE)|L(?:GORITHM|L|TER)|N(?:ALYZE|D|Y)|S(?:C(?:II|)|ENSITIVE|)|UTO_INCREMENT|VG(?:_ROW_LENGTH|))|B(?:ACKUP|DB|E(?:FORE|GIN|RKELEYDB|TWEEN)|I(?:GINT|N(?:ARY|LOG)|T)|LOB|O(?:OL(?:EAN|)|TH)|TREE|Y(?:TE|))|C(?:A(?:CHE|LL|S(?:CADE(?:D|)|E))|H(?:A(?:IN|NGE(?:D|)|R(?:ACTER|SET|))|ECK(?:SUM|))|IPHER|L(?:IENT|OSE)|O(?:DE|L(?:LAT(?:E|ION)|UMN(?:S|))|M(?:M(?:ENT|IT(?:TED|))|P(?:ACT|RESSED))|N(?:CURRENT|DITION|NECTION|S(?:ISTENT|TRAINT)|T(?:AINS|INUE)|VERT))|R(?:EATE|OSS)|U(?:BE|R(?:RENT_(?:DATE|TIME(?:STAMP|)|USER)|SOR)))|D(?:A(?:T(?:A(?:BASE(?:S|)|)|E(?:TIME|))|Y(?:_(?:HOUR|MI(?:CROSECOND|NUTE)|SECOND)|))|E(?:ALLOCATE|C(?:IMAL|LARE|)|F(?:AULT|INER)|L(?:AY(?:ED|_KEY_WRITE)|ETE)|S(?:C(?:RIBE|)|_KEY_FILE)|TERMINISTIC)|I(?:RECTORY|S(?:ABLE|CARD|TINCT(?:ROW|))|V)|O(?:UBLE|)|ROP|U(?:AL|MPFILE|PLICATE)|YNAMIC)|E(?:ACH|LSE(?:IF|)|N(?:ABLE|CLOSED|D|GINE(?:S|)|UM)|RRORS|SCAPE(?:D|)|VENTS|X(?:ECUTE|I(?:STS|T)|P(?:ANSION|LAIN)|TENDED))|F(?:A(?:LSE|ST)|ETCH|I(?:ELDS|LE|RST|XED)|L(?:OAT(?:4|8|)|USH)|O(?:R(?:CE|EIGN|)|UND)|R(?:AC_SECOND|OM)|U(?:LL(?:TEXT|)|NCTION))|G(?:E(?:OMETRY(?:COLLECTION|)|T_FORMAT)|LOBAL|R(?:ANT(?:S|)|OUP))|H(?:A(?:NDLER|SH|VING)|ELP|IGH_PRIORITY|O(?:STS|UR(?:_(?:MI(?:CROSECOND|NUTE)|SECOND)|)))|I(?:DENTIFIED|F|GNORE|MPORT|N(?:DEX(?:ES|)|FILE|N(?:ER|O(?:BASE|DB))|OUT|SE(?:NSITIVE|RT(?:_METHOD|))|T(?:1|2|3|4|8|E(?:GER|RVAL)|O|)|VOKER|)|O_THREAD|S(?:OLATION|SUER|)|TERATE)|JOIN|K(?:EY(?:S|)|ILL)|L(?:A(?:NGUAGE|ST)|E(?:A(?:DING|VE(?:S|))|FT|VEL)|I(?:KE|MIT|NES(?:TRING|))|O(?:AD|C(?:AL(?:TIME(?:STAMP|)|)|K(?:S|))|GS|NG(?:BLOB|TEXT|)|OP|W_PRIORITY))|M(?:A(?:STER(?:_(?:CONNECT_RETRY|HOST|LOG_(?:FILE|POS)|P(?:ASSWORD|ORT)|S(?:ERVER_ID|SL(?:_(?:C(?:A(?:PATH|)|ERT|IPHER)|KEY)|))|USER)|)|TCH|X_(?:CONNECTIONS_PER_HOUR|QUERIES_PER_HOUR|ROWS|U(?:PDATES_PER_HOUR|SER_CONNECTIONS)))|E(?:DIUM(?:BLOB|INT|TEXT|)|RGE)|I(?:CROSECOND|DDLEINT|GRATE|N(?:UTE(?:_(?:MICROSECOND|SECOND)|)|_ROWS))|O(?:D(?:E|IF(?:IES|Y)|)|NTH)|U(?:LTI(?:LINESTRING|PO(?:INT|LYGON))|TEX))|N(?:A(?:ME(?:S|)|T(?:IONAL|URAL))|CHAR|DB(?:CLUSTER|)|E(?:W|XT)|O(?:NE|T|_WRITE_TO_BINLOG|)|U(?:LL|MERIC)|VARCHAR)|O(?:FFSET|LD_PASSWORD|N(?:E(?:_SHOT|)|)|P(?:EN|TI(?:MIZE|ON(?:ALLY|)))|R(?:DER|)|UT(?:ER|FILE|))|P(?:A(?:CK_KEYS|RTIAL|SSWORD)|HASE|O(?:INT|LYGON)|R(?:E(?:CISION|PARE|V)|I(?:MARY|VILEGES)|OCE(?:DURE|SS(?:LIST|)))|URGE)|QU(?:ARTER|ERY|ICK)|R(?:AID(?:0|_(?:CHUNKS(?:IZE|)|TYPE))|E(?:A(?:D(?:S|)|L)|COVER|DUNDANT|FERENCES|GEXP|L(?:AY_(?:LOG_(?:FILE|POS)|THREAD)|EASE|OAD)|NAME|P(?:AIR|EAT(?:ABLE|)|L(?:ACE|ICATION))|QUIRE|S(?:ET|T(?:ORE|RICT)|UME)|TURN(?:S|)|VOKE)|IGHT|LIKE|O(?:LL(?:BACK|UP)|UTINE|W(?:S|_FORMAT|))|TREE)|S(?:AVEPOINT|CHEMA(?:S|)|E(?:C(?:OND(?:_MICROSECOND|)|URITY)|LECT|NSITIVE|PARATOR|RIAL(?:IZABLE|)|SSION|T)|H(?:ARE|OW|UTDOWN)|I(?:GNED|MPLE)|LAVE|MALLINT|NAPSHOT|O(?:ME|NAME|UNDS)|P(?:ATIAL|ECIFIC)|QL(?:EXCEPTION|STATE|WARNING|_(?:B(?:IG_RESULT|UFFER_RESULT)|CA(?:CHE|LC_FOUND_ROWS)|NO_CACHE|SMALL_RESULT|T(?:HREAD|SI_(?:DAY|FRAC_SECOND|HOUR|M(?:INUTE|ONTH)|QUARTER|SECOND|WEEK|YEAR)))|)|SL|T(?:A(?:RT(?:ING|)|TUS)|O(?:P|RAGE)|R(?:AIGHT_JOIN|I(?:NG|PED)))|U(?:BJECT|PER|SPEND))|T(?:ABLE(?:S(?:PACE|)|)|E(?:MP(?:ORARY|TABLE)|RMINATED|XT)|HEN|I(?:ME(?:STAMP(?:ADD|DIFF|)|)|NY(?:BLOB|INT|TEXT))|O|R(?:A(?:ILING|NSACTION)|IGGER(?:S|)|U(?:E|NCATE))|YPE(?:S|))|U(?:N(?:COMMITTED|D(?:EFINED|O)|I(?:CODE|ON|QUE)|KNOWN|LOCK|SIGNED|TIL)|P(?:DATE|GRADE)|S(?:AGE|E(?:R(?:_RESOURCES|)|_FRM|)|ING)|TC_(?:DATE|TIME(?:STAMP|)))|V(?:A(?:LUE(?:S|)|R(?:BINARY|CHAR(?:ACTER|)|IABLES|YING))|IEW)|W(?:ARNINGS|EEK|H(?:E(?:N|RE)|ILE)|ITH|ORK|RITE)|X(?:509|A|OR)|YEAR(?:_MONTH|)|ZEROFILL)\b/
				},
				'function' : {
					"_match" : /\b(?:A(?:BS|COS|DD(?:DATE|TIME)|ES_(?:DECRYPT|ENCRYPT)|REA|S(?:BINARY|IN|TEXT|WK(?:B|T))|TAN(?:2|))|B(?:ENCHMARK|I(?:N|T_(?:AND|COUNT|LENGTH|OR|XOR)))|C(?:AST|E(?:IL(?:ING|)|NTROID)|HAR(?:ACTER_LENGTH|_LENGTH)|O(?:ALESCE|ERCIBILITY|MPRESS|N(?:CAT(?:_WS|)|NECTION_ID|V(?:ERT_TZ|))|S|T|UNT)|R(?:C32|OSSES)|UR(?:DATE|TIME))|D(?:A(?:TE(?:DIFF|_(?:ADD|FORMAT|SUB))|Y(?:NAME|OF(?:MONTH|WEEK|YEAR)))|E(?:CODE|GREES|S_(?:DECRYPT|ENCRYPT))|I(?:MENSION|SJOINT))|E(?:LT|N(?:C(?:ODE|RYPT)|DPOINT|VELOPE)|QUALS|X(?:P(?:ORT_SET|)|T(?:ERIORRING|RACT)))|F(?:I(?:ELD|ND_IN_SET)|LOOR|O(?:RMAT|UND_ROWS)|ROM_(?:DAYS|UNIXTIME))|G(?:E(?:OM(?:COLLFROM(?:TEXT|WKB)|ETRY(?:COLLECTIONFROM(?:TEXT|WKB)|FROM(?:TEXT|WKB)|N|TYPE)|FROM(?:TEXT|WKB))|T_LOCK)|LENGTH|R(?:EATEST|OUP_(?:CONCAT|UNIQUE_USERS)))|HEX|I(?:FNULL|N(?:ET_(?:ATON|NTOA)|STR|TER(?:IORRINGN|SECTS))|S(?:CLOSED|EMPTY|NULL|SIMPLE|_(?:FREE_LOCK|USED_LOCK)))|L(?:AST_(?:DAY|INSERT_ID)|CASE|E(?:AST|NGTH)|INE(?:FROM(?:TEXT|WKB)|STRINGFROM(?:TEXT|WKB))|N|O(?:AD_FILE|CATE|G(?:10|2|)|WER)|PAD|TRIM)|M(?:A(?:KE(?:DATE|TIME|_SET)|STER_POS_WAIT|X)|BR(?:CONTAINS|DISJOINT|EQUAL|INTERSECTS|OVERLAPS|TOUCHES|WITHIN)|D5|I(?:D|N)|LINEFROM(?:TEXT|WKB)|ONTHNAME|PO(?:INTFROM(?:TEXT|WKB)|LYFROM(?:TEXT|WKB))|ULTI(?:LINESTRINGFROM(?:TEXT|WKB)|PO(?:INTFROM(?:TEXT|WKB)|LYGONFROM(?:TEXT|WKB))))|N(?:AME_CONST|OW|U(?:LLIF|M(?:GEOMETRIES|INTERIORRINGS|POINTS)))|O(?:CT(?:ET_LENGTH|)|RD|VERLAPS)|P(?:ERIOD_(?:ADD|DIFF)|I|O(?:INT(?:FROM(?:TEXT|WKB)|N)|LY(?:FROM(?:TEXT|WKB)|GONFROM(?:TEXT|WKB))|SITION|W(?:ER|)))|QUOTE|R(?:A(?:DIANS|ND)|E(?:LEASE_LOCK|VERSE)|O(?:UND|W_COUNT)|PAD|TRIM)|S(?:E(?:C_TO_TIME|SSION_USER)|HA(?:1|)|I(?:GN|N)|LEEP|OUNDEX|PACE|QRT|RID|T(?:ARTPOINT|D(?:DEV(?:_(?:POP|SAMP)|)|)|R(?:CMP|_TO_DATE))|U(?:B(?:DATE|STR(?:ING(?:_INDEX|)|)|TIME)|M)|YS(?:DATE|TEM_USER))|T(?:AN|IME(?:DIFF|_(?:FORMAT|TO_SEC))|O(?:UCHES|_DAYS)|RIM)|U(?:CASE|N(?:COMPRESS(?:ED_LENGTH|)|HEX|I(?:QUE_USERS|X_TIMESTAMP))|PPER|UID)|V(?:AR(?:IANCE|_(?:POP|SAMP))|ERSION)|W(?:EEK(?:DAY|OFYEAR)|ITHIN)|X|Y(?:EARWEEK|))(?=\()/
				},
				"id" : {
					"_match" : /[$\w]+/
				}
			}
		},
		"css" : {
			"_name" : 'css',
			"_case" : true,
			"_main" : {
				"comment" : {
					"_match" : /\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\//
				},
				"directive" : {
					"_match" : /@\w+/
				},
				"url" : {
					"_match" : /\b(url\s*\()([^)]+)(\))/,
					"_replace" : "<span class='url'>$1</span>$2<span class='url'>$3</span>"
				},
				"block" : {
					"_match" : /\{([\w\W]*?)\}/,
					"_replace" : function (all, pairs) {
						return '{' + this.x(pairs, '/definition') + '}';
					}
				},
				'class' : {
					"_match" : /\.\w+/
				},
				"id" : {
					"_match" : /#\w+/
				},
				"pseudo" : {
					"_match" : /:\w+/
				},
				"element" : {
					"_match" : /\w+/
				}
			},
			"definition" : {
				"comment" : {
					"_match" : /\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\//
				},
				"property" : {
					"_match" : /\b(?:zoom|z-index|writing-mode|word-wrap|word-spacing|word-break|width|widows|white-space|volume|voice-family|visibility|vertical-align|unicode-bidi|top|text-underline-position|text-transform|text-shadow|text-overflow|text-kashida-space|text-justify|text-indent|text-decoration|text-autospace|text-align-last|text-align|table-layout|stress|speech-rate|speak-punctuation|speak-numeral|speak-header|speak|size|scrollbar-track-color|scrollbar-shadow-color|scrollbar-highlight-color|scrollbar-face-color|scrollbar-dark-shadow-color|scrollbar-base-color|scrollbar-arrow-color|scrollbar-3d-light-color|ruby-position|ruby-overhang|ruby-align|right|richness|quotes|position|play-during|pitch-range|pitch|pause-before|pause-after|pause|page-break-inside|page-break-before|page-break-after|page|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-Y|overflow-X|overflow|outline-width|outline-style|outline-color|outline|orphans|min-width|min-height|max-width|max-height|marks|marker-offset|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|line-break|letter-spacing|left|layout-grid-type|layout-grid-mode|layout-grid-line|layout-grid-char-spacing|layout-grid-char|layout-grid|layout-flow|layer-background-image|layer-background-color|include-source|ime-mode|height|font-weight|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-family|font|float|filter|empty-cells|elevation|display|direction|cursor|cue-before|cue-after|cue|counter-reset|counter-increment|content|color|clip|clear|caption-side|bottom|border-width|border-top-width|border-top-style|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-left-width|border-left-style|border-left-color|border-left|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-color|border-bottom|border|behavior|background-repeat|background-position-y|background-position-x|background-position|background-image|background-color|background-attachment|background|azimuth|accelerator)\s*:/
				},
				"special" : {
					"_match" : /\b(?:-use-link-source|-set-link-source|-replace|-moz-user-select|-moz-user-modify|-moz-user-input|-moz-user-focus|-moz-outline-width|-moz-outline-style|-moz-outline-color|-moz-outline|-moz-opacity|-moz-border-top-colors|-moz-border-right-colors|-moz-border-radius-topright|-moz-border-radius-topleft|-moz-border-radius-bottomright|-moz-border-radius-bottomleft|-moz-border-radius|-moz-border-left-colors|-moz-border-bottom-colors|-moz-binding)\s*:/
				},
				"url" : {
					"_match" : /\b(url\s*\()([^)]+)(\))/,
					"_replace" : "<span class='url'>$1</span>$2<span class='url'>$3</span>"
				},
				"value" : {
					"_match" : /\b(?:xx-small|xx-large|x-soft|x-small|x-slow|x-low|x-loud|x-large|x-high|x-fast|wider|wait|w-resize|visible|url|uppercase|upper-roman|upper-latin|upper-alpha|underline|ultra-expanded|ultra-condensed|tv|tty|transparent|top|thin|thick|text-top|text-bottom|table-row-group|table-row|table-header-group|table-footer-group|table-column-group|table-column|table-cell|table-caption|sw-resize|super|sub|status-bar|static|square|spell-out|speech|solid|soft|smaller|small-caption|small-caps|small|slower|slow|silent|show|separate|semi-expanded|semi-condensed|se-resize|scroll|screen|s-resize|run-in|rtl|rightwards|right-side|right|ridge|rgb|repeat-y|repeat-x|repeat|relative|projection|print|pre|portrait|pointer|overline|outside|outset|open-quote|once|oblique|nw-resize|nowrap|normal|none|no-repeat|no-open-quote|no-close-quote|ne-resize|narrower|n-resize|move|mix|middle|message-box|medium|marker|ltr|lowercase|lower-roman|lower-latin|lower-greek|lower-alpha|lower|low|loud|local|list-item|line-through|lighter|level|leftwards|left-side|left|larger|large|landscape|justify|italic|invert|inside|inset|inline-table|inline|icon|higher|high|hide|hidden|help|hebrew|handheld|groove|format|fixed|faster|fast|far-right|far-left|fantasy|extra-expanded|extra-condensed|expanded|embossed|embed|e-resize|double|dotted|disc|digits|default|decimal-leading-zero|decimal|dashed|cursive|crosshair|cross|crop|counters|counter|continuous|condensed|compact|collapse|code|close-quote|circle|center-right|center-left|center|caption|capitalize|braille|bottom|both|bolder|bold|block|blink|bidi-override|below|behind|baseline|avoid|auto|aural|attr|armenian|always|all|absolute|above)\b/
				},
				"string" : {
					"_match" : /(?:\'[^\'\\\n]*(?:\\.[^\'\\\n]*)*\')|(?:\"[^\"\\\n]*(?:\\.[^\"\\\n]*)*\")/
				},
				"number" : {
					"_match" : /(?:\b[+-]?(?:\d*\.?\d+|\d+\.?\d*))(?:%|(?:(?:px|pt|em|)\b))/
				},
				"color" : {
					"_match" : /(?:\#[a-fA-F0-9]{3,6})|\b(?:yellow|white|teal|silver|red|purple|olive|navy|maroon|lime|green|gray|fuchsia|blue|black|aqua|YellowGreen|Yellow|WhiteSmoke|White|Wheat|Violet|Turquoise|Tomato|Thistle|Teal|Tan|SteelBlue|SpringGreen|Snow|SlateGrey|SlateGray|SlateBlue|SkyBlue|Silver|Sienna|SeaShell|SeaGreen|SandyBrown|Salmon|SaddleBrown|RoyalBlue|RosyBrown|Red|Purple|PowderBlue|Plum|Pink|Peru|PeachPuff|PapayaWhip|PaleVioletRed|PaleTurquoise|PaleGreen|PaleGoldenRod|Orchid|OrangeRed|Orange|OliveDrab|Olive|OldLace|Navy|NavajoWhite|Moccasin|MistyRose|MintCream|MidnightBlue|MediumVioletRed|MediumTurquoise|MediumSpringGreen|MediumSlateBlue|MediumSeaGreen|MediumPurple|MediumOrchid|MediumBlue|MediumAquaMarine|Maroon|Magenta|Linen|LimeGreen|Lime|LightYellow|LightSteelBlue|LightSlateGrey|LightSlateGray|LightSkyBlue|LightSeaGreen|LightSalmon|LightPink|LightGrey|LightGreen|LightGray|LightGoldenRodYellow|LightCyan|LightCoral|LightBlue|LemonChiffon|LawnGreen|LavenderBlush|Lavender|Khaki|Ivory|Indigo|IndianRed|HotPink|HoneyDew|Grey|GreenYellow|Green|Gray|GoldenRod|Gold|GhostWhite|Gainsboro|Fuchsia|ForestGreen|FloralWhite|FireBrick|DodgerBlue|DimGrey|DimGray|DeepSkyBlue|DeepPink|Darkorange|DarkViolet|DarkTurquoise|DarkSlateGrey|DarkSlateGray|DarkSlateBlue|DarkSeaGreen|DarkSalmon|DarkRed|DarkOrchid|DarkOliveGreen|DarkMagenta|DarkKhaki|DarkGrey|DarkGreen|DarkGray|DarkGoldenRod|DarkCyan|DarkBlue|Cyan|Crimson|Cornsilk|CornflowerBlue|Coral|Chocolate|Chartreuse|CadetBlue|BurlyWood|Brown|BlueViolet|Blue|BlanchedAlmond|Black|Bisque|Beige|Azure|Aquamarine|Aqua|AntiqueWhite|AliceBlue)\b/
				}
			}
		},
		"js" : {
			"_name" : 'js',
			"_case" : true,
			"_main" : {
				"ml_comment" : {
					"_match" : /\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\//
				},
				"sl_comment" : {
					"_match" : /\/\/.*/
				},
				"string" : {
					"_match" : /(?:\'[^\'\\\n]*(?:\\.[^\'\\\n]*)*\')|(?:\"[^\"\\\n]*(?:\\.[^\"\\\n]*)*\")/
				},
				"num" : {
					"_match" : /\b[+-]?(?:\d*\.?\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?\b/
				},
				"reg_not" : { //this prevents "a / b / c" to be interpreted as a reg_exp
					"_match" : /(?:\w+\s*)\/[^\/\\\n]*(?:\\.[^\/\\\n]*)*\/[gim]*(?:\s*\w+)/,
					"_replace" : function (all) {
						return this.x(all, '//num');
					}
				},
				"reg_exp" : {
					"_match" : /\/[^\/\\\n]*(?:\\.[^\/\\\n]*)*\/[gim]*/
				},
				"brace" : {
					"_match" : /[\{\}]/
				},
				"statement" : {
					"_match" : /\b(with|while|var|try|throw|switch|return|if|for|finally|else|do|default|continue|const|catch|case|break)\b/
				},
				"error" : {
					"_match" : /\b(URIError|TypeError|SyntaxError|ReferenceError|RangeError|EvalError|Error)\b/
				},
				"object" : {
					"_match" : /\b(String|RegExp|Object|Number|Math|Function|Date|Boolean|Array)\b/
				},
				"property" : {
					"_match" : /\b(undefined|arguments|NaN|Infinity)\b/
				},
				'function' : {
					"_match" : /\b(parseInt|parseFloat|isNaN|isFinite|eval|encodeURIComponent|encodeURI|decodeURIComponent|decodeURI)\b/
				},
				"operator" : {
					"_match" : /\b(void|typeof|this|new|instanceof|in|function|delete)\b/
				},
				"liveconnect" : {
					"_match" : /\b(sun|netscape|java|Packages|JavaPackage|JavaObject|JavaClass|JavaArray|JSObject|JSException)\b/
				}
			}
		},
		"html" : {
			"_name" : 'html',
			"_case" : false,
			"_main" : {
				"doctype" : {
					"_match" : /<!DOCTYPE\b[\w\W]*?>/
				},
				"ie_style" : {
					"_match" : /(<!--\[[^\]]*\]>)([\w\W]*?)(<!\[[^\]]*\]-->)/,
					"_replace" : function (all, open, content, close) {
						return "<span class='ie_style'>" + this.x(open) + "</span>"
						 + this.x(content, '//style')
						 + "<span class='ie_style'>" + this.x(close) + "</span>";
					}
				},
				"comment" : {
					"_match" : /<!--[\w\W]*?-->/
				},
				"script" : {
					"_match" : /(<script\s+[^>]*>)([\w\W]*?)(<\/script\s*>)/,
					"_replace" : function (all, open, content, close) {
						return this.x(open, '//tag_start')
						 + this.x(content, 'js')
						 + this.x(close, '//tag_end');
					}
				},
				"style" : {
					"_match" : /(<style\s+[^>]*>)([\w\W]*?)(<\/style\s*>)/,
					"_replace" : function (all, open, content, close) {
						return this.x(open, '//tag_start')
						 + this.x(content, 'css')
						 + this.x(close, '//tag_end');
					}
				}
				// matches a starting tag of an element (with attrs)
				// like "<div ... >" or "<img ... />"
			,
				"tag_start" : {
					"_match" : /(<\w+)((?:[?%]>|[\w\W])*?)(\/>|>)/,
					"_replace" : function (all, open, content, close) {
						return "<span class='tag_start'>" + this.x(open) + "</span>"
						 + this.x(content, '/tag_attrs')
						 + "<span class='tag_start'>" + this.x(close) + "</span>";
					}
				}
				// matches an ending tag
				// like "</div>"
			,
				"tag_end" : {
					"_match" : /<\/\w+\s*>|\/>/
				},
				"entity" : {
					"_match" : /&\w+?;/
				}
			},
			"tag_attrs" : {
				// matches a name/value pair
				"attr" : {
					// before in $1, name in $2, between in $3, value in $4
					"_match" : /(\W*?)([\w-]+)(\s*=\s*)((?:\'[^\']*(?:\\.[^\']*)*\')|(?:\"[^\"]*(?:\\.[^\"]*)*\"))/,
					"_replace" : "$1<span class='attr_name'>$2</span>$3<span class='attr_value'>$4</span>"
				}
			}
		},
		"php" : {
			"_name" : "php",
			"_case" : true,
			"_main" : {
				"all" : {
					"_match" : /[\w\W]*/,
					"_replace" : function (all) {
						var placeholder = String.fromCharCode(0);
						var blocks = [];
						var that = this;
						var no_php_1 = all.replace(/<\?[^?]*\?+(?:[^>][^?]*\?+)*>/g, function (block) {
								blocks.push(that.x(block, '/block/php_1'));
								return placeholder;
							});
						var no_php_2 = no_php_1.replace(/^[^?]*\?+(?:[^>][^?]*\?+)*>|<\?[\w\W]*$/g, function (block) {
								blocks.push(that.x(block, '/block/php_2'));
								return placeholder;
							});
						if (blocks.length) {
							var html = this.x(no_php_2, 'html');
							var count = 0;
							return html.replace(new RegExp(placeholder, "g"), function () {
								return blocks[count++];
							});
						} else {
							return this.x(all, '/php');
						}
					}
				}
			},
			"block" : {
				"php_1" : { // --- <? +++ ?> ---
					"_match" : /(<\?(?:php\b)?)([^?]*\?+(?:[^>][^?]*\?+)*>)/,
					"_replace" : function (all, open, content) {
						return "<span class='start'>" + this.x(open) + "</span>"
						 + this.x(content.replace(/\?>$/, ''), '/php')
						 + "<span class='end'>" + this.x('?>') + "</span>";
					}
				},
				"php_2" : { // +++ ?> --- <? +++
					"_match" : /([^?]*\?+(?:[^>][^?]*\?+)*>)|(<\?(?:php\b)?)([\w\W]*)/,
					"_replace" : function (all, content, open2, content2) {
						if (open2) {
							return "<span class='start'>" + this.x(open2) + "</span>"
							 + this.x(content2, '/php');
						} else {
							return this.x(content.replace(/\?>$/, ''), '/php')
							 + "<span class='end'>" + this.x('?>') + "</span>";
						}
					}
				}
			},
			"php" : {
				"mlcom" : {
					"_match" : /\/\*[^*]*\*+([^\/][^*]*\*+)*\//
				},
				"com" : {
					"_match" : /(?:\/\/.*)|(?:[^\\]\#.*)/
				},
				"string1" : {
					"_match" : /\'[^\'\\]*(?:\\.[^\'\\]*)*\'/
				},
				"string2" : {
					"_match" : /\"[^\"\\]*(?:\\.[^\"\\]*)*\"/
				},
				"value" : {
					"_match" : /\b(?:[Nn][Uu][Ll][Ll]|[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])\b/
				},
				"number" : {
					"_match" : /\b[+-]?(\d*\.?\d+|\d+\.?\d*)([eE][+-]?\d+)?\b/
				},
				"const1" : {
					"_match" : /\b(?:DEFAULT_INCLUDE_PATH|E_(?:ALL|CO(?:MPILE_(?:ERROR|WARNING)|RE_(?:ERROR|WARNING))|ERROR|NOTICE|PARSE|STRICT|USER_(?:ERROR|NOTICE|WARNING)|WARNING)|P(?:EAR_(?:EXTENSION_DIR|INSTALL_DIR)|HP_(?:BINDIR|CONFIG_FILE_(?:PATH|SCAN_DIR)|DATADIR|E(?:OL|XTENSION_DIR)|INT_(?:MAX|SIZE)|L(?:IBDIR|OCALSTATEDIR)|O(?:S|UTPUT_HANDLER_(?:CONT|END|START))|PREFIX|S(?:API|HLIB_SUFFIX|YSCONFDIR)|VERSION))|__COMPILER_HALT_OFFSET__)\b/
				},
				"const2" : {
					"_match" : /\b(?:A(?:B(?:DAY_(?:1|2|3|4|5|6|7)|MON_(?:1(?:0|1|2|)|2|3|4|5|6|7|8|9))|LT_DIGITS|M_STR|SSERT_(?:ACTIVE|BAIL|CALLBACK|QUIET_EVAL|WARNING))|C(?:ASE_(?:LOWER|UPPER)|HAR_MAX|O(?:DESET|NNECTION_(?:ABORTED|NORMAL|TIMEOUT)|UNT_(?:NORMAL|RECURSIVE))|R(?:EDITS_(?:ALL|DOCS|FULLPAGE|G(?:ENERAL|ROUP)|MODULES|QA|SAPI)|NCYSTR|YPT_(?:BLOWFISH|EXT_DES|MD5|S(?:ALT_LENGTH|TD_DES)))|URRENCY_SYMBOL)|D(?:AY_(?:1|2|3|4|5|6|7)|ECIMAL_POINT|IRECTORY_SEPARATOR|_(?:FMT|T_FMT))|E(?:NT_(?:COMPAT|NOQUOTES|QUOTES)|RA(?:_(?:D_(?:FMT|T_FMT)|T_FMT|YEAR)|)|XTR_(?:IF_EXISTS|OVERWRITE|PREFIX_(?:ALL|I(?:F_EXISTS|NVALID)|SAME)|SKIP))|FRAC_DIGITS|GROUPING|HTML_(?:ENTITIES|SPECIALCHARS)|IN(?:FO_(?:ALL|C(?:ONFIGURATION|REDITS)|ENVIRONMENT|GENERAL|LICENSE|MODULES|VARIABLES)|I_(?:ALL|PERDIR|SYSTEM|USER)|T_(?:CURR_SYMBOL|FRAC_DIGITS))|L(?:C_(?:ALL|C(?:OLLATE|TYPE)|M(?:ESSAGES|ONETARY)|NUMERIC|TIME)|O(?:CK_(?:EX|NB|SH|UN)|G_(?:A(?:LERT|UTH(?:PRIV|))|C(?:ONS|R(?:IT|ON))|D(?:AEMON|EBUG)|E(?:MERG|RR)|INFO|KERN|L(?:OCAL(?:0|1|2|3|4|5|6|7)|PR)|MAIL|N(?:DELAY|EWS|O(?:TICE|WAIT))|ODELAY|P(?:ERROR|ID)|SYSLOG|U(?:SER|UCP)|WARNING)))|M(?:ON_(?:1(?:0|1|2|)|2|3|4|5|6|7|8|9|DECIMAL_POINT|GROUPING|THOUSANDS_SEP)|_(?:1_PI|2_(?:PI|SQRTPI)|E|L(?:N(?:10|2)|OG(?:10E|2E))|PI(?:_(?:2|4)|)|SQRT(?:1_2|2)))|N(?:EGATIVE_SIGN|O(?:EXPR|STR)|_(?:CS_PRECEDES|S(?:EP_BY_SPACE|IGN_POSN)))|P(?:ATH(?:INFO_(?:BASENAME|DIRNAME|EXTENSION)|_SEPARATOR)|M_STR|OSITIVE_SIGN|_(?:CS_PRECEDES|S(?:EP_BY_SPACE|IGN_POSN)))|RADIXCHAR|S(?:EEK_(?:CUR|END|SET)|ORT_(?:ASC|DESC|NUMERIC|REGULAR|STRING)|TR_PAD_(?:BOTH|LEFT|RIGHT))|T(?:HOUS(?:ANDS_SEP|EP)|_FMT(?:_AMPM|))|YES(?:EXPR|STR))\b/
				},
				"global" : {
					"_match" : /(?:\$GLOBALS|\$_COOKIE|\$_ENV|\$_FILES|\$_GET|\$_POST|\$_REQUEST|\$_SERVER|\$_SESSION|\$php_errormsg)\b/
				},
				"keyword" : {
					"_match" : /\b(?:__CLASS__|__FILE__|__FUNCTION__|__LINE__|__METHOD__|abstract|and|array|as|break|case|catch|cfunction|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exception|exit|extends|extends|final|for|foreach|function|global|if|implements|include|include_once|interface|isset|list|new|old_function|or|php_user_filter|print|private|protected|public|require|require_once|return|static|switch|this|throw|try|unset|use|var|while|xor)\b/
				},
				"variable" : {
					"_match" : /\$(\w+)/,
					"_replace" : '<span class="keyword">$</span><span class="variable">$1</span>'
				},
				"heredoc" : {
					"_match" : /(\<\<\<\s*)(\w+)((?:(?!\2).*\n)+)(\2)\b/,
					"_replace" : '<span class="keyword">$1</span><span class="string1">$2</span><span class="string2">$3</span><span class="string1">$4</span>'
				}
			}
		}
	}
})(jQuery);
(function (window, jQuery) {

    if (typeof jQuery == 'undefined') {
        if (typeof window.console !== 'undefined')
            console.error('MiniWidget depends on jQuery!');
        return;
    }

    function MiniWidget (opt) {

        var me = this;

        opt = opt || {};

        //--- Config options

        me.rootURL   = opt.rootURL   || '';
        me.proxyPath = opt.proxyPath || '';
        me.dataPath  = opt.dataPath  || '';

        me.locale = opt.locale || "da-DK";

        me.displayRec = opt.displayRec || 3;

        me.excludeList = opt.excludeList || [];

        me.options = opt.options || {
            locale: "en-HK",
            loanAmount: 10000,
            loanTenure: 60,
            //filter: "INSTALMENT"
        };

        me.targetClass = opt.targetClass || '.plwidget';
        me.targetAttr = opt.targetAttr || 'data';
        me.targetPorperty = opt.targetPorperty || 'loanAmount';

        me.pathToTemplates = opt.pathToTemplates || 'tpl/';
        me.myTemplates = opt.myTemplates || ['pl_main', 'pl_row'];

        me.langFile = opt.langFile || 'lang/pl_lang.json';

        me.adjustOffset = opt.adjustOffset || {
            top: -58,
            left: 22
        };

        //---- End config options

        me.containerId = 'mw_' + new Date().getTime();

        me.templates = {};

        me.doneTpl = {};

        me.getTemplates = function () {
            for (k in me.myTemplates) {
                $.ajax({
                    url: me.pathToTemplates + me.myTemplates[k] + '.tpl',
                    type: "GET",
                    inc: k,
                    tpl: me.myTemplates[k],
                    complete: function(data) {
                        me.templates[this.tpl] = data.responseText;
                        if (this.inc == me.myTemplates.length-1) {
                            me.onReadyTpl();
                        }
                    }
                });
            }
        };

        me.getTemplates();

        me.getLanguages = function () {
            $.ajax({
                url: me.langFile,
                type: "GET",
                complete: function(data) {
                    me.lang = JSON.parse(data.responseText);
                }
            });
        }

        me.getLanguages();

        me.onReadyTpl = function () {};

        me.proxyURL = me.rootURL + me.proxyPath;
        me.dataURL  = me.rootURL + me.dataPath;

        me.requestData = function () {

            $.ajax({
                url: me.proxyURL,
                type: "POST",
                dataType: "xml/html/script/json",
                contentType: "application/json",
                data: JSON.stringify(me.options, null, 2),
                complete: function(data) {
                    var data = JSON.parse(data.responseText),
                        token = data.message;

                    me.getResults(token);
                }
            });

        };

        me.getResults = function getResults(token) {

            var token = token || '',
                resultsUrl = me.dataURL + token;

            $.ajax({
                url: resultsUrl,
                type: "GET",
                dataType: "xml/html/script/json",
                contentType: "application/json",
                complete: function (data) {
                    me.data = JSON.parse(data.responseText);
                    me.onDataReady();
                }
            });

        };

        me.onDataReady = function () {};


        me.parseTpl = function(tpl, data) {

            var repeatRegExp = /(?:{{(\s*#repeat.*?|\s*\/repeat\s*)}})/g,
                repeatMatches = tpl.match(repeatRegExp);

            if (repeatMatches) {
                for (i=0; i<repeatMatches.length; i++) {
                   if (repeatMatches[i].indexOf('#repeat')>-1) {} else {break;}
                }
                regEx = new RegExp('({{\\s*#repeat[\\s\\S]*?){' + (i-1) + '}({{\\s*#repeat[\\s\\S]*?{{\\s*\/repeat\\s*}})');
                repeat = tpl.match(regEx)[2];
                tpl = me.tplRepeat(tpl, data, repeat);
            }

            return tpl.replace(/{{\s*(.*?)\s*}}/g, function (match, key) {
                return key.split('.').reduce(function index(obj,i) {
                    return obj[i] || '';
                }, data) || '';
            });

        };

        me.tplRepeat = function (tpl, data, repeat) {

            var matches, rows, partial,
                detailRegExp = /({{\s*#repeat\s*(.*?)\s*}})([\s\S]*?)({{\s*\/repeat\s*}})/;


            matches = repeat.match(detailRegExp);
            rows = data[matches[2]];
            partial = '';
            if (rows) {
                for (j=0; j < rows.length; j++) {
                    partial += me.parseTpl(matches[3], rows[j]);
                }
            } else {
                if (typeof window.console !== 'undefined')
                    console.error("Data not found for " + matches[1]);
            }
            tpl = tpl.replace(repeat, function (match) {
                return partial;
            });

            return me.parseTpl(tpl, data);
        }


        /*
        12345678.9.format(2, 3, '.', ',');  // "12.345.678,90"
        123456.789.format(4, 4, ' ', ':');  // "12 3456:7890"
        12345678.9.format(0, 3, '-');       // "12-345-679
        */
        me.format = function(number, n, x, s, c) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
                num = number.toFixed(Math.max(0, ~~n));
            return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
        };

        me.render = function () {
            $(me.container).html(me.doneTpl.main);
        }


        me.setPosition = function ($el) {
            $container = $(me.container);

            $('.mw-container').each(function () {
                $(this).hide();
            });

            var top = $el.offset().top + ($el.height() / 2) + me.adjustOffset.top,
                left = $el.offset().left + $el.width() + me.adjustOffset.left;
            me.container.style.top = top + 'px';
            me.container.style.left = left + 'px';

            $container.fadeIn(500, function() {});
            //me.getOnTop($container);
        }


        me.getOnTop = function ($container) {
            var max = 0;
            $('.mw-container').each(function () {
                var z = parseInt( $( this ).css( "z-index" ), 10 );
                max = Math.max( max, z );
            });
            $container.css("z-index", max + 1 );
        };

        //Filters out the items specified by me.excludeList property
        me.excludeItems = function (arr) {
            var newArray = new Array();
            for(var i = 0; i<arr.length; i++){
                if (me.excludeList.indexOf(i) > -1) {
                    continue;
                }
                newArray.push(arr[i]);
            }
            return newArray;
        };;

        $( document ).bind("ready", function() {

            me.container = document.createElement('div');
            me.container.id = me.containerId;
            me.container.className = 'mw-container';
            me.container.style.zIndex = 99999999;
            $('body').append(me.container);

            $container = $(me.container);

            $container.mouseleave(function () {
                $container.fadeOut(500);
            });

            $(me.targetClass + ":first").attr(me.targetAttr, function(el, val) {
                if ((val = parseInt(val)) > 0) {
                    me.options[me.targetPorperty] = val;
                }
            });

            $(me.targetClass).each(function (i) {
                var $el = $(this);
                $el.mouseover(function () {
                    me.displayRec = 3;
                    me.onDataReady();
                    me.setPosition($el);
                })
            });

            me.documentReady();

        });

        me.documentReady = function () {
            me.rootURL ? me.requestData() : me.getResults();
        }
    };

    window.MiniWidget = MiniWidget;

})(window, jQuery);

//--- Polyfill
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback /*, initialValue*/) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        var t = Object(this), len = t.length >>> 0, k = 0, value;
        if (arguments.length == 2) {
            value = arguments[1];
        } else {
            while (k < len && ! k in t) {
                k++;
            }
            if (k >= len) {
                throw new TypeError('Reduce of empty array with no initial value');
            }
            value = t[k++];
        }
        for (; k < len; k++) {
            if (k in t) {
                value = callback(value, t[k], k, t);
            }
        }
        return value;
    };
}




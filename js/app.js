(function () {

    var plwidget = new MiniWidget({targetClass : '.plwidget'});
    plwidget.onDataReady = function () { doPL(plwidget) }

    // With all possible configuration options
    var plwidget2 = new MiniWidget({
        rootURL     : "http://www.ap-northeast-1.api.compareglobal.co.uk",
        proxyPath   : '/v1/money/loan',
        dataPath    : '/v1/result/',
        locale      : "en-HK",
        displayRec  : 6,
        options: {
            locale      : "en-HK",
            loanAmount  : 10000, // <-- This is the targetProperty defined further down
            loanTenure  : 60,
            filter      : "INSTALMENT"
        },
        targetClass    : '.plwidget2',
        langFile       : 'lang/pl_lang.json',
        targetAttr     : 'data',
        targetPorperty : 'loanAmount',
        pathToTemplates: 'tpl/',
        myTemplates    : ['pl_main', 'pl_row'],
        // Adjust widget position based on your design
        adjustOffset   : {
            top: -58,
            left: 22
        }
    });

    plwidget2.onDataReady = function () { doPL(plwidget2) }

    function doPL(widget) {

        var localized = widget.lang[widget.locale],
            o = widget.options;

        // Parse the title
        var title = widget.parseTpl(localized.loan_term, {
            totalRepayment  : widget.format(o.loanAmount, 0, 3, ',', '.'),
            currency        : localized.currency,
            tenureInYears   : parseInt(o.loanTenure / 12)
        });

        //console.log(widget.data[0]);

        var data = widget.data,
            parsed = widget.doneTpl,
            row = {};


        widget.displayRec = (widget.displayRec > data.length)? data.length : widget.displayRec;

        // Parse the rows template
        parsed.rows = '';
        for (var i = 0; i < widget.displayRec; i++) {
            row = data[i].mortgage;
            parsed.rows += widget.parseTpl(widget.templates.pl_row, {
                company                 : (i + 1 + '. ') + data[i].company.name,
                currency                : localized.currency,
                short_month             : localized.short_month,
                monthlyPayment          : widget.format(row.monthlyPayment, 0, 3, ',', '.'),
                monthlyInterestRate     : row.monthlyInterestRate,
                get_offer               : localized.get_offer
            });
        }

        // Parse the main template and include the parsed.rows
        parsed.main = widget.parseTpl(widget.templates.pl_main, {
            title           : title,
            starting_from   : localized.starting_from,
            rates_from      : localized.rates_from,
            rows            : parsed.rows,
            more_options    : localized.more_options
        });

        widget.render();

        // Add behaviour for "More Options" button
        $('#more_options', widget.container).click(function (e) {
            e.preventDefault();
            widget.displayRec += 2;
            widget.onDataReady();
        });
    };
})();

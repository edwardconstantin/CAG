(function () {

    //--- This is an example using old data structure

    var plwidget = new MiniWidget({
        dataPath    : '/tmp/oldservice.json',
        targetClass : '.plwidget',
        myTemplates: ['pl_widget']
    });

    plwidget.onDataReady = function () {

        var localized = plwidget.lang[plwidget.locale],
            o = plwidget.options;

        // Parse the title
        var title = plwidget.parseTpl(localized.loan_term, {
            totalRepayment  : plwidget.format(o.loanAmount, 0, 3, ',', '.'),
            currency        : localized.currency,
            tenureInYears   : parseInt(o.loanTenure / 12)
        });


        var data = plwidget.data.compargoGlobalApiResponse.searchResults.searchResultItems,
            parsed = plwidget.doneTpl,
            row = {},
            rows = [];

        //console.log(data[0]);

        plwidget.displayRec = (plwidget.displayRec >= data.length)? data.length : plwidget.displayRec;

        // Prepare data for #repeat directive
        for (var i = 0; i < plwidget.displayRec; i++) {
            row = data[i],
            row.monthlyPayment = parseInt(row.ydelseOptions.min_ydelse_maned_25000);

            //-- HACK
            if (!row.monthlyPayment) row.monthlyPayment = 500;

            rows.push({
                company                 : (i + 1 + '. ') + data[i].companyName,
                currency                : localized.currency,
                short_month             : localized.short_month,
                monthlyPayment          : plwidget.format(row.monthlyPayment, 0, 3, ',', '.'),
                monthlyInterestRate     : row.lowestMonthlyFlatRate,
                get_offer               : localized.get_offer
            });
        }
        // Parse the main template and include the parsed.rows
        parsed.main = plwidget.parseTpl(plwidget.templates.pl_widget, {
            title           : title,
            starting_from   : localized.starting_from,
            rates_from      : localized.rates_from,
            rows            : rows,
            more_options    : localized.more_options
        });

        plwidget.render();

        // Add behaviour for "More Options" button
        $('#more_options', plwidget.container).click(function (e) {
            e.preventDefault();
            plwidget.displayRec += 2;
            plwidget.onDataReady();
        });

    }


    //--- This is an example using new data structure

    // An instance with all possible configuration options
    var mywidget = new MiniWidget({
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
        myTemplates: ['pl_widget'],
        // Adjust widget position based on your design
        adjustOffset   : {
            top: -58,
            left: 22
        }
    });

    mywidget.onDataReady = function () {

        var localized = mywidget.lang[mywidget.locale],
            o = mywidget.options;

        // Parse the title
        var title = mywidget.parseTpl(localized.loan_term, {
            totalRepayment  : mywidget.format(o.loanAmount, 0, 3, ',', '.'),
            currency        : localized.currency,
            tenureInYears   : parseInt(o.loanTenure / 12)
        });

        //console.log(mywidget.data[0]);

        var data = mywidget.data,
            parsed = mywidget.doneTpl,
            row = {},
            rows = [];

        mywidget.displayRec = (mywidget.displayRec >= data.length)? data.length : mywidget.displayRec;

        // Prepare data for #repeat directive
        for (var i = 0; i < mywidget.displayRec; i++) {
            row = data[i].mortgage;
            rows.push({
                company                 : (i + 1 + '. ') + data[i].company.name,
                currency                : localized.currency,
                short_month             : localized.short_month,
                monthlyPayment          : mywidget.format(row.monthlyPayment, 0, 3, ',', '.'),
                monthlyInterestRate     : row.monthlyInterestRate,
                get_offer               : localized.get_offer
            });
        }
        // Parse the main template and include the parsed.rows
        parsed.main = mywidget.parseTpl(mywidget.templates.pl_widget, {
            title           : title,
            starting_from   : localized.starting_from,
            rates_from      : localized.rates_from,
            rows            : rows,
            more_options    : localized.more_options
        });

        mywidget.render();

        // Add behaviour for "More Options" button
        $('#more_options', mywidget.container).click(function (e) {
            e.preventDefault();
            mywidget.displayRec += 2;
            mywidget.onDataReady();
        });

    }

})();

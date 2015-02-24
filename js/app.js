(function () {

    //--- This is an example using old data structure

    var plwidget = new MiniWidget({
        dataPath    : 'tmp/oldservice.json',
        targetClass : '.plwidgetOld',
        myTemplates: ['pl_widget']
    });

    plwidget.onDataReady = function () {

        var localized = plwidget.lang[plwidget.locale],
            opt = plwidget.options;

        // Parse the title
        var title = plwidget.parseTpl(localized.loan_term, {
            totalRepayment  : plwidget.format(opt.loanAmount, 0, 3, ',', '.'),
            currency        : localized.currency,
            tenureInYears   : parseInt(opt.loanTenure / 12)
        });


        var data = plwidget.data.compargoGlobalApiResponse.searchResults.searchResultItems,
            parsed = plwidget.doneTpl,
            row = {},
            rows = [];

        //console.log(data[0]);
        data = mywidget.excludeItems(data);

        $(plwidget.targetClass).text('Fra ' + mywidget.format(parseInt(data[0].ydelseOptions.min_ydelse_maned_25000), 0, 3, ',', '.') + ' kr. pr/md.');

        plwidget.displayRec = (plwidget.displayRec >= data.length)? data.length : plwidget.displayRec;

        // Prepare data for #repeat directive
        for (var i = 0; i < plwidget.displayRec; i++) {
            row = data[i],
            row.monthlyPayment = parseInt(row.ydelseOptions.min_ydelse_maned_25000);

            //-- HACK, data missing?
            if (!row.monthlyPayment) row.monthlyPayment = 500;

            rows.push({
                id: (i + 1 + '.'),
                company: {
                    name: data[i].companyName,
                    logo: data[i].logo
                },
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
            window.location = "http://www.samlino.dk/forbrugslaan?amount=250000&tenure=60";
        });

    }


    //--- This is an example using new data structure

    // An instance with all possible configuration options
    var mywidget = new MiniWidget({
        rootURL     : "http://www.ap-northeast-1.api.compareglobal.co.uk",
        proxyPath   : '/v1/money/loan',
        dataPath    : '/v1/result/',
        locale      : "en-HK",
        displayRec  : 3,
        locale      : "da-DK",
        options: {
            locale      : "en-HK",
            loanAmount  : 10000, // <-- This is the targetProperty defined further down
            loanTenure  : 60,
            filter      : "INSTALMENT"
        },
        targetClass    : '.plwidgetNew',
        langFile       : 'lang/pl_lang.json',
        targetAttr     : 'data',
        targetPorperty : 'loanAmount',
        pathToTemplates: 'tpl/',
        myTemplates: ['pl_widget'],
        excludeList: [2, 3, 4, 5, 6],
        // Adjust widget position based on your design
        adjustOffset   : {
            top: -58,
            left: 22
        }
    });

    mywidget.onDataReady = function () {

        var localized = mywidget.lang[mywidget.locale],
            opt = mywidget.options;

        // Parse the title
        var title = mywidget.parseTpl(localized.loan_term, {
            totalRepayment  : mywidget.format(opt.loanAmount, 0, 3, ',', '.'),
            currency        : localized.currency,
            tenureInYears   : parseInt(opt.loanTenure / 12)
        });

        console.log(mywidget.data[0]);

        var data = mywidget.data,
            parsed = mywidget.doneTpl,
            row = {},
            rows = [];

        data = mywidget.excludeItems(data);

        $(mywidget.targetClass).text('Fra ' + mywidget.format(data[0].mortgage.monthlyPayment, 0, 3, ',', '.') + ' kr. pr/md.');

        mywidget.displayRec = (mywidget.displayRec >= data.length)? data.length : mywidget.displayRec;

        // Prepare data for #repeat directive
        for (var i = 0; i < mywidget.displayRec; i++) {
            row = data[i].mortgage;
            rows.push({
                id: (i + 1 + '.'),
                company: {
                    name: data[i].company.name
                },
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

(function () {

    //--- This is an example using old data structure
/*
    var car_widget = new MiniWidget({
        legacyMode  : true,
        dataPath    : 'tmp/oldservice.json',
        targetClass : '.plwidgetA',
        myTemplates: ['pl_widget'],
        applyBtnOnly : false,
        displayRec  : 3,
        targetProperty: 'loanAmnt',
        options: {
            //loanAmnt: 250000,
            tenureAmnt: 60
        }
    });

    car_widget.controller = function () {widgetProcess(car_widget)};
    window.car_widget = car_widget;
*/
    var watch_widget = new MiniWidget({
        legacyMode  : true,
        dataPath    : 'tmp/oldservice.json',
        targetClass : '.plwidgetB',
        applyBtnOnly : false,
        displayRec  : 3,
        excludeList : [],
        myTemplates: ['pl_widget'],
        targetProperty: 'loanAmnt',
        options: {
            //loanAmnt: 18000,
            tenureAmnt: 60
        }
    });

    watch_widget.controller = function () {widgetProcess(watch_widget)};
    window.watch_widget = watch_widget;

    var widgetProcess = function (plwidget) {

        var localized = plwidget.lang[plwidget.locale],
            opt = plwidget.options;

        // Parse the title
        var title = plwidget.parseTpl(localized.loan_term, {
            loanAmount  : plwidget.format(opt.loanAmnt, 0, 3, ',', '.'),
            currency        : localized.currency,
            tenureInYears   : parseInt(opt.tenureAmnt / 12)
        });


        var data = plwidget.data,
            parsed = plwidget.doneTpl,
            row = {},
            rows = [];

        console.log(data[0]);

        $(plwidget.targetClass).text('Fra ' + plwidget.format(parseInt(data[0].computedMrpyment.lowest), 0, 3, ',', '.') + ' kr. pr/md.');

        plwidget.displayRec = (plwidget.displayRec >= data.length)? data.length : plwidget.displayRec;

        // Prepare data for #repeat directive
        for (var i = 0; i < plwidget.displayRec; i++) {
            row = data[i];

            rows.push({
                id: (i + 1 + '.'),
                company: {
                    name: data[i].companyName,
                    logo: data[i].logo
                },
                dataid                  : row.id,
                featured                : row.featured_onlineBanks,
                applyButton             : row.applyButton,
                currency                : localized.currency,
                short_month             : localized.short_month,
                monthlyPayment          : plwidget.format(row.computedMrpyment.lowest, 0, 3, ',', '.'),
                monthlyInterestRate     : plwidget.format(row.computedLapr.lowest, 2, 3, ',', '.'),
                get_offer               : localized.get_offer,
                link                    : row.link
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
            window.location = "http://www.samlino.dk/forbrugslaan?amount=" + plwidget.options.loanAmnt + "&tenure=" + plwidget.options.tenureAmnt;
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
        targetProperty : 'loanAmount',
        pathToTemplates: 'tpl/',
        myTemplates: ['pl_widget'],
        excludeList: [2, 3, 4, 5, 6],
        // Adjust widget position based on your design
        adjustOffset   : {
            top: -58,
            left: 22
        }
    });

    mywidget.controller = function () {

        var localized = mywidget.lang[mywidget.locale],
            opt = mywidget.options;

        // Parse the title
        var title = mywidget.parseTpl(localized.loan_term, {
            loanAmount      : mywidget.format(opt.loanAmount, 0, 3, ',', '.'),
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
                dataid                  : row.id,
                link                    : '#',
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
            mywidget.controller();
        });

    }

})();

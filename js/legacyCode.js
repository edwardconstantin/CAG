 (function () {

     var optimizeCb = function (func, context, argCount) {
         if (context === void 0) return func;
         switch (argCount == null ? 3 : argCount) {
         case 1:
             return function (value) {
                 return func.call(context, value);
             };
         case 2:
             return function (value, other) {
                 return func.call(context, value, other);
             };
         case 3:
             return function (value, index, collection) {
                 return func.call(context, value, index, collection);
             };
         case 4:
             return function (accumulator, value, index, collection) {
                 return func.call(context, accumulator, value, index, collection);
             };
         }
         return function () {
             return func.apply(context, arguments);
         };
     };

     var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
     var isArrayLike = function (collection) {
         var length = collection && collection.length;
         return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
     };

     _ = {};

     _.each = _.forEach = function (obj, iteratee, context) {
         iteratee = optimizeCb(iteratee, context);
         var i, length;
         if (isArrayLike(obj)) {
             for (i = 0, length = obj.length; i < length; i++) {
                 iteratee(obj[i], i, obj);
             }
         } else {
             var keys = _.keys(obj);
             for (i = 0, length = keys.length; i < length; i++) {
                 iteratee(obj[keys[i]], keys[i], obj);
             }
         }
         return obj;
     };


     var cagHelper = {
         isNotEmpty: function (v, param) {
             var param = param || null;
             var v = $.trim(v);
             switch (param) {
             case 'zero':
                 return v != null && v != "N/A" && v != "" && v != "No" && v != "undefined" && v != "NaN" && v != "NA" && v != " " && v != "n/a" && v != "false" && v != "FALSE" && v != "NULL" && v != "null";
                 break;
             default:
                 return v != null && v != "N/A" && v != "" && v != "No" && v != 0 && v != "undefined" && v != "NaN" && v != "NA" && v != " " && v != "n/a" && v != "false" && v != "FALSE" && v != "NULL" && v != "null";
             }
         }
     }

     function RATE(paymentsPerYear, paymentAmount, presentValue, futureValue, dueEndOrBeginning, interest) {
         if (interest == null) {
             interest = 0.01;
         }
         if (futureValue == null) {
             futureValue = 0;
         }
         if (dueEndOrBeginning == null) {
             dueEndOrBeginning = 0;
         }
         var FINANCIAL_MAX_ITERATIONS = 128;
         var FINANCIAL_PRECISION = 0.0000001;
         var y, y0, y1, x0, x1 = 0,
             f = 0,
             i = 0;
         var rate = interest;
         if (Math.abs(rate) < FINANCIAL_PRECISION) {
             y = (presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue);
         } else {
             f = Math.exp((paymentsPerYear * Math.log(1 + rate)));
             y = (presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue);
         }
         y0 = (presentValue + paymentAmount * paymentsPerYear + futureValue);
         y1 = (presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue);
         i = x0 = 0.0;
         x1 = rate;
         while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION) && (i < FINANCIAL_MAX_ITERATIONS)) {
             rate = (y1 * x0 - y0 * x1) / (y1 - y0);
             x0 = x1;
             x1 = rate;
             if (Math.abs(rate) < FINANCIAL_PRECISION) {
                 y = (presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue);
             } else {
                 f = Math.exp((paymentsPerYear * Math.log(1 + rate)));
                 y = (presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue);
             }
             y0 = y1;
             y1 = y;
             ++i;
         }
         return rate;
     }

     function PMT(i, n, p) {
         return (i * p * Math.pow((1 + i), n) / (1 - Math.pow((1 + i), n)));
     }

     return _CAG = {

         formatData: function (data, FormFilter) {
             var self = this;
             // Add each record to the Scule collection for querying
             _.each(data, function (row, i) {
                 row.minLoanAmount = row.loanAmount.minLoanAmount;
                 row.maxLoanAmount = row.loanAmount.maxLoanAmount;

                 row.minLoanTenure = row.loanTenure.minLoanTenure;
                 row.maxLoanTenure = row.loanTenure.maxLoanTenure;

                 if (!cagHelper.isNotEmpty(row.highestMonthlyFlatRate)) {
                     row.highestMonthlyFlatRate = 0;
                 }

                 row.computedMrpyment = self.monthlyRepayment(row.floatingHandlingFee, row.fixedHandlingFee, row.monthlyFee, row.lowestMonthlyFlatRate, row.highestMonthlyFlatRate, FormFilter);
                 if (cagHelper.isNotEmpty(row.computedMrpyment.lowest)) {
                     row.computedMrpymentAverage = row.computedMrpyment.lowest;
                 } else {
                     row.computedMrpymentAverage = 0;
                 }

                 row.computedLapr = self.lowestApr(row.computedMrpyment, FormFilter);
                 if (cagHelper.isNotEmpty(row.computedLapr.lowest)) {
                     row.computedLaprAverage = row.computedLapr.lowest;
                 } else {
                     row.computedLaprAverage = 0;
                 }

                 featured = $.parseJSON(row.featuredOn);
                 row.featured_countryWide = cagHelper.isNotEmpty(featured.dinBank) ? featured.dinBank : null;
                 row.featured_onlineBanks = cagHelper.isNotEmpty(featured.onlineLaan) ? featured.onlineLaan : null;
                 row.featured_onlineLenders = cagHelper.isNotEmpty(featured.kviklaan) ? featured.kviklaan : null;

                 if (cagHelper.isNotEmpty(row.creditScore)) {
                     // Udr 1|5      // Mid > 1     // Ovr > 2
                     var credit_score = parseInt(row.creditScore);
                     row.creditScoreUnder = (credit_score === 1 || credit_score === 5) ? true : false;
                     row.creditScoreMiddle = (credit_score > 1) ? true : false;
                     row.creditScoreOver = (credit_score > 2) ? true : false;
                 }

                 //row._data.showApplyBtn = cagHelper.isNotEmpty(row.hasApplyBtn) ? true : null;

             });
             return data;
         },

         lowestApr: function (data, FormFilter) {
             var final_apr = {};
             var lowest_repayment = parseFloat(data.lowest);
             var highest_rpayment = parseFloat(data.highest);

             if (cagHelper.isNotEmpty(lowest_repayment)) {
                 final_apr.lowest = (Math.pow(1 + (RATE(parseFloat(FormFilter.data.tenureAmnt), lowest_repayment, -parseFloat(FormFilter.data.loanAmnt))), 12) - 1) * 100;
             } else {
                 final_apr.lowest = 0;
             }

             if (cagHelper.isNotEmpty(highest_rpayment)) {
                 final_apr.highest = (Math.pow(1 + (RATE(parseFloat(FormFilter.data.tenureAmnt), highest_rpayment, -parseFloat(FormFilter.data.loanAmnt))), 12) - 1) * 100;
             } else {
                 final_apr.highest = 0;
             }
             return final_apr;
         },

         monthlyRepayment: function (floatingHandlingFee, fixedHandlingFee, monthlyFee, lowestMonthlyFlatRate, highestMonthlyFlatRate, FormFilter) {
             var final_mrpyment = {};

             floatingHandlingFee = cagHelper.isNotEmpty(floatingHandlingFee) ? parseFloat(floatingHandlingFee.replace(',', '.')) : 0;
             fixedHandlingFee = cagHelper.isNotEmpty(fixedHandlingFee) ? parseFloat(fixedHandlingFee.replace(',', '.')) : 0;
             monthlyFee = cagHelper.isNotEmpty(monthlyFee) ? parseFloat(monthlyFee.replace(',', '.')) : 0;

             lowestMonthlyFlatRate = parseFloat(lowestMonthlyFlatRate / 100);
             highestMonthlyFlatRate = parseFloat(highestMonthlyFlatRate / 100);

             if (floatingHandlingFee > 0 && fixedHandlingFee === 0 && monthlyFee === 0) {
                 final_mrpyment.lowest = -PMT(parseFloat(Math.pow((1 + lowestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (floatingHandlingFee / 100 * parseFloat(FormFilter.data.loanAmnt))));
                 final_mrpyment.highest = -PMT(parseFloat(Math.pow((1 + highestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (floatingHandlingFee / 100 * parseFloat(FormFilter.data.loanAmnt))));
             } else if (floatingHandlingFee === 0 && fixedHandlingFee > 0 && monthlyFee === 0) {
                 final_mrpyment.lowest = -PMT(parseFloat(Math.pow((1 + lowestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + fixedHandlingFee));
                 final_mrpyment.highest = -PMT(parseFloat(Math.pow((1 + highestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + fixedHandlingFee));
             } else if (floatingHandlingFee === 0 && fixedHandlingFee === 0 && monthlyFee > 0) {
                 final_mrpyment.lowest = -PMT(parseFloat(Math.pow((1 + lowestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (monthlyFee * parseFloat(FormFilter.data.tenureAmnt))));
                 final_mrpyment.highest = -PMT(parseFloat(Math.pow((1 + highestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (monthlyFee * parseFloat(FormFilter.data.tenureAmnt))));
             } else if (floatingHandlingFee > 0 && fixedHandlingFee > 0 && monthlyFee === 0) {
                 final_mrpyment.lowest = -PMT(parseFloat(Math.pow((1 + lowestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (floatingHandlingFee / 100 * parseFloat(FormFilter.data.loanAmnt)) + fixedHandlingFee));
                 final_mrpyment.highest = -PMT(parseFloat(Math.pow((1 + highestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (floatingHandlingFee / 100 * parseFloat(FormFilter.data.loanAmnt)) + fixedHandlingFee));
             } else if (floatingHandlingFee > 0 && fixedHandlingFee === 0 && monthlyFee > 0) {
                 final_mrpyment.lowest = -PMT(parseFloat(Math.pow((1 + lowestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (floatingHandlingFee / 100 * parseFloat(FormFilter.data.loanAmnt)) + (monthlyFee * parseFloat(FormFilter.data.tenureAmnt))));
                 final_mrpyment.highest = -PMT(parseFloat(Math.pow((1 + highestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + (floatingHandlingFee / 100 * parseFloat(FormFilter.data.loanAmnt)) + (monthlyFee * parseFloat(FormFilter.data.tenureAmnt))));
             } else if (floatingHandlingFee = 0 && fixedHandlingFee > 0 && monthlyFee > 0) {
                 final_mrpyment.lowest = -PMT(parseFloat(Math.pow((1 + lowestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + fixedHandlingFee + (monthlyFee * parseFloat(FormFilter.data.tenureAmnt))));
                 final_mrpyment.highest = -PMT(parseFloat(Math.pow((1 + highestMonthlyFlatRate), (1 / 12)) - 1), parseFloat(FormFilter.data.tenureAmnt), parseFloat(parseFloat(FormFilter.data.loanAmnt) + fixedHandlingFee + (monthlyFee * parseFloat(FormFilter.data.tenureAmnt))));
             }
             return final_mrpyment;
         }
     }

 })();


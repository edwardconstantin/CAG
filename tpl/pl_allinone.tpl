<div  id="pl-dialog" class="pl-widget">
    <div class="pl-title">{{title}}</div>
    <div class="pl-table">
        <table>
            <tr>
                <th></th>
                <th>{{starting_from}}</th>
                <th>{{rates_from}}</th>
                <th></th>
            </tr>
            {{#repeat rows}}
            <tr>
                <td>{{company}}</td>
                <td class="pl-blue">{{currency}} {{monthlyPayment}} / {{short_month}}</td>
                <td class="pl-blue">{{monthlyInterestRate}}%</td>
                <td><a class="pl-yellow-button" href="#">{{get_offer}}</a></div></td>
            </tr>
            <tr>
                <td colspan="4"><div class="pl-hr"></div></td>
            </tr>
            {{/repeat}}
        </table>
    </div>
    <div class="pl-footer">
        <a id="more_options" class="pl-yellow-button" href="#">{{more_options}}</a>
        <div class="pl-powered-by">Powered by:<br />
            <img src="http://d20kivgoyj2lem.cloudfront.net/assets/img/logo.png" width="70" />
        </div>
    </div>
</div>

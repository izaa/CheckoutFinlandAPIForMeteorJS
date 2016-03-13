# CheckoutFinlandAPIForMeteorJS
Checkout Finland's Payment API Client for MeteorJS

#Requirements

Following packages are needed 
jparker:crypto-md5
http
jparker:crypto-hmac
jparker:crypto-sha256

The response content is an xml data, so if you want to parse that data somehow, you could use xml2js-package i.e.

#Usage

Following example uses xml2js to parse response data and MomentJS to handle date.

peerlibrary:xml2js
mrt:moment

Helper

Template.checkoutView.onCreated(function() {
    Meteor.call('getPaymentMethods', function(e, r) {
        if (!e) {
            var pms = [];
            for (var bank in r) {
                var obj = {};
                for (var i in r[bank][0]) {
                    if (i === '$') {
                        obj.url = r[bank][0][i].url;
                        obj.icon = r[bank][0][i].icon;
                        obj.name = r[bank][0][i].name;
                    } else {
                        obj.fields = obj.fields ? obj.fields : [];
                        obj.fields.push({field: i, value: r[bank][0][i][0]});
                    }
                }

                pms.push(obj);
            }

            Session.set('paymentMethods', pms);
        } else {
            console.log(e);
        }
    })

});


Method
if (Meteor.isServer) {
    Meteor.methods({
        getPaymentMethods: function() {
            this.unblock();

            var result;

            var _checkoutFinland = new CheckoutFinland(MECHANTCODE, PASSWORD);
            var totalAmount = 10000;
            var stamp = new Date().getTime();

            var coData = {
                stamp: stamp, // unique timestamp
                reference: '12344',
                message: 'Message',
                return: 'https://' + this.connection.httpHeaders.host + '/checkout/return',
                cancel: 'https://' + this.connection.httpHeaders.host + '/checkout/cancel',
                amount: totalAmount, // price in cents
                delivery_date: moment(new Date()).format('YYYYMMDD'),
                firstname: 'optional firstname',
                familyname: 'optional lastname,
                address: 'optional address',
                postcode: 'optional postcode',
                postoffice: 'optinal postoffice',
                email: 'optional@email.fi',
                phone: '0800-OPTIONAL'
            }
            
            try {
                result = _checkoutFinland.getCheckoutXML(coData);
            } catch (error) {
                throw new Meteor.Error(403, 'Error in Checkout Finland API: ' + error);
            }

            if (!result || !result.content) {
                throw new Meteor.Error(403, 'Error in Checkout Finland API: ' + result);
            }

            var parser = new xml2js.Parser();

            var xmlParseSync = Meteor.wrapAsync(parser.parseString, this);

            result = xmlParseSync(result.content);

            if (result.trade &&
                    result.trade.payments &&
                    result.trade.payments.length &&
                    result.trade.payments[0].payment &&
                    result.trade.payments[0].payment.length &&
                    result.trade.payments[0].payment[0].banks &&
                    result.trade.payments[0].payment[0].banks.length
                    ) {
                result = result.trade.payments[0].payment[0].banks[0];

            } else {
                throw new Meteor.Error(403, 'Error in Checkout Finland API: No payment methods found');
            }
            
            return result;
        }
    });
}

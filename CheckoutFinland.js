CheckoutFinland = function(merchant, password) {
    this.settings = {
        payment_url: 'https://payment.checkout.fi',
        password: password,
        merchant: merchant,
        version: "0001",
        language: "FI",
        country: "FIN",
        currency: "EUR",
        device: "1",
        content: "1",
        type: "0",
        algorithm: "3",
        stamp: 0,
        amount: 0,
        reference: "",
        message: "",
        return: "",
        cancel: "",
        reject: "",
        delayed: "",
        delivery_date: "",
        firstname: "",
        familyname: "",
        address: "",
        postcode: "",
        postoffice: "",
        status: "",
        email: ""
    }

    this.calcMac = function() {
        //CryptoJS.MD5('Message').toString()
        var arr = [];
        arr.push(this.settings.version);
        arr.push(this.settings.stamp);
        arr.push(this.settings.amount);
        arr.push(this.settings.reference);
        arr.push(this.settings.message);
        arr.push(this.settings.language);
        arr.push(this.settings.merchant);
        arr.push(this.settings.return);
        arr.push(this.settings.cancel);
        arr.push(this.settings.reject);
        arr.push(this.settings.delayed);
        arr.push(this.settings.country);
        arr.push(this.settings.currency);
        arr.push(this.settings.device);
        arr.push(this.settings.content);
        arr.push(this.settings.type);
        arr.push(this.settings.algorithm);
        arr.push(this.settings.delivery_date);
        arr.push(this.settings.firstname);
        arr.push(this.settings.familyname);
        arr.push(this.settings.address);
        arr.push(this.settings.postcode);
        arr.push(this.settings.postoffice);
        arr.push(this.settings.password);

        return CryptoJS.MD5(arr.join('+')).toString().toUpperCase();
    }

    this.getCheckoutObject = function(data) {
        for (var a in data) {
            this.settings[a] = data[a];
        }

        // tehdään post-vars
        var post = {
            VERSION: this.settings.version,
            STAMP: this.settings.stamp,
            AMOUNT: this.settings.amount,
            REFERENCE: this.settings.reference,
            MESSAGE: this.settings.message,
            LANGUAGE: this.settings.language,
            MERCHANT: this.settings.merchant,
            RETURN: this.settings.return,
            CANCEL: this.settings.cancel,
            REJECT: this.settings.reject,
            DELAYED: this.settings.delayed,
            COUNTRY: this.settings.country,
            CURRENCY: this.settings.currency,
            DEVICE: this.settings.device,
            CONTENT: this.settings.content,
            TYPE: this.settings.type,
            ALGORITHM: this.settings.algorithm,
            DELIVERY_DATE: this.settings.delivery_date,
            FIRSTNAME: this.settings.firstname,
            FAMILYNAME: this.settings.familyname,
            ADDRESS: this.settings.address,
            POSTCODE: this.settings.postcode,
            POSTOFFICE: this.settings.postoffice,
            MAC: this.calcMac(),
            EMAIL: this.settings.email,
            PHONE: this.settings.phone
        }

        return post;

    }

    this.getCheckoutXML = function(data) {
        this.settings.device = "10";
        return this.sendPost(this.getCheckoutObject(data));
    }

    this.sendPost = function(post) {
        return HTTP.call('POST', this.settings.payment_url, {
            params: post
        });
    }

    this.validateCheckout = function(data) {
        var arr = [];
        arr.push(data.VERSION);
        arr.push(data.STAMP);
        arr.push(data.REFERENCE);
        arr.push(data.PAYMENT);
        arr.push(data.STATUS);
        arr.push(data.ALGORITHM);
        var generatedMac = CryptoJS.HmacSHA256(arr.join('&'), this.settings.password).toString().toUpperCase();

        return data.MAC === generatedMac;
    }

    this.isPaid = function(status) {
        return array(2, 4, 5, 6, 7, 8, 9, 10).indexOf(status) > -1;
    }

};
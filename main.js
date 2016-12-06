'use strict';

const testString = `<!--[if lte IE 8]>
    <script charset='utf-8' type='text/javascript' src='//js.hsforms.net/forms/v2-legacy.js'></script>
<![endif]-->
<script charset='utf-8' type='text/javascript' src='//js.hsforms.net/forms/v2.js'></script>
<script>
    hbspt.forms.create({ 
        portalId: '2398438',
        formId:'fcd49bc5-a6ca-434c-959a-6b6f27f6fffa'
    });
</script>`;

const ui = {};
const requests = {
    hs_initiation: {
        url: 'https://app.hubspot.com/oauth/authorize',
        method: 'GET',
        params: {
            client_id: 'da69405b-6aa2-4682-a11d-6da52726464e',
            redirect_uri: 'https://hyurumi.github.io/chatform/',
            scope: 'contacts'
        }
    },
    hs_get_access: {
        url: 'https://api.hubapi.com/oauth/v1/token',
        method: 'POST',
        params: {
            grant_type: 'authorization_code',
            client_id: 'da69405b-6aa2-4682-a11d-6da52726464e',
            client_secret: '5317c5df-1e54-468d-8b49-043b352726fc',
            redirect_uri: 'https://hyurumi.github.io/chatform/',
        }
    },
    hs_get_all_forms: {
        url: 'https://api.hubapi.com/forms/v2/forms',
        method: 'GET',
        params: {
            grant_type: 'authorization_code',
            client_id: 'da69405b-6aa2-4682-a11d-6da52726464e',
            client_secret: '5317c5df-1e54-468d-8b49-043b352726fc',
            redirect_uri: 'https://hyurumi.github.io/chatform/',
        }
    }
};
const auth = '';

document.addEventListener('DOMContentLoaded', function (event) {

    /** setup ui */
    ui.requestAccessButton = document.querySelector('#request_button');
    ui.copyTextarea = document.querySelector('textarea');
    ui.block = {
        one: document.querySelector('#block1'),
        two: document.querySelector('#block2'),
        three: document.querySelector('#block3')
    }
    ui.separator = {
        onetwo: document.querySelector('#separator12'),
        twothree: document.querySelector('#separator23'),
    }

    ui.copyTextarea.innerHTML = testString;
    ui.requestAccessButton.addEventListener('click', requestPermission);

    if (getQuery().code != undefined ) {
        requests.hs_get_access.params.code = getQuery.code;
        requestAccessToken(fetchAllForms);
    }
});

const requestPermission = function () {
    var url = requests.hs_initiation.url + '?';
    for (name in requests.hs_initiation.params) {
        url = url + '&' + name + '=' + encodeURI(requests.hs_initiation.params[name]);
    }
    window.location.href = url;
};

const requestAccessToken = function (callback) {
    /** 
     * Response Data
     * {
     *  'access_token': 'CO2lrfuMKxICAQMY5rGSASC-zrwBKPypAjIZAEL7khO-MKSGbUiPJ0eyYLZR0dQyOGWUPg',
     *  'refresh_token': '46379d7e-04a1-43f5-962a-07edd8dd165c',
     *  'expires_in': 21600
     * }
     */
    sendData(requests.hs_get_access, function (json) {
        auth = json.access_token;
        callback();
    });
};

const fetchAllForms = function() {
    sendData(requests.hs_get_all_forms, function (forms){
        insertForms(forms);
        show2();
    });
}

const show2 = function () {
    ui.block.two.addClass('show');
    ui.separator.onetwo.addClass('show');
};

const show3 = function () {
    ui.block.three.addClass('show');
    ui.separator.twothree.addClass('show');
};

/**
 * @param {Object} forms 
 */
const insertForms = function (forms) {
    for (var form of forms) {
        var formTableRow = document.createElement('tr');
        var name = '<td>' + form.name + '</td>';
        var createdAt = '<td>' + moment(form.createdAt)+ '</td>';
        var items = '';
        for (var fieldGroup of form.formFieldGroups) {
            for (var field of fieldGroup.fields) {
                items = items + ',' + field.label;
            }
        }
        item = '<td>' + item.substr(1) + '</td>';
        button = '<button id="hoge">✓</button>'
        formTableRow.innerHTML = name + createdAt + items + button;
    }
};

/**
 * @param {Object} request 
 * @param {function} successCallback
 * @param {function} failureCallback
 */
const sendData = function (request, successCallback, failureCallback) {
    var FD = new FormData();
    var fetchingInit = {};

    if (request.method === 'GET') {
        fetchingInit.url = request.url + '?';
        for (name in request.params) {
            fetchingInit.url = fetchingInit.url + '&' + name + '=' + request.params[name];
        }
    }else {
        fetchingInit.url = request.url;
        for (name in request.params) {
            FD.append(name, request.params[name]);
        }
        fetchingInit.body = FD;
    }   

    if (auth !== '') {
        fetchingInit.headers = {'Authorization': 'Bearer: ' + auth};
    }
    
    fetchingInit.method = request.method;

    fetch(request.url, fetchingInit).then(function (response) {
            return response.json();
        }).then(successCallback);
}

/**
 * @return {Object}
 */
const getQuery = function () {
    var arg = {};
    var pairs = location.search.substring(1).split('&');
    for (var pair of pairs) {
        var kv = decodeURIComponent(pair.split('='));
        arg[kv[0]] = kv[1];
    }
    return arg;
};
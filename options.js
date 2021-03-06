var bg = chrome.extension.getBackgroundPage(), t_vali, owa_OK = false;
bg.tclear(bg.loT);

const _L_opt_valimsg_username_1 = _LOCALE('opt_valimsg_username_1');
const _L_opt_valimsg_owaHome_1 = _LOCALE('opt_valimsg_owaHome_1');
const _L_opt_valimsg_owaHome_2 = _LOCALE('opt_valimsg_owaHome_2');
const _L_opt_valimsg_owaHome_3 = _LOCALE('opt_valimsg_owaHome_3');
const _L_opt_valimsg_owaHome_4 = _LOCALE('opt_valimsg_owaHome_4');

function loadOptions() {
    // Initialize the option controls.
    options.doNotify.checked = parse(localStorage.doNotify);
    if (options.doNum) options.doNum.checked = parse(localStorage.doNum);
    options.doNotifyLogin.checked = parse(localStorage.doNotifyLogin);
    options.frequency.value = parseInt(localStorage.frequency);
    options.notifyTime.value = parseInt(localStorage.notifyTime);
    options.previewNum.value = parseInt(localStorage.previewNum);
    options.username.value = localStorage.username || '';
    options.password.value = localStorage.password || '';
    options.owaHome.value = localStorage.owaHome || '';

    if (window.location.search.indexOf('focus=') >= 0) {
        var focusId = window.location.search.split('focus=')[1];
        $('#' + focusId).focus();
    }

    validate(true);

    if (!options.doNotify.checked) { ghost(false); }
    localStorage.popLogin = true;
}

function updateOptions() {
    var owaHomePrev = localStorage.owaHome,
    usernamePrev = localStorage.username,
    passwordPrev = localStorage.password;

    var valNames = [
        'notifyTime',
        'previewNum',
        'username',
        'password',
        'owaHome',
        'frequency'
    ], checkNames = [
        'doNotify',
        'doNum',
        'doNotifyLogin'
    ];

    valNames.forEach(function(name) {
        localStorage[name] = options[name].value;
    });

    checkNames.forEach(function(name) {
        localStorage[name] = options[name].checked;
    });

    bg.sessionInfo.frequency = options.frequency.value * 60000;

    //如果API地址有变
    var owaHomeNow = localStorage.owaHome;

    if (owaHomePrev != owaHomeNow) {
        bg.HOME_URL = owaHomeNow;
        if (! bg.sessionInfo.isStarted) {
            bg.start();
            window.close();
            return;
        }
    }

    if (owaHomeNow == '') {
        bg.OCC.setBA('error');
    } else {
        var usernameNow = localStorage.username,
        passwordNow = localStorage.password;
        //如果登录信息有变，重新登录
        if ((usernamePrev != usernameNow || passwordPrev != passwordNow) &&
        usernameNow !== '' && passwordNow !== '') {
            bg.occLoader.login(usernameNow, passwordNow, true, true);
        } else {
            bg.occLoader.auth(true, true, false);
        }
    }

    window.close();
}

function ghost(isActive) {
    if (isActive) {
        $('#sec_notiTime').css('color', '');
    }else {
        $('#sec_notiTime').css('color', '#ccc');
    }
    options.notifyTime.disabled = !isActive; // The control manipulability.
}

var val_owa_prev = localStorage.owaHome;
function validate(doFocus) {
    var inputusr = $('#username'), inputowa = $('#owaHome');
    val_usr = inputusr.val(),
    val_owa = inputowa.val(),
    valimsg_usr = $('#vali_username'),
    valimsg_owa = $('#vali_owaHome');

    //if( val_usr != '' && !val_usr.match(/[\d\w]+\\[\d\w]+/i) ){
    //valimsg_usr.addClass('error').html(_L_opt_valimsg_username_1);
    //if(doFocus) inputusr.focus();
    //return false;
    //}else{
    //valimsg_usr.removeClass('error').html('');
    //}

    if (val_owa == '' || !val_owa.match(/^http(s)?:\/\/.{3,}/i)) {
        valimsg_owa.addClass('error').html(_L_opt_valimsg_owaHome_1);
        if (doFocus) inputowa.focus();
    }else if (val_owa != val_owa_prev) {
        val_owa_prev = val_owa;
        valimsg_owa.removeClass('error').html(_L_opt_valimsg_owaHome_2);

        $.ajax({
            url: val_owa,
            beforeSend: function() {
            },
            complete: function() {
            },
            success: function(res) {
                if (bg.sessionInfo.isLoading) {
                    bg.sessionInfo.isLoading = false;
                    return;
                }
                if (res.indexOf('owa') >= 0) {
                    valimsg_owa.html(_L_opt_valimsg_owaHome_3);
                    owa_OK = true;
                }else {
                    valimsg_owa.addClass('error');
                    if (val_owa.indexOf('https') !== 0) {
                        valimsg_owa.html(_L_opt_valimsg_owaHome_https);
                    } else {
                        valimsg_owa.html(_L_opt_valimsg_owaHome_https);
                    }
                }
            },
            error: function() {
                if (bg.sessionInfo.isLoading) {
                    bg.sessionInfo.isLoading = false;
                    return;
                }
                valimsg_owa.addClass('error');
                if (val_owa.indexOf('https') !== 0) {
                    valimsg_owa.html(_L_opt_valimsg_owaHome_https);
                } else {
                    valimsg_owa.html(_L_opt_valimsg_owaHome_https);
                }
            }
        });
    }else if (val_owa == localStorage.owaHome) {
        owa_OK = true;
    }

    return true;
}

$('body').ready(function() {
    document.title = _LOCALE('extName');

    var template = '<h1><img src="owa-companion-64.png" alt="Email">{extName} {options} </h1><form id="options"><fieldset><legend>{frequency}</legend><label>{opt_frequency_}<select name="frequency">' +/*'<option>0.1</option>'+*/'<option>1</option><option>3</option><option>5</option><option>10</option><option>15</option><option>20</option><option>25</option><option>30</option><option>60</option><option>120</option></select>{_opt_frequency}</label></fieldset><fieldset><legend>{desktopNotify}</legend><label><input type="checkbox" name="doNotify" checked onchange="ghost(this.checked)">{_opt_DoNotify}</label><label id="sec_notiTime">{opt_notifyTime_}<input id="notifyTime" name="notifyTime" type="number" value="6" min="1" max="20" size="1" />{_opt_notifyTime}</label></fieldset><fieldset><legend>{previewBubble}</legend><label>{opt_previewNum_}<input id="previewNum" name="previewNum" type="number" value="7" min="1" max="13" size="1" />{_opt_previewNum}</label><p>{optip_previewNum}</fieldset><fieldset><legend>{notifyLogin}</legend><label><input type="checkbox" name="doNotifyLogin">{_opt_doNotifyLogin}</label><p>{optip_doNotifyLogin}</p></fieldset><fieldset style="width: 94%;"><legend>{autoLogin}</legend><p>{optip_autoLogin}</p><p><label>{opt_username_}<input id="username" name="username" type="text" /></label><span id="vali_username" class="valiMsg">{optip_username}<span></p><div></div><p><label>{opt_password}<input id="password" name="password" type="password" /></label></p></fieldset><fieldset style="width: 94%;"><label><strong>{required}</strong>{opt_owaHome_}<input type="text" id="owaHome" name="owaHome" size="60" /></label><span id="vali_owaHome" class="valiMsg tip">{optip_owaHome}</span></fieldset><hr /><div class="buttons"><button type="submit" id="submit"><span>{ok}</span></button><button type="button" onclick="window.close();"><span>{cancel}</span></button>&nbsp; </div></form><footer>&copy;2010  <a href="https://twitter.com/ktmud" target="_blank" title="My Twitter">ktmud</a> <a href="mailto:jyyjcc@gmail.com" target="_blank" title="{tip_contactMail}">jyyjcc@gmail.com</a></footer>';

    var html = template.replace(/\{(\w*)\}/g, function(holder, val) {
        return _LOCALE(val) || '';
    });

    $('body').html(html);
    //载入选项
    loadOptions();

    $('#options').submit(function(ev) {
        ev.preventDefault();
        if (validate(true) && owa_OK) {
            //更新选项
            updateOptions();
        }
    });

    $('#owaHome').blur(function() {
        validate();
    });
    $('#owaHome').keyup(function() {
        tclear(t_vali);
        t_vali = setTimeout(validate, 2000);
    });

});

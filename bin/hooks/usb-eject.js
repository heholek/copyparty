// see usb-eject.py for usage

function usbclick() {
    QS('#treeul a[href="/usb/"]').click();
}

function eject_cb() {
    var t = this.responseText;
    if (t.indexOf('can be safely unplugged') < 0 && t.indexOf('Device can be removed') < 0)
        return toast.err(30, 'usb eject failed:\n\n' + t);

    toast.ok(5, esc(t.replace(/ - /g, '\n\n')));
    usbclick(); setTimeout(usbclick, 10);
};

function add_eject_2(a) {
    var aw = a.getAttribute('href').split(/\//g);
    if (aw.length != 4 || aw[3])
        return;

    var v = aw[2],
        k = 'umount_' + v;

    qsr('#' + k);
    a.appendChild(mknod('span', k, '⏏'), a);

    var o = ebi(k);
    o.style.cssText = 'position:absolute; right:1em; margin-top:-.2em; font-size:1.3em';
    o.onclick = function (e) {
        ev(e);
        var xhr = new XHR();
        xhr.open('POST', get_evpath(), true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.send('msg=' + uricom_enc(':usb-eject:' + v + ':'));
        xhr.onload = xhr.onerror = eject_cb;
        toast.inf(10, "ejecting " + v + "...");
    };
};

function add_eject() {
    for (var a of QSA('#treeul a[href^="/usb/"]'))
        add_eject_2(a);
};

(function() {
    var f0 = treectl.rendertree;
    treectl.rendertree = function (res, ts, top0, dst, rst) {
        var ret = f0(res, ts, top0, dst, rst);
        add_eject();
        return ret;
    };
})();

setTimeout(add_eject, 50);

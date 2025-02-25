#!/bin/bash
set -e

curl -k https://192.168.123.1:3923/cpp/scripts/pyinstaller/up2k.sh |
tee up2k2.sh | cmp up2k.sh && rm up2k2.sh || {
    [ -s up2k2.sh ] || exit 1
    echo "new up2k script; upgrade y/n:"
    while true; do read -u1 -n1 -r r; [[ $r =~ [yYnN] ]] && break; done
    [[ $r =~ [yY] ]] && mv up2k{2,}.sh && exec ./up2k.sh
}

uname -s | grep -E 'WOW64|NT-10' && echo need win7-32 && exit 1

dl() { curl -fkLO "$1"; }
cd ~/Downloads

dl https://192.168.123.1:3923/cpp/bin/u2c.py
dl https://192.168.123.1:3923/cpp/scripts/pyinstaller/up2k.ico
dl https://192.168.123.1:3923/cpp/scripts/pyinstaller/up2k.rc
dl https://192.168.123.1:3923/cpp/scripts/pyinstaller/up2k.spec

# $LOCALAPPDATA/programs/python/python37-32/python -m pip install --user -U pyinstaller requests

grep -E '^from .ssl_ import' $APPDATA/python/python37/site-packages/urllib3/util/proxy.py && {
    echo golfing
    echo > $APPDATA/python/python37/site-packages/requests/certs.py
    sed -ri 's/^(DEFAULT_CA_BUNDLE_PATH = ).*/\1""/' $APPDATA/python/python37/site-packages/requests/utils.py
    sed -ri '/^import zipfile$/d' $APPDATA/python/python37/site-packages/requests/utils.py             
    sed -ri 's/"idna"//' $APPDATA/python/python37/site-packages/requests/packages.py
    sed -ri 's/import charset_normalizer.*/pass/' $APPDATA/python/python37/site-packages/requests/compat.py
    sed -ri 's/raise.*charset_normalizer.*/pass/' $APPDATA/python/python37/site-packages/requests/__init__.py
    sed -ri 's/import charset_normalizer.*//' $APPDATA/python/python37/site-packages/requests/packages.py
    sed -ri 's/chardet.__name__/"\\roll\\tide"/' $APPDATA/python/python37/site-packages/requests/packages.py
    sed -ri 's/chardet,//' $APPDATA/python/python37/site-packages/requests/models.py
    for n in util/__init__.py connection.py; do awk -i inplace '/^from (\.util)?\.ssl_ /{s=1} !s; /^\)/{s=0}' $APPDATA/python/python37/site-packages/urllib3/$n; done
    sed -ri 's/^from .ssl_ import .*//' $APPDATA/python/python37/site-packages/urllib3/util/proxy.py
    echo golfed
}

sed -ri 's/(add_argument."-t[de]",.*help=")[^"]+/\1not applicable; HTTPS is disabled in this exe/; s/for some reason/in this exe for safety reasons/' u2c.py

read a b _ < <(awk -F\" '/^S_VERSION =/{$0=$2;sub(/\./," ");print}' < u2c.py)
sed -r 's/1,2,3,0/'$a,$b,0,0'/;s/1\.2\.3/'$a.$b.0/ <up2k.rc >up2k.rc2

#python uncomment.py u2c.py
$APPDATA/python/python37/scripts/pyinstaller -y --clean --upx-dir=. up2k.spec

./dist/u2c.exe --version

csum=$(sha512sum <dist/u2c.exe | cut -c-56)

curl -fkT dist/u2c.exe -HPW:wark https://192.168.123.1:3923/ >uplod.log
cat uplod.log

grep -q $csum uplod.log && echo upload OK || {
    echo UPLOAD FAILED
    exit 1
}

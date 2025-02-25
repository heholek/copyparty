#!/bin/bash
echo not a script
exit 1


##
## add index.html banners

find -name index.html | sed -r 's/index.html$//' | while IFS= read -r dir; do f="$dir/.prologue.html"; [ -e "$f" ] || echo '<h1><a href="index.html">open index.html</a></h1>' >"$f"; done


##
## delete all partial uploads
##  (supports linux/macos, probably windows+msys2)

gzip -d < .hist/up2k.snap | jq -r '.[].tnam' | while IFS= read -r f; do rm -f -- "$f"; done
gzip -d < .hist/up2k.snap | jq -r '.[].name' | while IFS= read -r f; do wc -c -- "$f" | grep -qiE '^[^0-9a-z]*0' && rm -f -- "$f"; done


##
## detect partial uploads based on file contents
##  (in case of context loss or old copyparties)

echo; find -type f | while IFS= read -r x; do printf '\033[A\033[36m%s\033[K\033[0m\n' "$x"; tail -c$((1024*1024)) <"$x" | xxd -a | awk 'NR==1&&/^[0: ]+.{16}$/{next} NR==2&&/^\*$/{next} NR==3&&/^[0f]+: [0 ]+65 +.{16}$/{next} {e=1} END {exit e}' || continue; printf '\033[A\033[31msus:\033[33m %s \033[0m\n\n' "$x"; done


##
## sync pics/vids from phone
##  (takes all files named (IMG|PXL|PANORAMA|Screenshot)_20231224_*)

cd /storage/emulated/0/DCIM/Camera
find -mindepth 1 -maxdepth 1 | sort | cut -c3- > ls
url=https://192.168.1.3:3923/rw/pics/Camera/$d/; awk -F_ '!/^[A-Z][A-Za-z]{1,16}_[0-9]{8}[_-]/{next} {d=substr($2,1,6)} !t[d]++{print d}' ls | while read d; do grep -E "^[A-Z][A-Za-z]{1,16}_$d" ls | tr '\n' '\0' | xargs -0 python3 ~/dev/copyparty/bin/u2c.py -td $url --; done


##
## convert symlinks to hardlinks (probably safe, no guarantees)

find -type l | while IFS= read -r lnk; do [ -h "$lnk" ] || { printf 'nonlink: %s\n' "$lnk"; continue; }; dst="$(readlink -f -- "$lnk")"; [ -e "$dst" ] || { printf '???\n%s\n%s\n' "$lnk" "$dst"; continue; }; printf 'relinking:\n  %s\n  %s\n' "$lnk" "$dst"; rm -- "$lnk"; ln -- "$dst" "$lnk"; done 


##
## convert hardlinks to symlinks (maybe not as safe? use with caution)

e=; p=; find -printf '%i %p\n' | awk '{i=$1;sub(/[^ ]+ /,"")} !n[i]++{p[i]=$0;next} {printf "real %s\nlink %s\n",p[i],$0}' | while read cls p; do [ -e "$p" ] || e=1; p="$(realpath -- "$p")" || e=1; [ -e "$p" ] || e=1; [ $cls = real ] && { real="$p"; continue; }; [ $cls = link ] || e=1; [ "$p" ] || e=1; [ $e ] && { echo "ERROR $p"; break; }; printf '\033[36m%s \033[0m -> \033[35m%s\033[0m\n' "$p" "$real"; rm "$p"; ln -s "$real" "$p" || { echo LINK FAILED; break; }; done


##
## create a test payload

head -c $((2*1024*1024*1024)) /dev/zero | openssl enc -aes-256-ctr -pass pass:hunter2 -nosalt > garbage.file


##
## testing multiple parallel uploads
## usage:  para | tee log

para() { for s in 1 2 3 4 5 6 7 8 12 16 24 32 48 64; do echo $s; for r in {1..4}; do for ((n=0;n<s;n++)); do curl -sF "act=bput" -F "f=@garbage.file" http://127.0.0.1:3923/ 2>&1 & done; wait; echo; done; done; }


##
## display average speed
## usage: avg logfile

avg() { awk 'function pr(ncsz) {if (nsmp>0) {printf "%3s %s\n", csz, sum/nsmp} csz=$1;sum=0;nsmp=0} {sub(/\r$/,"")} /^[0-9]+$/ {pr($1);next} / MiB/ {sub(/ MiB.*/,"");sub(/.* /,"");sum+=$1;nsmp++} END {pr(0)}' "$1"; }


##
## time between first and last upload

python3 -um copyparty -nw -v srv::rw -i 127.0.0.1 2>&1 | tee log 
cat log | awk '!/"purl"/{next} {s=$1;sub(/[^m]+m/,"");gsub(/:/," ");t=60*(60*$1+$2)+$3} t<p{t+=86400} !a{a=t;sa=s} {b=t;sb=s} END {print b-a,sa,sb}'

# or if the client youre measuring dies for ~15sec every once ina while and you wanna filter those out,
cat log | awk '!/"purl"/{next} {s=$1;sub(/[^m]+m/,"");gsub(/:/," ");t=60*(60*$1+$2)+$3} t<p{t+=86400} !p{a=t;p=t;r=0;next} t-p>1{printf "%.3f += %.3f - %.3f  (%.3f)  # %.3f -> %.3f\n",r,p,a,p-a,p,t;r+=p-a;a=t} {p=t} END {print r+p-a}'


##
## find uploads blocked by slow i/o or maybe deadlocks
awk '/^.\+. opened logfile/{print;next} {sub(/.$/,"")} !/^..36m[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3} /{next} !/0m(POST|writing) /{next} {c=0;p=$3} /0mPOST/{c=1} {s=$1;sub(/[^m]+m/,"");gsub(/:/," ");s=60*(60*$1+$2)+$3} c{t[p]=s;next} {d=s-t[p]} d>10{print $0 "  # " d}'


##
## bad filenames

dirs=("./ほげ" "./ほげ/ぴよ" "./$(printf \\xed\\x91)" "./$(printf \\xed\\x91/\\xed\\x92)" './qw,er;ty%20as df?gh+jkl%zxc&vbn <qwe>"rty'"'"'uio&asd&nbsp;fgh')
mkdir -p "${dirs[@]}"
for dir in "${dirs[@]}"; do for fn in ふが "$(printf \\xed\\x93)" 'qw,er;ty%20as df?gh+jkl%zxc&vbn <qwe>"rty'"'"'uio&asd&nbsp;fgh'; do echo "$dir" > "$dir/$fn.html"; done; done
# qw er+ty%20ui%%20op<as>df&gh&amp;jk#zx'cv"bn`m=qw*er^ty?ui@op,as.df-gh_jk


##
## upload mojibake

fn=$(printf '\xba\xdc\xab.cab')
echo asdf > "$fn"
curl --cookie cppwd=wark -sF "act=bput" -F "f=@$fn" http://127.0.0.1:3923/moji/%ED%91/


##
## test compression

wget -S --header='Accept-Encoding: gzip' -U 'MSIE 6.0; SV1' http://127.0.0.1:3923/.cpr/deps/ogv.js -O- | md5sum; p=~ed/dev/copyparty/copyparty/web/deps/ogv.js.gz; md5sum $p; gzip -d < $p | md5sum


##
## sha512(file) | base64
## usage:  shab64 chunksize_mb filepath

shab64() { sp=$1; f="$2"; v=0; sz=$(stat -c%s "$f"); while true; do w=$((v+sp*1024*1024)); printf $(tail -c +$((v+1)) "$f" | head -c $((w-v)) | sha512sum | cut -c-64 | sed -r 's/ .*//;s/(..)/\\x\1/g') | base64 -w0 | cut -c-43 | tr '+/' '-_'; v=$w; [ $v -lt $sz ] || break; done; }


##
## poll url for performance issues

command -v gdate && date() { gdate "$@"; }; while true; do t=$(date +%s.%N); (time wget http://127.0.0.1:3923/?ls -qO- | jq -C '.files[]|{sz:.sz,ta:.tags.artist,tb:.tags.".bpm"}|del(.[]|select(.==null))' | awk -F\" '/"/{t[$2]++} END {for (k in t){v=t[k];p=sprintf("%" (v+1) "s",v);gsub(/ /,"#",p);printf "\033[36m%s\033[33m%s   ",k,p}}') 2>&1 | awk -v ts=$t 'NR==1{t1=$0} NR==2{sub(/.*0m/,"");sub(/s$/,"");t2=$0;c=2; if(t2>0.3){c=3} if(t2>0.8){c=1} } END{sub(/[0-9]{6}$/,"",ts);printf "%s   \033[3%dm%s   %s\033[0m\n",ts,c,t2,t1}'; sleep 0.1 || break; done


##
## track an up2k upload and print all chunks in file-order

grep '"name": "2021-07-18 02-17-59.mkv"' fug.log | head -n 1 | sed -r 's/.*"hash": \[//; s/\].*//' | tr '"' '\n' | grep -E '^[a-zA-Z0-9_-]{44}$' | while IFS= read -r cid; do cat -n fug.log | grep -vF '"purl": "' | grep -- "$cid"; echo; done | stdbuf -oL tr '\t' ' ' | while IFS=' ' read -r ln _ _ _ _ _ ts ip port msg; do [ -z "$msg" ] && echo && continue; printf '%6s [%s] [%s] %s\n' $ln "$ts" "$ip $port" "$msg"; read -r ln _ _ _ _ _ ts ip port msg < <(cat -n fug.log | tail -n +$((ln+1)) | grep -F "$ip $port" | head -n 1); printf '%6s [%s] [%s] %s\n' $ln "$ts" "$ip $port" "$msg"; done


##
## js oneliners

# get all up2k search result URLs
var t=[]; var b=document.location.href.split('#')[0].slice(0, -1); document.querySelectorAll('#u2tab .prog a').forEach((x) => {t.push(b+encodeURI(x.getAttribute("href")))}); console.log(t.join("\n"));

# debug md-editor line tracking
var s=mknod('style');s.innerHTML='*[data-ln]:before {content:attr(data-ln)!important;color:#f0c;background:#000;position:absolute;left:-1.5em;font-size:1rem}';document.head.appendChild(s);


##
## bash oneliners

# get the size and video-id of all youtube vids in folder, assuming filename ends with -id.ext, and create a copyparty search query
find -maxdepth 1 -printf '%s %p\n' | sort -n | awk '!/-([0-9a-zA-Z_-]{11})\.(mkv|mp4|webm)$/{next} {sub(/\.[^\.]+$/,"");n=length($0);v=substr($0,n-10);print $1, v}' | tee /dev/stderr | awk 'BEGIN {p="("} {printf("%s name like *-%s.* ",p,$2);p="or"} END {print ")\n"}' | cat >&2

# unique stacks in a stackdump
f=a; rm -rf stacks; mkdir stacks; grep -E '^#' $f | while IFS= read -r n; do awk -v n="$n" '!$0{o=0} o; $0==n{o=1}' <$f >stacks/f; h=$(sha1sum <stacks/f | cut -c-16); mv stacks/f stacks/$h-"$n"; done ; find stacks/ | sort | uniq -cw24


##
## sqlite3 stuff

# find dupe metadata keys
sqlite3 up2k.db 'select mt1.w, mt1.k, mt1.v, mt2.v from mt mt1 inner join mt mt2 on mt1.w = mt2.w where mt1.k = mt2.k and mt1.rowid != mt2.rowid'

# partial reindex by deleting all tags for a list of files
time sqlite3 up2k.db 'select mt1.w from mt mt1 inner join mt mt2 on mt1.w = mt2.w where mt1.k = +mt2.k and mt1.rowid != mt2.rowid'  > warks
cat warks | while IFS= read -r x; do sqlite3 up2k.db "delete from mt where w = '$x'"; done

# dump all dbs
find -iname up2k.db | while IFS= read -r x; do sqlite3 "$x" 'select substr(w,1,12), rd, fn from up' | sed -r 's/\|/ \| /g' | while IFS= read -r y; do printf '%s | %s\n' "$x" "$y"; done; done

# unschedule mtp scan for all files somewhere under "enc/"
sqlite3 -readonly up2k.db 'select substr(up.w,1,16) from up inner join mt on mt.w = substr(up.w,1,16) where rd like "enc/%" and +mt.k = "t:mtp"' > keys; awk '{printf "delete from mt where w = \"%s\" and +k = \"t:mtp\";\n", $0}' <keys | tee /dev/stderr | sqlite3 up2k.db

# compare metadata key "key" between two databases
sqlite3 -readonly up2k.db.key-full 'select w, v from mt where k = "key" order by w' > k1; sqlite3 -readonly up2k.db 'select w, v from mt where k = "key" order by w' > k2; ok=0; ng=0; while IFS='|' read w k2; do k1="$(grep -E "^$w" k1 | sed -r 's/.*\|//')"; [ "$k1" = "$k2" ] && ok=$((ok+1)) || { ng=$((ng+1)); printf '%3s %3s  %s\n' "$k1" "$k2" "$(sqlite3 -readonly up2k.db.key-full "select * from up where substr(w,1,16) = '$w'" | sed -r 's/\|/ | /g')"; }; done < <(cat k2); echo "match $ok   diff $ng"

# actually this is much better
sqlite3 -readonly up2k.db.key-full 'select w, v from mt where k = "key" order by w' > k1; sqlite3 -readonly up2k.db 'select mt.w, mt.v, up.rd, up.fn from mt inner join up on mt.w = substr(up.w,1,16) where mt.k = "key" order by up.rd, up.fn' > k2; ok=0; ng=0; while IFS='|' read w k2 path; do k1="$(grep -E "^$w" k1 | sed -r 's/.*\|//')"; [ "$k1" = "$k2" ] && ok=$((ok+1)) || { ng=$((ng+1)); printf '%3s %3s  %s\n' "$k1" "$k2" "$path"; }; done < <(cat k2); echo "match $ok   diff $ng"


##
## scanning for exceptions

cd /dev/shm
journalctl -aS '720 hour ago' -t python3 -o with-unit --utc | cut -d\  -f2,6- > cpp.log
tac cpp.log | awk '/RuntimeError: generator ignored GeneratorExit/{n=1} n{n--;if(n==0)print} 1' | grep 'generator ignored GeneratorExit' -C7 | head -n 100
awk '/Exception ignored in: <generator object StreamZip.gen/{s=1;next} /could not create thumbnail/{s=3;next} s{s--;next} 1' <cpp.log | less -R
less-search:
  >: |Exception|Traceback


##
## tracking bitflips

l=log.tmux-1662316902  # your logfile (tmux-capture or decompressed -lo)

# grab handshakes to a smaller logfile
tr -d '\r' <$l | awk '/^.\[36m....-..-...\[0m.?$/{d=substr($0,6,10)} !d{next} /"purl": "/{t=substr($1,6);sub(/[^ ]+ /,"");sub(/ .\[34m[0-9]+ /," ");printf("%s %s %s %s\n",d,t,ip,$0)}' | while read d t ip f; do u=$(date +%s --date="${d}T${t}Z"); printf '%s\n' "$u $ip $f"; done > handshakes

# quick list of affected files
grep 'your chunk got corrupted somehow' -A1 $l | tr -d '\r' | grep -E '^[a-zA-Z0-9_-]{44}$' | sort | uniq | while IFS= read -r x; do grep -F "$x" handshakes | head -c 200; echo; done | sed -r 's/.*"name": "//' | sort | uniq -cw20

# find all cases of corrupt chunks and print their respective handshakes (if any),
# timestamps are when the corrupted chunk was received (and also the order they are displayed),
# first checksum is the expected value from the handshake, second is what got uploaded
awk <$l '/^.\[36m....-..-...\[0m.?$/{d=substr($0,6,10)} /your chunk got corrupted somehow/{n=2;t=substr($1,6);next} !n{next} {n--;sub(/\r$/,"")} n{a=$0;next} {sub(/.\[0m,.*/,"");printf "%s %s %s %s\n",d,t,a,$0}' |
while read d t h1 h2; do printf '%s %s\n' $d $t; (
printf '  %s [%s]\n' $h1 "$(grep -F $h1 <handshakes | head -n 1)"
printf '  %s [%s]\n' $h2 "$(grep -F $h2 <handshakes | head -n 1)"
) | sed 's/, "sprs":.*//'; done | less -R

# notes; TODO clean up and put in the readme maybe --
# quickest way to drop the bad files (if a client generated bad hashes for the initial handshake) is shutting down copyparty and moving aside the unfinished file (both the .PARTIAL and the empty placeholder)
# BUT the clients will immediately re-handshake the upload with the same bitflipped hashes, so the uploaders have to refresh their browsers before you do that,
# so maybe just ask them to refresh and do nothing for 6 hours so the timeout kicks in, which deletes the placeholders/name-reservations and you can then manually delete the .PARTIALs at some point later


##
## media

# split track into test files
e=6; s=10; d=~/dev/copyparty/srv/aus; n=1; p=0; e=$((e*60)); rm -rf $d; mkdir $d; while true; do ffmpeg -hide_banner -ss $p -i 'nervous_testpilot - office.mp3' -c copy -t $s $d/$(printf %04d $n).mp3; n=$((n+1)); p=$((p+s)); [ $p -gt $e ] && break; done

-v srv/aus:aus:r:ce2dsa:ce2ts:cmtp=fgsfds=bin/mtag/sleep.py
sqlite3 .hist/up2k.db 'select * from mt where k="fgsfds" or k="t:mtp"' | tee /dev/stderr | wc -l

# generate the sine meme
for ((f=420;f<1200;f++)); do sz=$(ffmpeg -y -f lavfi -i sine=frequency=$f:duration=2 -vf volume=0.1 -ac 1 -ar 44100 -f s16le /dev/shm/a.wav 2>/dev/null; base64 -w0 </dev/shm/a.wav | gzip -c | wc -c); printf '%d %d\n' $f $sz; done | tee /dev/stderr | sort -nrk2,2
ffmpeg -y -f lavfi -i sine=frequency=1050:duration=2 -vf volume=0.1 -ac 1 -ar 44100 /dev/shm/a.wav

# better sine
sox -DnV -r8000 -b8 -c1 /dev/shm/a.wav synth 1.1 sin 400 vol 0.02

# play icon calibration pics
for w in 150 170 190 210 230 250; do for h in 130 150 170 190 210; do /c/Program\ Files/ImageMagick-7.0.11-Q16-HDRI/magick.exe convert -size ${w}x${h} xc:brown -fill orange -draw "circle $((w/2)),$((h/2)) $((w/2)),$((h/3))" $w-$h.png; done; done

# compress chiptune modules
mkdir gz; for f in *.*; do pigz -c11 -I100 <"$f" >gz/"$f"gz; touch -r "$f" gz/"$f"gz; done
mkdir xz; for f in *.*; do xz -cz9 <"$f" >xz/"$f"xz; touch -r "$f" xz/"$f"xz; done
mkdir z; for f in *.*; do 7z a -tzip -mx=9 -mm=lzma "z/${f}z" "$f" && touch -r "$f" z/"$f"z; done 


##
## vscode

# replace variable name
# (^|[^\w])oldname([^\w]|$) => $1newname$2

# monitor linter progress
htop -d 2 -p $(ps ax | awk '/electron[ ]/ {printf "%s%s", v, $1;v=","}')

# prep debug env (vscode embedded terminal)
renice 20 -p $$

# cleanup after a busted shutdown
ps ax | awk '/python[23]? -m copyparty|python[ ]-c from multiproc/ {print $1}' | tee /dev/stderr | xargs kill

# last line of each function in a file
cat copyparty/httpcli.py | awk '/^[^a-zA-Z0-9]+def / {printf "%s\n%s\n\n", f, pl; f=$2} /[a-zA-Z0-9]/ {pl=$0}'


##
## meta

# create a folder with symlinks to big files
for d in /usr /var; do find $d -type f -size +30M 2>/dev/null; done | while IFS= read -r x; do ln -s "$x" big/; done

# py2 on osx
brew install python@2
pip install virtualenv

# fix firefox phantom breakpoints,
# suggestions from bugtracker, doesnt work (debugger is not attachable)
devtools settings >> advanced >> enable browser chrome debugging + enable remote debugging
burger > developer >> browser toolbox  (ctrl-alt-shift-i)
iframe btn topright >> chrome://devtools/content/debugger/index.html
dbg.asyncStore.pendingBreakpoints = {}

# fix firefox phantom breakpoints
about:config >> devtools.debugger.prefs-schema-version = -1

# determine server version
git pull; git reset --hard origin/HEAD && git log --format=format:"%H %ai %d" --decorate=full > ../revs && cat ../{util,browser,up2k}.js >../vr && cat ../revs | while read -r rev extra; do (git reset --hard $rev >/dev/null 2>/dev/null && dsz=$(cat copyparty/web/{util,browser,up2k}.js >../vg 2>/dev/null && diff -wNarU0 ../{vg,vr} | wc -c) && printf '%s %6s %s\n' "$rev" $dsz "$extra") </dev/null; done                

# download all sfx versions
curl https://api.github.com/repos/9001/copyparty/releases?per_page=100 | jq -r '.[] | .tag_name + " " + .name' | tr -d '\r' | while read v t; do fn="$(printf '%s\n' "copyparty $v $t.py" | tr / -)"; [ -e "$fn" ] || curl https://github.com/9001/copyparty/releases/download/$v/copyparty-sfx.py -Lo "$fn"; done

# convert releasenotes to changelog
curl https://api.github.com/repos/9001/copyparty/releases?per_page=100 | jq -r '.[] | "▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  \n# \(.created_at)  `\(.tag_name)`  \(.name)\n\n\(.body)\n\n\n"' | sed -r 's/^# ([0-9]{4}-)([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})Z /# \1\2\3-\4\5 /' > changelog.md

# push to multiple git remotes
git config -l | grep '^remote'
git remote add all git@github.com:9001/copyparty.git
git remote set-url --add --push all git@gitlab.com:9001/copyparty.git
git remote set-url --add --push all git@github.com:9001/copyparty.git


##
## http 206

# az = abcdefghijklmnopqrstuvwxyz

printf '%s\r\n' 'GET /az HTTP/1.1' 'Host: ocv.me' 'Range: bytes=5-10' '' | ncat ocv.me 80 
# Content-Range: bytes 5-10/26
# Content-Length: 6
# fghijk

Range: bytes=0-1    "ab" Content-Range: bytes 0-1/26
Range: bytes=24-24  "y"  Content-Range: bytes 24-24/26
Range: bytes=24-25  "yz" Content-Range: bytes 24-25/26
Range: bytes=24-    "yz" Content-Range: bytes 24-25/26
Range: bytes=25-29  "z"  Content-Range: bytes 25-25/26
Range: bytes=26-         Content-Range: bytes */26
  HTTP/1.1 416 Requested Range Not Satisfiable


##
## md perf

var tsh = [];
function convert_markdown(md_text, dest_dom) {
    tsh.push(Date.now());
    while (tsh.length > 10)
        tsh.shift();
    if (tsh.length > 1) {
        var end = tsh.slice(-2);
        console.log("render", end.pop() - end.pop(), (tsh[tsh.length - 1] - tsh[0]) / (tsh.length - 1));
    }


##
## tmpfiles.d meme

mk() { rm -rf /tmp/foo; sudo -u ed bash -c 'mkdir /tmp/foo; echo hi > /tmp/foo/bar'; }
mk && t0="$(date)" && while true; do date -s "$(date '+ 1 hour')"; systemd-tmpfiles --clean; ls -1 /tmp | grep foo || break; done; echo "$t0"
mk && sudo -u ed flock /tmp/foo sleep 40 & sleep 1; ps aux | grep -E 'sleep 40$' && t0="$(date)" && for n in {1..40}; do date -s "$(date '+ 1 day')"; systemd-tmpfiles --clean; ls -1 /tmp | grep foo || break; done; echo "$t0"
mk && t0="$(date)" && for n in {1..40}; do date -s "$(date '+ 1 day')"; systemd-tmpfiles --clean; ls -1 /tmp | grep foo || break; tar -cf/dev/null /tmp/foo; done; echo "$t0"


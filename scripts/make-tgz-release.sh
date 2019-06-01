#!/bin/bash
set -e
echo

sed=$( which gsed  2>/dev/null || which sed)
find=$(which gfind 2>/dev/null || which find)
sort=$(which gsort 2>/dev/null || which sort)

which md5sum 2>/dev/null >/dev/null &&
	md5sum=md5sum ||
	md5sum="md5 -r"

ver="$1"

[[ "x$ver" == x ]] &&
{
	echo "need argument 1:  version"
	echo
	exit 1
}

[[ -e copyparty/__main__.py ]] || cd ..
[[ -e copyparty/__main__.py ]] ||
{
	echo "run me from within the copyparty folder"
	echo
	exit 1
}

out_dir="$(pwd | $sed -r 's@/[^/]+$@@')"
zip_path="$out_dir/copyparty-$ver.zip"
tgz_path="$out_dir/copyparty-$ver.tar.gz"

[[ -e "$zip_path" ]] ||
[[ -e "$tgz_path" ]] &&
{
	echo "found existing archives for this version"
	echo "  $zip_path"
	echo "  $tgz_path"
	echo
	echo "continue?"
	read -u1
}
rm "$zip_path" 2>/dev/null || true
rm "$tgz_path" 2>/dev/null || true

#$sed -ri "s/^(ADMIN_PWD *= *u).*/\1'hunter2'/" copyparty/config.py

tmp="$(mktemp -d)"
rls_dir="$tmp/copyparty-$ver"
mkdir "$rls_dir"

echo ">>> export"
git archive master |
tar -x -C "$rls_dir"

cd "$rls_dir"
$find -type d -exec chmod 755 '{}' \+
$find -type f -exec chmod 644 '{}' \+

commaver="$(
	printf '%s\n' "$ver" |
	sed -r 's/\./,/g'
)"

grep -qE "^VERSION *= \(${commaver}\)$" copyparty/__version__.py ||
{
	echo "$tmp"
	echo "bad version"
	echo
	echo " arg: $commaver"
	echo "code: $(
		cat copyparty/__version__.py |
		grep -E '^VERSION'
	)"
	echo
	echo "continue?"
	read -u1
}

rm -rf .vscode
rm \
  .gitattributes \
  .gitignore

mv LICENSE LICENSE.txt

# messy because osx support
$find -type f -exec $md5sum '{}' \+ |
$sed -r 's/(.{32})(.*)/\2\1/' | LC_COLLATE=c $sort |
$sed -r 's/(.*)(.{32})/\2\1/' |
$sed -r 's/^(.{32}) \./\1  ./' > ../.sums.md5
mv ../.sums.md5 .

cd ..
echo ">>> tar"; tar -czf "$tgz_path" "copyparty-$ver"
echo ">>> zip"; zip -qr  "$zip_path" "copyparty-$ver"

rm -rf "$tmp"
echo
echo "done:"
echo "  $zip_path"
echo "  $tgz_path"
echo

# function alr() { ls -alR copyparty-$1 | $sed -r "s/copyparty-$1/copyparty/" | $sed -r 's/[A-Z][a-z]{2} [0-9 ]{2} [0-9]{2}:[0-9]{2}//' > $1; }; for x in master rls src ; do alr $x; done


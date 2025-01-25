#!/usr/bin/env python3

import os
import stat
import subprocess as sp
import sys


"""
if you've found yourself using copyparty to serve flashdrives on a LAN
and your only wish is that the web-UI had a button to unmount / safely
remove those flashdrives, then boy howdy are you in the right place :D

put usb-eject.js in the webroot (or somewhere else http-accessible)
then run copyparty with these args:

   -v /run/media/ed:/usb:A:c,hist=/tmp/junk
   --xm=c1,bin/hooks/usb-eject.py
   --js-browser=/usb-eject.js

which does the following respectively,

  * share all of /run/media/ed as /usb with admin for everyone
     and put the histpath somewhere it won't cause trouble
  * run the usb-eject hook with stdout redirect to the web-ui
  * add the complementary usb-eject.js to the browser

"""


def main():
    try:
        label = sys.argv[1].split(":usb-eject:")[1].split(":")[0]
        mp = "/run/media/ed/" + label
        # print("ejecting [%s]... " % (mp,), end="")
        mp = os.path.abspath(os.path.realpath(mp.encode("utf-8")))
        st = os.lstat(mp)
        if not stat.S_ISDIR(st.st_mode):
            raise Exception("not a regular directory")

        cmd = [b"gio", b"mount", b"-e", mp]
        print(sp.check_output(cmd).decode("utf-8", "replace").strip())

    except Exception as ex:
        print("unmount failed: %r" % (ex,))


if __name__ == "__main__":
    main()

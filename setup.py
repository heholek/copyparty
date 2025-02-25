#!/usr/bin/env python3
# coding: utf-8
from __future__ import print_function

import os
import sys
from shutil import rmtree
from setuptools import setup, Command

_ = """
this probably still works but is no longer in use;
pyproject.toml and scripts/make-pypi-release.sh
are in charge of packaging wheels now
"""

NAME = "copyparty"
VERSION = None
data_files = [("share/doc/copyparty", ["README.md", "LICENSE"])]
manifest = ""
for dontcare, files in data_files:
    for fn in files:
        manifest += "include {0}\n".format(fn)

manifest += "recursive-include copyparty/res *\n"
manifest += "recursive-include copyparty/web *\n"

here = os.path.abspath(os.path.dirname(__file__))

with open(here + "/MANIFEST.in", "wb") as f:
    f.write(manifest.encode("utf-8"))

with open(here + "/README.md", "rb") as f:
    txt = f.read().decode("utf-8")
    long_description = txt

about = {}
if not VERSION:
    with open(os.path.join(here, NAME, "__version__.py"), "rb") as f:
        exec (f.read().decode("utf-8").split("\n\n", 1)[1], about)
else:
    about["__version__"] = VERSION


class clean2(Command):
    description = "Cleans the source tree"
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        os.system("{0} setup.py clean --all".format(sys.executable))

        try:
            rmtree("./dist")
        except:
            pass

        try:
            rmtree("./copyparty.egg-info")
        except:
            pass

        nuke = []
        for (dirpath, _, filenames) in os.walk("."):
            for fn in filenames:
                if (
                    fn.startswith("MANIFEST")
                    or fn.endswith(".pyc")
                    or fn.endswith(".pyo")
                    or fn.endswith(".pyd")
                ):
                    nuke.append(dirpath + "/" + fn)

        for fn in nuke:
            os.unlink(fn)


args = {
    "name": NAME,
    "version": about["__version__"],
    "description": (
        "Portable file server with accelerated resumable uploads, "
        + "deduplication, WebDAV, FTP, TFTP, zeroconf, media indexer, "
        + "video thumbnails, audio transcoding, and write-only folders"
    ),
    "long_description": long_description,
    "long_description_content_type": "text/markdown",
    "author": "ed",
    "author_email": "copyparty@ocv.me",
    "url": "https://github.com/9001/copyparty",
    "license": "MIT",
    "classifiers": [
        "Development Status :: 5 - Production/Stable",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.3",
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: Jython",
        "Programming Language :: Python :: Implementation :: PyPy",
        "Operating System :: OS Independent",
        "Environment :: Console",
        "Environment :: No Input/Output (Daemon)",
        "Intended Audience :: End Users/Desktop",
        "Intended Audience :: System Administrators",
        "Topic :: Communications :: File Sharing",
        "Topic :: Internet :: File Transfer Protocol (FTP)",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
    ],
    "include_package_data": True,
    "data_files": data_files,
    "packages": [
        "copyparty",
        "copyparty.bos",
        "copyparty.res",
        "copyparty.stolen",
        "copyparty.stolen.dnslib",
        "copyparty.stolen.ifaddr",
        "copyparty.web",
        "copyparty.web.a",
        "copyparty.web.dd",
        "copyparty.web.deps",
    ],
    "install_requires": ["jinja2"],
    "extras_require": {
        "thumbnails": ["Pillow"],
        "thumbnails2": ["pyvips"],
        "audiotags": ["mutagen"],
        "ftpd": ["pyftpdlib"],
        "ftps": ["pyftpdlib", "pyopenssl"],
        "tftpd": ["partftpy>=0.4.0"],
        "pwhash": ["argon2-cffi"],
    },
    "entry_points": {"console_scripts": ["copyparty = copyparty.__main__:main"]},
    "scripts": ["bin/partyfuse.py", "bin/u2c.py"],
    "cmdclass": {"clean2": clean2},
}

if sys.version_info < (3, 8):
    args["install_requires"].append("ipaddress")

setup(**args)

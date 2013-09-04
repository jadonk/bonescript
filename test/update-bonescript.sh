#!/bin/sh
set -x
set -e

# Get directory
cd $(dirname $0)
cd ..
BS_DIR=$(pwd)

ssh-copy-id root@192.168.7.2

cd $BS_DIR/test
node remote_bonetest.js setdate.js

ssh root@192.168.7.2 <<EOFA
systemctl stop bonescript
mkdir -p ~/bonescript
cd ~/bonescript
git init
EOFA

scp $BS_DIR/test/gitconfig root@192.168.7.2:.gitconfig

cd $BS_DIR
git push 192 master

ssh root@192.168.7.2 <<EOFB
cd ~/bonescript
git reset --hard
git checkout --
cd /usr/lib/node_modules
rm -r bonescript
ln -s ~/bonescript/node_modules/bonescript
systemctl stop bonescript
sync
EOFB

cd $BS_DIR/test
node remote_bonetest.js setdate.js


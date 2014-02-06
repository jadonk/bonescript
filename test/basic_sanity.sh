#!/bin/sh
cd $(dirname $0)
node -pe "'Name: ' + require('../index').getPlatform().name"
node -pe "'Version: ' + require('../index').getPlatform().bonescript"
node -pe "require('../index').digitalRead('P8_19')"

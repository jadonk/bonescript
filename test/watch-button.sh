#!/bin/sh
echo 22 > /sys/class/gpio/export
echo in > /sys/class/gpio/gpio22/direction
echo both > /sys/class/gpio/gpio22/edge
node watch-button

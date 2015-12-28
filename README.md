OctalBoneScript
===============

A more stable, continuously tested and better node.js library for scripting BeagleBone. This is alternative to [bonescript](https://github.com/jadonk/bonescript) library.

__v1.0.0 introduces major BC breaks. Please refer to [releases](https://github.com/theoctal/octalbonescript/releases) to see the changes made in latest version.__

Installation
------------
Recommended method to install OctalBoneScript is to add following line in your project ```package.json``` file.

```json

"octalbonescript" : "1.1.x"

```

If you are running kernel 3.8 i.e. Debian 7.9 or below, you should use 1.0.x branch.

```json

"octalbonescript" : "1.0.x"

```

After adding this line, you should run ``` npm install ``` command from that project directory to install OBS. Another method is to directly ```cd``` to project directory and run ```npm install octalbonescript``` command.

If you must install OBS globally, you must run following command as root.

```sh

npm install -g --unsafe-perm octalbonescript

```

Please note that OBS does not recommend Linux Angstrom. We strongly recommend that you upgrade your BeagleBone to Debian by following link given below:

[http://beagleboard.org/getting-started#update](http://beagleboard.org/getting-started#update)

Examples
--------
Latest code docs, examples and **migration guide** from original bonescript are available at following link:

[https://github.com/theoctal/octalbonescript/wiki](https://github.com/theoctal/octalbonescript/wiki)

Fork
----
This is a fork of [bonescript](https://github.com/jadonk/bonescript). Some APIs are changed in v1.0.0, and we have changed many things under the hood leading to a much better, more functional and faster version of the original library.

This fork is created to make bonescript more feature rich, faster, fix bugs and make it work in
simulator mode under Mac OSX and Linux.

We encourage you to report issues rightaway if you face any. We will try our best to be of help.

Contributors
------------
This [fork](https://github.com/ruth0000/octalbonescript_capemgr4_1) of OBS was very helpful in making OBS compatible with 4.1 kernel.

I also thank [psiphi75](https://github.com/psiphi75) who funded OBS transition to 4.1 kernel.

Donate
------
I have kept OBS updated and working since May 2014 and I will continue to do so. This ongoing development takes lot of my personal time.

If you use OBS in commercial projects, please consider donating some money as it supports ongoing development.

<a href='https://pledgie.com/campaigns/30863'><img alt='Click here to lend your support to: OctalBoneScript - Javascript library for BeagleBone and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/30863.png?skin_name=chrome' border='0' ></a>

Bitcoin address: **15v6b7AP7TVc8PASGxqddYPeNW1kA7ydFh**

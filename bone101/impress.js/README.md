impress.js
============

It's a presentation framework based on the power of CSS3 transforms and 
transitions in modern browsers and inspired by the idea behind prezi.com.

**WARNING**

impress.js may not help you if you have nothing interesting to say ;)


ABOUT THE NAME
----------------

impress.js name in [courtesy of @skuzniak](http://twitter.com/skuzniak/status/143627215165333504).

It's an (un)fortunate coincidence that a Open/LibreOffice presentation tool is called Impress ;)


VERSION HISTORY
-----------------

### 0.5.3 ([browse](http://github.com/bartaz/impress.js/tree/0.5.3), [zip](http://github.com/bartaz/impress.js/zipball/0.5.3), [tar](http://github.com/bartaz/impress.js/tarball/0.5.3))

#### BUGFIX RELEASE

Version 0.5 introduced events including `impress:stepenter`, but this event was not triggered properly in some
specific transition types (for example when only scale was changing between steps). It was caused by the fact that
in such cases expected `transitionend` event was not triggered.

This version fixes this issue. Unfortunately modern `transitionend` event is no longer used to detect when the
transition has finished, but old school (and more reliable) `setTimeout` is used.


### 0.5.2 ([browse](http://github.com/bartaz/impress.js/tree/0.5.2), [zip](http://github.com/bartaz/impress.js/zipball/0.5.2), [tar](http://github.com/bartaz/impress.js/tarball/0.5.2))

#### DOCUMENTATION RELEASE

More descriptive comments added to demo CSS and impress.js source file, so now not only `index.html` is worth reading ;)


### 0.5.1 ([browse](http://github.com/bartaz/impress.js/tree/0.5.1), [zip](http://github.com/bartaz/impress.js/zipball/0.5.1), [tar](http://github.com/bartaz/impress.js/tarball/0.5.1))

#### BUGFIX RELEASE

Changes in version 0.5 introduced a bug (#126) that was preventing clicks on links (or any clickable elements) on
currently active step. This release fixes this issue.



### 0.5 ([browse](http://github.com/bartaz/impress.js/tree/0.5), [zip](http://github.com/bartaz/impress.js/zipball/0.5), [tar](http://github.com/bartaz/impress.js/tarball/0.5))

#### CHANGELOG

* API changed, so that `impress()` function no longer automatically initialize presentation; new method called `init`
  was added to API and it should be used to start the presentation
* event `impress:init` is triggered on root presentation element (`#impress` by default) when presentation is initialized
* new CSS classes were added: `impress-disabled` is added to body element by the impress.js script and it's changed to 
  `impress-enabled` when `init()` function is called
* events added when step is entered and left - custom `impress:stepenter` and `impress:stepleave` events are triggered
  on step elements and can be handled like any other DOM events (with `addEventListener`)
* additional `past`, `present` and `future` classes are added to step elements
    - `future` class appears on steps that were not yet visited
    - `present` class appears on currently visible step - it's different from `active` class as `present` class
       is added when transition finishes (step is entered)
    - `past` class is added to already visited steps (when the step is left)
* and good news, `goto()` API method is back! it seems that `goto` **was** a future reserved word but isn't anymore,
  so we can use this short and pretty name instead of camelCassy `stepTo` - and yes, that means API changed again...
* additionally `goto()` method now supports new types of parameters:
    - you can give it a number of step you want to go to: `impress().goto(7)`
    - or its id: `impress().goto("the-best-slide-ever")`
    - of course DOM element is still acceptable: `impress().goto( document.getElementById("overview") )`
* and if it's not enough, `goto()` also accepts second parameter to define the transition duration in ms, for example
  `impress().goto("make-it-quick", 300)` or `impress().goto("now", 0)`

#### UPGRADING FROM PREVIOUS VERSIONS

In current version calling `impress()` doesn't automatically initialize the presentation. You need to call `init()`
function from the API. So in a place were you called `impress()` to initialize impress.js simply change this call
to `impress().init()`.

Version 0.4 changed `goto` API method into `stepTo`. It turned out that `goto` is not a reserved word anymore, so it
can be used in JavaScript. That's why version 0.5 brings it back and removes `stepTo`.

So if you have been using version 0.4 and have any reference to `stepTo` API method make sure to change it to `goto`.



### 0.4.1 ([browse](http://github.com/bartaz/impress.js/tree/0.4.1), [zip](http://github.com/bartaz/impress.js/zipball/0.4.1), [tar](http://github.com/bartaz/impress.js/tarball/0.4.1))

#### BUGFIX RELEASE

Changes is version 0.4 introduced a bug causing JavaScript errors being thrown all over the place in fallback mode.
This release fixes this issue.

It also adds a flag `impress.supported` that can be used in JavaScript to check if impress.js is supported in the browser.



### 0.4 ([browse](http://github.com/bartaz/impress.js/tree/0.4), [zip](http://github.com/bartaz/impress.js/zipball/0.4), [tar](http://github.com/bartaz/impress.js/tarball/0.4))

#### CHANGELOG

* configuration options on `#impress` element: `data-perspective` (in px, defaults so 1000),
  `data-transition-duration` (in ms, defaults to 1000)
* automatic scaling to fit window size, with configuration options:  `data-width` (in px, defaults to 1024),
  `data-height` (in px, defaults to 768), `max-scale` (defaults to 1), `min-scale` (defaults to 0)
* `goto` API function was renamed to `stepTo` because `goto` is a future reserved work in JavaScript,
  so **please make sure to update your code**
* fallback `impress-not-supported` class is now set on `body` element instead of `#impress` element and it's
  replaced with `impress-supported` when browser supports all required features
* classes `step-ID` used to indicate progress of the presentation are now renamed to `impress-on-ID` and are
  set on `body` element, so **please make sure to update your code**
* basic validation of configuration options
* couple of typos and bugs fixed
* favicon added ;)


#### UPGRADING FROM PREVIOUS VERSIONS

If in your custom JavaScript code you were using `goto()` function from impress.js API make sure to change it
to `stepTo()`.

If in your CSS you were using classes based on currently active step with `step-` prefix, such as `step-bored`
(where `bored` is the id of the step element) make sure to change it to `impress-on-` prefix
(for example `impress-on-bored`). Also in previous versions these classes were assigned to `#impress` element
and now they are added to `body` element, so if your CSS code depends on this, it also should be updated.

Same happened to `impress-not-supported` class name - it was moved from `#impress` element to `body`, so update
your CSS if it's needed.

#### NOTE ON BLACKBERRY PLAYBOOK

Changes and fixes added in this version have broken the experience on Blackberry Playbook with OS in version 1.0.
It happened due to a bug in the Playbook browser in this version. Fortunately in version 2.0 of Playbook OS this
bug was fixed and impress.js works fine.

So currently impress.js work only on Blackberry Playbook with latest OS. Fortunately, [it seems that most of the
users](http://twitter.com/n_adam_stanley/status/178188611827679233) [are quite quick with updating their devices]
(http://twitter.com/brcewane/status/178230406196379648)



### 0.3 ([browse](http://github.com/bartaz/impress.js/tree/0.3), [zip](http://github.com/bartaz/impress.js/zipball/0.3), [tar](http://github.com/bartaz/impress.js/tarball/0.3))

#### CHANGELOG

* minor CSS 3D fixes
* basic API to control the presentation flow from JavaScript
* touch event support
* basic support for iPad (iOS 5 and iOS 4 with polyfills) and Blackberry Playbook

#### UPGRADING FROM PREVIOUS VERSIONS

Because API was introduced the way impress.js script is initialized was changed a bit. You not only has to include
`impress.js` script file, but also call `impress()` function.

See the source of `index.html` for example and more details.


### 0.2 ([browse](http://github.com/bartaz/impress.js/tree/0.2), [zip](http://github.com/bartaz/impress.js/zipball/0.2), [tar](http://github.com/bartaz/impress.js/tarball/0.2))

* tutorial/documentation added to `index.html` source file
* being even more strict with strict mode
* code clean-up
* couple of small bug-fixes


### 0.1 ([browse](http://github.com/bartaz/impress.js/tree/0.1), [zip](http://github.com/bartaz/impress.js/zipball/0.1), [tar](http://github.com/bartaz/impress.js/tarball/0.1))

First release.

Contains basic functionality for step placement and transitions between them
with simple fallback for non-supporting browsers.



HOW TO USE IT
---------------

[Use the source](http://github.com/bartaz/impress.js/blob/master/index.html), Luke ;)

If you have no idea what I mean by that, or you just clicked that link above and got 
very confused by all these strange characters that got displayed on your screen,
it's a sign, that impress.js is not for you.

Sorry.

Fortunately there are some guys on GitHub that got quite excited with the idea of building
editing tool for impress.js. Let's hope they will manage to do it.


EXAMPLES AND DEMOS
--------------------

### Official demo

[impress.js demo](http://bartaz.github.com/impress.js) by [@bartaz](http://twitter.com/bartaz)

### Presentations

[CSS 3D transforms](http://bartaz.github.com/meetjs/css3d-summit) from [meet.js summit](http://summit.meetjs.pl) by [@bartaz](http://twitter.com/bartaz)

[What the Heck is Responsive Web Design](http://johnpolacek.github.com/WhatTheHeckIsResponsiveWebDesign-impressjs/) by John Polacek [@johnpolacek](http://twitter.com/johnpolacek)

[12412.org presentation to Digibury](http://extra.12412.org/digibury/) by Stephen Fulljames [@fulljames](http://twitter.com/fulljames)

[Data center virtualization with Wakame-VDC](http://wakame.jp/wiki/materials/20120114_TLUG/) by Andreas Kieckens [@Metallion98](https://twitter.com/#!/Metallion98)

[Asynchronous JavaScript](http://www.medikoo.com/asynchronous-javascript/3d/) by Mariusz Nowak [@medikoo](http://twitter.com/medikoo)

[Introduction to Responsive Design](http://www.alecrust.com/factory/rd-presentation/) by Alec Rust [@alecrust] (http://twitter.com/alecrust)

[Bonne année 2012](http://duael.fr/voeux/2012/) by Edouard Cunibil [@DuaelFr](http://twitter.com/DuaelFr)

[Careers in Free and Open Source Software](http://exequiel09.github.com/symposium-presentation/) by Exequiel Ceasar Navarrete [@ichigo1411](http://twitter.com/ichigo1411)

[HTML5 Future : to infinity and beyond!](http://sylvainw.github.com/HTML5-Future/index_en.html) by Sylvain Weber [@sylvainw](http://twitter.com/sylvainw)

### Websites and portfolios

[lioshi.com](http://lioshi.com) by @lioshi

[alingham.com](http://www.alingham.com) by Al Ingham [@alingham](http://twitter.com/alingham)

[nice-shots.de](http://nice-shots.de) by [@NiceShots](http://twitter.com/NiceShots)

[museum140](http://www.youtube.com/watch?v=ObLiikJEt94) Shorty Award promo video [entirely made with ImpressJS](http://thingsinjars.com/post/446/museum140-shorty/) by [@thingsinjars](http://twitter.com/thingsinjars)

[electricanimal.co.uk](http://www.electricanimal.co.uk) by [@elecmal](http://twitter.com/elecmal)

[t3kila.com](http://www.t3kila.com) by Romain Wurtz

If you have used impress.js in your presentation (or website) and would like to have it listed here,
please contact me via GitHub or send me a pull request to updated `README.md` file.



WANT TO CONTRIBUTE?
---------------------

If you've found a bug or have a great idea for new feature let me know by [adding your suggestion]
(http://github.com/bartaz/impress.js/issues/new) to [issues list](https://github.com/bartaz/impress.js/issues).

If you have fixed a bug or implemented a feature that you'd like to share, send your pull request against [dev branch]
(http://github.com/bartaz/impress.js/tree/dev). But remember that I only accept code that fits my vision of impress.js
and my coding standards - so make sure you are open for discussion :)



BROWSER SUPPORT
-----------------

### TL;DR;

Currently impress.js works fine in latest Chrome/Chromium browser, Safari 5.1 and Firefox 10.
With addition of some HTML5 polyfills (see below for details) it should work in Internet Explorer 10
(currently available as Developers Preview).
It doesn't work in Opera, as it doesn't support CSS 3D transforms.

As a presentation tool it was not developed with mobile browsers in mind, but some tablets are good
enough to run it, so it should work quite well on iPad (iOS 5, or iOS 4 with HTML5 polyfills) and 
Blackberry Playbook.

### Still interested? Read more...

Additionally for the animations to run smoothly it's required to have hardware
acceleration support in your browser. This depends on the browser, your operating
system and even kind of graphic hardware you have in your machine.

For browsers not supporting CSS3 3D transforms impress.js adds `impress-not-supported`
class on `#impress` element, so fallback styles can be applied to make all the content accessible.


### Even more explanation and technical stuff

Let's put this straight -- wide browser support was (and is) not on top of my priority list for
impress.js. It's built on top of fresh technologies that just start to appear in the browsers
and I'd like to rather look forward and develop for the future than being slowed down by the past.

But it's not "hard-coded" for any particular browser or engine. If any browser in future will
support features required to run impress.js, it will just begin to work there without changes in
the code.

From technical point of view all the positioning of presentation elements in 3D requires CSS 3D
transforms support. Transitions between presentation steps are based on CSS transitions.
So these two features are required by impress.js to display presentation correctly.

Unfortunately the support for CSS 3D transforms and transitions is not enough for animations to
run smoothly. If the browser doesn't support hardware acceleration or the graphic card is not 
good enough the transitions will be laggy.

Additionally the code of impress.js relies on APIs proposed in HTML5 specification, including
`classList` and `dataset` APIs. If they are not available in the browser, impress.js will not work.

Fortunately, as these are JavaScript APIs there are polyfill libraries that patch older browsers
with these APIs.

For example IE10 is said to support CSS 3D transforms and transitions, but it doesn't have `classList`
not `dataset` APIs implemented at the moment. So including polyfill libraries *should* help IE10
with running impress.js.


### And few more details about mobile support

Mobile browsers are currently not supported. Even Android browsers that support CSS 3D transforms are
forced into fallback view at this point.

Fortunately some tablets seem to have good enough hardware support and browsers to handle it.
Currently impress.js presentations should work on iPad and Blackberry Playbook.

In theory iPhone should also be able to run it (as it runs the same software as iPad), but I haven't
found a good way to handle it's small screen.

Also note that iOS supports `classList` and `dataset` APIs starting with version 5, so iOS 4.X and older
requires polyfills to work.


LICENSE
---------

Copyright 2011-2012 Bartek Szopka

Released under the MIT and GPL Licenses.



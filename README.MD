## <img src="https://culmat.github.io/joker-poker/joker-poker-logo.svg" align="left" height="48" width="48" >
Joker Poker

... is a distributed online [estimation poker](https://en.wikipedia.org/wiki/Planning_poker) application crafted with ❤️.

**How it works**

There are two important screens ...

1) The ![](https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/account-multiple.svg) _Team_ screen shows all teammates and their votes, including yourself
1) The ![](https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/account.svg) _Me_ screen shows your vote and allows you to change it

and two important events ...

1) The _team starts voting_ - all votes are reset and hidden and all teammates are taken to the _Me_ screen
1) _All teammates have voted_ - all votes are revealed and all teammates are taken to the _Team_ screen, you can still change your vote
 
You can change between screens any time by clicking on your own vote or via the menu.
If any teammate presses _Restart_ the _team starts voting_.

To make sure JokerPoker correctly detects that _all teammates have voted_ ...

1) set yourself as _observer_ when you are not voting. You can do so from the ![](https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/cog.svg) _Settings_ screen or when joining a team
1) Disonnect yourself when away from the screen - your facilitator will rebuke you a little less 😏 and it's only one click


**Features**

 * super easy to use - no fluff, just planning poker
 * no login, minimal setup - <a href="https://culmat.github.io/joker-poker/"><img src="https://dabuttonfactory.com/button.png?t=create+a+team&f=Ubuntu&ts=14&tc=fff&hp=16&vp=5&c=6&bgt=unicolored&bgc=2ea44f&be=1"></a> with a single click
 * mobile friendly - including integrated ![](https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/qrcode.svg) QR code generator 
 * data privacy - in the spirit of [unhosted](https://unhosted.org/), Joker Poker is as *serverless* as possible
   * all data is only stored locally in each participants browser
   * Mozilla's open source [TogetherJS](https://github.com/mozilla/togetherjs) is only used for communciaton between participants (NAT traversal)
   * We use the instance [maintained by JSFiddle and hosted on glitch](https://github.com/jsfiddle/togetherjs/issues/1172). You can [check the source code](http://togetherjs-hub.glitch.me/server-source), [check it again](https://glitch.com/edit/#!/togetherjs-hub), or host your own service.
 * optional [gravatar](gravatar.com/) and [monsterID](https://www.splitbrain.org/projects/monsterid) integration to make your poker session a friendly place
 * super simple and robust technology - it is really only one HTML and one Javascript file. It will work on any static webhost. 

**Questions & Answers**

 * _How can we know what we estimate? Why can't I set a desciption / sync with my issue tracker <XYZ>?_ 
 * JokerPoker is meant to be used on a secondary ( mobile ) screen. We assume you use other communication channels like voice and screen sharing in parrallel. You physical stimation poker cards don't show the topic either. [😗](https://en.wikipedia.org/wiki/KISS_principle)

**Don't love it?**

[Change it](https://github.com/culmat/joker-poker/issues), or leave it for an alternative [poker-planning](https://github.com/topics/poker-planning), [planning-poker](https://github.com/topics/planning-poker) or [planningpoker](https://github.com/topics/planningpoker).

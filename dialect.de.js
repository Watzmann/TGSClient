/*
 * Multilanguage code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2015
 *
*/

function loadDialect() {
  var dialect = (function() {
    return {
        //e17: '%(name)s wins the %(ML)s point match %(score)s',
        e17: '%(name)s gewinnt das %(ML)s Punktematch %(score)s',
        //e18: 'You win the %(ML)s point match %(score)s',
        e18: 'Du  gewinnst das %(ML)s Punktematch %(score)s',
        //e19: '** Player %(name)s has joined you for %(ML)s match.',
        e19: '** Spieler %(name)s nimmt die Einladung zum %(ML)s Match an.',
        //e20: '** You are now playing %(ML)s match with %(name)s',
        e20: '** Du spielst jetzt ein %(ML)s Match mit %(name)s',
        //e21: '%(name)s has joined you. Your running match was loaded.',
        e21: '%(name)s nimmt die Einladung an. Das unterbrochene Match wird geladen.',
        //e22: 'You are now playing with %(name)s. Your running match was loaded.',
        e22: 'Du spielst jetzt mit %(name)s. Das unterbrochene Match wird geladen.',
        //e23: 'turn: %(name)s.',
        e23: 'am Zug: %(name)s.',
        //e71: 'turn: %(name)s.',
        e71: 'am Zug: %(name)s.',
        //e24: 'Starting a new game with %(name)s.',
        e24: 'Beginn eines Games mit %(name)s.',
        //e25: 'You rolled %(r1)s, %(opp) rolled %(r2)s',
        e25: 'Du würfelst %(r1)s, %(opp) würft %(r2)s',
        //e26: '%(name)s rolled %(r1)s, %(opp) rolled %(r2)s',
        e26: '%(name)s würfelt %(r1)s, %(opp) würfelt %(r2)s',
        //e27: '%(name)s makes the first move.',
        e27: '%(name)s macht den ersten Zug.',
        //e28: "It's your turn to move.",
        e28: "Du bist dran zum Ziehen.",
        //e29: '%(name)s rolls %(r1)s and %(r2)s.',
        e29: '%(name)s würft %(r1)s und %(r2)s.',
        e30: '%(move)s\n',
        //e31: "%(name)s can't move.",
        e31: "%(name)s kann nicht ziehen.",
        e31b: "\n",
        //e32: 'The only possible move is %(move)s .',
        e32: 'Der einzig mögliche Zug ist %(move)s .',
        //e33: 'Bearing off: %(move)s',
        e33: 'Bearing off: %(move)s',
        //e34: 'You roll %(r1)s and %(r2)s.',
        e34: 'Du würfst %(r1)s und %(r2)s.',
        //e35: 'Please move %(nrpieces)s pieces.',
        e35: 'Bitte ziehe %(nrpieces)s Steine.',
        //e36: "You can't move.",
        e36: "Du kannst nicht ziehen.",
        e36b: '                           ',
        e37: '%(move)s',
        //e38: 'Bearing off: %(move)s',
        e38: 'Bearing off: %(move)s',
        //e39: '%(name)s wants to play a%(ML)s match%(variant)s with you.',
        e39: '%(name)s möchte ein %(ML)s Match%(variant)s mit Dir spielen.',
        //e40: '%(name)s wants to resume a saved match with you.',
        e40: '%(name)s möchte ein gespeichertes Match mit Dir wiederaufnehmen.',
        //h36: "You stop watching %(name)s.",
        h36: "Du hörst auf %(name)s zuzuschaun.",
        //h39: "You're now watching %(name)s.",
        h39: "Du schaust %(name)s zu.",
        //h40: "You're now watching %(name)s. %(name)s is not doing anything interesting.",
        h40: "Du schaust %(name)s zu. %(name)s spielt derzeit nicht.",
    }
  }());
  var toggles = (function() {
    return {
        'allowclock': {'name': "allowclock",
                       //'YES': "You would like to play using the clock",
                       'YES': "Du möchtest gerne mit Uhr spielen",
                       //'NO': "You don't allow the use of the servers clock"},
                       'NO': "Du möchtest keinesfalls mit Uhr spielen"},
        'allowpip': {'name': "allowpip",
                       //'YES': "You allow the use of the servers pip-count",
                       'YES': "Du erlaubst, dass der Server den pip-count angibt",
                       //'NO': "You don't allow the use of the servers pip-count"},
                       'NO': "Du verbietest dem Server, dass er den pip-count angibt"},
        'autogreedy': {'name': "autogreedy",
                       //'YES': "Will use greedy bearoffs after contact is gone",
                       'YES': "Es wird greedy ausgewürfelt, nachdem der Kontakt weg ist",
                       //'NO': "Won't use greedy bearoffs after contact is gone"},
                       'NO': "Es wird nicht automatisch greedy ausgewürfelt"},
        'automove': {'name': "automove",
                       //'YES': "Forced moves will be done automatically",
                       'YES': "Erzwungene Züge werden automatisch gesetzt",
                       //'NO': "Forced moves won't be done automatically"},
                       'NO': "Erzwungene Züge müssen von dir gesetzt werden"},
        'bell': {'name': "bell",
                       //'YES': "Your terminal will ring the bell if someone talks to you or invites you",
                       'YES': "Dein Rechner wird einen Sound abspielen, wenn dich jemand anquatscht oder einlädt",
                       //'NO': "Your terminal won't ring the bell if someone talks to you or invites you"},
                       'NO': "Dein Rechner wird keinen Sound abspielen, falls dich jemand anquatscht oder einlädt"},
        'crawford': {'name': "crawford",
                       //'YES': "You insist on playing with the Crawford rule",
                       'YES': "Du bestehst darauf, mit Crawford-Regel zu spielen",
                       //'NO': "You would like to play without using the Crawford rule"},
                       'NO': "Du bestehst darauf, ohne Crawford-Regel zu spielen"},
        'notify': {'name': "notify",
                       //'YES': "You will be notified when new users log in",
                       'YES': "Dir wird gemeldet, wenn sich Spieler einloggen",
                       //'NO': "You won't be notified when new users log in"},
                       'NO': "Es gibt keine Meldung, wenn sich Spieler einloggen"},
        'ratings': {'name': "ratings",
                       //'YES': "You'll see how the rating changes are calculated",
                       'YES': "Dir wird gezeigt, wie sich das Rating ändert",
                       //'NO': "You won't see how the rating changes are calculated"},
                       'NO': "Es gibt keine Anzeige, wenn sich das Rating ändert"},
        'ready': {'name': "ready",
                       //'YES': "You're now ready to invite or join someone",
                       'YES': "Du erklärst dich bereit, eine Einladung anzunehmen",
                       //'NO': "You're now refusing to play with someone"},
                       'NO': "Du bist nicht bereit, ein Spiel mitzuspielen"},
        'report': {'name': "report",
                       //'YES': "You will be informed about starting and ending matches",
                       'YES': "Du wirst informiert, wenn Spiele anfangen oder enden",
                       //'NO': "You won't be informed about starting and ending matches"},
                       'NO': "Du interessierst dich nicht für beginnende oder beendete Spiele"},
        'silent': {'name': "silent",
                       //'YES': "You won't hear what other players shout",
                       'YES': "Du hörst keinen allgemeinen Chat",
                       //'NO': "You will hear what other players shout"},
                       'NO': "Du hörst auf den allgemeinen Chat"},
        'friend': {'name': "friend",
                       //'YES': "You will treat your opponent as a friend",
                       'YES': "Du behandelst deinen Gegner wie einen Freund",
                       //'NO': "You will treat your opponent as a potential dropper"},
                       'NO': "Du behandelst deinen Gegner wie einen potenziellen dropper"},
        'deadcube': {'name': "deadcube",
                       //'YES': "You allow the use of dead cubes",
                       'YES': "Du lässt dead cubes zu",
                       //'NO': "You don't allow the use of dead cubes"},
                       'NO': "Du lässt keine dead cubes zu"},
        'doorclosed': {'name': "doorclosed",
                       //'YES': "You want your rooms door to be closed",
                       'YES': "Du schließt die Tür zu deinem room",
                       //'NO': "You want your rooms door to be open"},
                       'NO': "Du öffnest die Tür zu deinem room"},
    }
  }());
  var labels = (function() {
    return {
        //h40: "Here you soon will find ways to change your individual settings.",
        s01: "Hier kannst du bald deine persönlichen Einstellungen vornehmen.",
    }
  }());
  return [dialect,toggles,labels];
}

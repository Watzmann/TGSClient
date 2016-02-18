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
        e17: '%(name)s wins the %(ML)s point match %(score)s',
        e18: 'You win the %(ML)s point match %(score)s',
        e19: '** Player %(name)s has joined you for %(ML)s match.',
        e20: '** You are now playing %(ML)s match with %(name)s',
        e21: '%(name)s has joined you. Your running match was loaded.',
        e22: 'You are now playing with %(name)s. Your running match was loaded.',
        e23: 'turn: %(name)s.',
        e24: 'Starting a new game with %(name)s.',
        e25: 'You rolled %(r1)s, %(opp) rolled %(r2)s',
        e26: '%(name)s rolled %(r1)s, %(opp) rolled %(r2)s',
        e27: '%(name)s makes the first move.',
        e28: "It's your turn to move.",
        e29: '%(name)s rolls %(r1)s and %(r2)s.',
        e30: '%(move)s\n',
        e31: "%(name)s can't move.",
        e31b: "\n",
        e32: 'The only possible move is %(move)s .',
        e33: 'Bearing off: %(move)s',
        e34: 'You roll %(r1)s and %(r2)s.',
        e35: 'Please move %(nrpieces)s pieces.',
        e36: "You can't move.",
        e36b: '                           ',
        e37: '%(move)s',
        e38: 'Bearing off: %(move)s',
        e39: '%(name)s wants to play a%(ML)s match%(variant)s with you.',
        e40: '%(name)s wants to resume a saved match with you.',
    }
  }());
  var toggles = (function() {
    return {
        'allowclock': {'name': "allowclock",
                       'YES': "You would like to play using the clock",
                       'NO': "You don't allow the use of the servers clock"},
//                       'YES': "You allow the use of the servers clock",
//                       'NO': "You don't allow the use of the servers clock"},
        'allowpip': {'name': "allowpip",
                       'YES': "You allow the use of the servers pip-count",
                       'NO': "You don't allow the use of the servers pip-count"},
//        'autodouble': {'name': "autodouble",
//       autodouble is not yet enabled
//                       'YES': "You agree that doublets during opening double the cube",
//                       'NO': "You don't agree that doublets during opening double the cube"},
        'automove': {'name': "automove",
                       'YES': "Forced moves will be done automatically",
                       'NO': "Forced moves won't be done automatically"},
        'bell': {'name': "bell",
                       'YES': "Your terminal will ring the bell if someone talks to you or invites you",
                       'NO': "Your terminal won't ring the bell if someone talks to you or invites you"},
        'crawford': {'name': "crawford",
                       'YES': "You insist on playing with the Crawford rule",
                       'NO': "You would like to play without using the Crawford rule"},
//        'double': {'name': "double",
//                       'YES': "You will be asked if you want to double",
//                       'NO': "You won't be asked if you want to double"},
//        'greedy': {'name': "greedy",
//                       'YES': "Will use automatic greedy bearoffs",
//                       'NO': "Won't use automatic greedy bearoffs"},
        'notify': {'name': "notify",
                       'YES': "You will be notified when new users log in",
                       'NO': "You won't be notified when new users log in"},
        'ratings': {'name': "ratings",
                       'YES': "You'll see how the rating changes are calculated",
                       'NO': "You won't see how the rating changes are calculated"},
        'ready': {'name': "ready",
                       'YES': "You're now ready to invite or join someone",
                       'NO': "You're now refusing to play with someone"},
        'report': {'name': "report",
                       'YES': "You will be informed about starting and ending matches",
                       'NO': "You won't be informed about starting and ending matches"},
        'silent': {'name': "silent",
                       'YES': "You won't hear what other players shout",
                       'NO': "You will hear what other players shout"},
        'friend': {'name': "friend",
                       'YES': "You will treat your opponent as a friend",
                       'NO': "You will treat your opponent as a potential dropper"},
        'deadcube': {'name': "deadcube",
                       'YES': "You allow the use of dead cubes",
                       'NO': "You don't allow the use of dead cubes"},
        'doorclosed': {'name': "doorclosed",
                       'YES': "You want your rooms door to be closed",
                       'NO': "You want your rooms door to be open"},
    }
  }());
  return [dialect,toggles];
}

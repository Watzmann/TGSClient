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
  return dialect;
}

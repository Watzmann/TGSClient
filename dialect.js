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
        e19: '** Player %(name)s has joined you for %(ML)s match of %(variant)s.',
        e20: '** You are now playing %(ML)s match with %(name)s',
        e21: '%(name)s has joined you. Your running match was loaded.',
        e22: 'You are now playing with %(name)s. Your running match was loaded.',
        e23: 'Starting a new game with %(name)s.',
        e24: 'You rolled %(r1)s, %(opp) rolled %(r2)s',
        e25: '%(name)s rolled %(r1)s, %(opp) rolled %(r2)s',
        e26: '%(name)s makes the first move.',
        e27: "It's your turn to move.",
        e28: '%(name)s rolls %(r1)s and %(r2)s.',
        e29: '%(move)s\n',
        e30: "%(name)s can't move.",
        e30b: "\n",
        e31: 'The only possible move is %(move)s .',
        e32: 'Bearing off: %(move)s',
        e33: 'You roll %(r1)s and %(r2)s.',
        e34: 'Please move %(nrpieces)s pieces.',
        e35: "You can't move.",
        e35b: '                           ',
        e36: '%(move)s',
        e37: 'Bearing off: %(move)s',
    }
  }());
  return dialect;
}

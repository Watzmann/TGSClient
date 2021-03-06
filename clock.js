/*
 * Client code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2016
 *
*/

function loadTGCClock () {
	return {
		graceBar: {player: $("#pClockGraceBar"),
		           opponent: $("#oClockGraceBar")},
		display: {player: $("#playerClock .display"),
		           opponent: $("#opponentClock .display")},
		digits: (function () {
            var clock = {player: $('#playerClock'),
                         opponent: $('#opponentClock')},
                digit2name = 'zero one two three four five six seven eight nine'.split(' '),
                digits = {player: {}, opponent: {}, digit2name: digit2name},
                positions = ['m1', 'm2', ':', 's1', 's2'],
                digitHolder = {player: clock.player.find('.digits'),
                               opponent: clock.opponent.find('.digits')};
            digitHolder.player.children().remove();
            digitHolder.opponent.children().remove();
            $.each(positions, function () {
                if (this == ':') {
                    digitHolder.player.append('<div class="dots">');
                    digitHolder.opponent.append('<div class="dots">');
                } else {
                    var pos1 = $('<div>'),
                        pos2 = $('<div>'),
                        h;
                    for (var i=1; i<8; i++) {
                        h = '<span class="d' + i + '">';
                        pos1.append(h);
                        pos2.append(h);
                    }
                    digits.player[this] = pos1;
                    digits.opponent[this] = pos2;
                    digitHolder.player.append(pos1);
                    digitHolder.opponent.append(pos2);
                }
            });
            return digits;
		}()),
		displayClock: function (user, now) {
                var digits = tgc.clocks.digits,
                    name = digits.digit2name;
                digits[user].m1.attr('class', name[now[0]]);
                digits[user].m2.attr('class', name[now[1]]);
                digits[user].s1.attr('class', name[now[2]]);
                digits[user].s2.attr('class', name[now[3]]);
		},
		runGrace: function () {
		    gB = tgc.clocks.graceBar[tgc.clocks.user];
		    if (tgc.clocks.grace > 0) {
		        var w = tgc.clocks.display[tgc.clocks.user].css("width");
		        w = parseInt(w.slice(0,w.length-2));
		        w *= tgc.clocks.grace/tgc.clocks.graceMax;
                gB.css("width", w + "px");
                gB.show();
		    } else {
                gB.hide();
                clearInterval(tgc.clocks.timer);
            	tgc.clocks.timer = setInterval(tgc.clocks.runClock, 1000);
		    }
		    tgc.clocks.grace--;
		},
		runClock: function () {
    		tgc.clocks.setMoment();
		    tgc.clocks.seconds--;
		    if (tgc.clocks.seconds < 0) {
                tgc.clocks.minutes--;
                tgc.clocks.seconds = 59;
		    }
		    if (tgc.clocks.minutes < 0) {
        		tgc.clocks.stopClock();
	    	}
		},
		setMoment: function () {
		    var format = function (n) {
                    if (n < 10) {
                        return "0" + n.toString();
                    } else {
                        return n.toString();
                    }
		        },
		        moment = format(tgc.clocks.minutes) + format(tgc.clocks.seconds);
		    tgc.clocks.displayClock(tgc.clocks.user, moment);
		},
		setSeconds: function (user, s, grace) {
		    var m = parseInt(s/60, 10);
		    s = s % 60;
		    tgc.clocks.setClock(user, m, s, grace);
		},
		setClock: function (user, m, s, grace) {
            tgc.clocks.graceMax = tgc.clocks.grace = grace;
            tgc.clocks.minutes = m;
            tgc.clocks.seconds = s;
            tgc.clocks.user = user;
    		tgc.clocks.setMoment();
		},
		startClock: function (user, seconds, grace) {
		    tgc.clocks.setSeconds(user, seconds, grace);
            tgc.clocks.run = (grace > 0) ? tgc.clocks.runGrace : tgc.clocks.runClock;
		    if (tgc.clocks.timer != 0) {
		        tgc.clocks.stopClock();
		    }
        	tgc.clocks.timer = setInterval(tgc.clocks.run, 1000);
        	tgc.clocks.run(user)
		},
		stopClock: function () {
		    if (tgc.clocks.timer > 0) {
		        clearInterval(tgc.clocks.timer);
		    }
		    tgc.clocks.timer = 0;
		    if (tgc.clocks.user !== undefined) {
		        tgc.clocks.graceBar[tgc.clocks.user].hide();
		    }
		},
		minutes: 4,
		seconds: 23,
	    }
    }

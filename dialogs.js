/*
 * Dialogs code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2013 - 2015
 *
*/

var dlgHtml = {
    invite: "<div class=\"generalDialog inviteDialog\">hallo</div>",
};

function loadDialogs() {
  var dlg = (function() {
    var signal_colors = {1: "green", 3: "red", 0: "orange"};
    return {
        dialogResign: function () {
            $("#resignDialog").load('resign.html').show();
        },
        sendResign: function () {
            var value = $("#cResign input:checked").attr('value');
            tgc.cc.sendCmd("resign " + value);
            this.cancelResign();
        },
        cancelResign: function () {
            $("#resignDialog").hide();
        },
        dialogWatch: function (player) {
            $("#invitation #wPlayerName").html(player);
            $("#invitionSection").hide();
            $("#inviteDialog").show();
        },
        dialogInvite: function (player) {
            tgc.blackBoard['savedGamesFocusOld'] = tgc.blackBoard['savedGamesFocus']
            tgc.blackBoard['savedGamesFocus'] = '#inviteSavedGames';
            tgc.cc.sendCmd("savedgame " + player);
            $("#invitation #iPlayerName").html(player);
            $("#invitation #wPlayerName").html(player);
            $("#inviteDialog").show();
        },
        watch: function (player) {
            return function(event) {
                dlg.dialogWatch(player);
                return false;
            };
        },
        invite: function (player) {
            return function(event) {
                dlg.dialogInvite(player);
                return false;
            };
        },
        hideInvite: function () {
            $("#inviteDialog").hide();
            $("#invitionSection").show();
            $('#inviteSavedGames .gaContent table').remove()
            tgc.blackBoard['savedGamesFocus'] = tgc.blackBoard['savedGamesFocusOld'];
        },
        sendWatch: function () {
            var watch = "watch "+$("#invitation #wPlayerName").html();
            tgc.cc.sendCmd(watch);
            this.hideInvite();
        },
        sendInvite: function () {
            var variation = $("#invitation input:checked").attr('value'),
                matchLength = document.getElementById("iMatchLength"),
                invitation = "invite "+$("#invitation #iPlayerName").html()+" "+matchLength.value;
            if (variation != 'standard') {
                invitation += ' ' + variation;
            }
            tgc.cc.sendCmd(invitation);
            this.hideInvite();
        },
    }
  }());
  return dlg;
}

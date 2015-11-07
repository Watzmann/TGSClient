/*
 * Dialogs code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2013 - 2014
 *
*/

var dlgHtml = {
    invite: "<div class=\"inviteDialog\">hallo</div>",
};

function loadDialogs() {
  var dlg = (function() {
    var signal_colors = {1: "green", 3: "red", 0: "orange"};
    return {
        dialogInvite: function (player) {
            $("#inviteDialog").load('dialogs.html', function() {
                    $("#invitation #playerName").html(player)
                }).show();
        },
        invite: function (player) {
            return function(event) {
                dlg.dialogInvite(player);
                return false;
            };
        },
        sendInvite: function () {
            var variation = $("#invitation input:checked").attr('value'),
                matchLength = document.getElementById("iMatchLength"),
                invitation = "invite "+$("#invitation #playerName").html()+" "+matchLength.value;
            if (variation != 'standard') {
                invitation += ' ' + variation;
            }
            tgc.cc.sendCmd(invitation);
            $("#inviteDialog").hide();
        },
    }
  }());
  return dlg;
}

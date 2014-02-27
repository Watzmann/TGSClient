/*
 * Dialogs code for TigerGammonServer HTML5 Client
 *
 * (c) 2013, 2014 Andreas Hausmann
 * Licensed under AGPL3; see LICENSE
 *
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
                matchLength = document.getElementById("matchLength"),
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

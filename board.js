/*
 * Board code for TigerGammon HTML5 client
 *
 * (c) 2013 Dr. Andreas Hausmann
 *
 *
*/

function loadBoard() {
  return {
    parseBoard: function(board) {
        var boardParts = board.split(":");
/*
board:You:hannes:1:0:0:0:-1:0:0:0:-1:5:0:3:0:0:0:-4:5:0:0:0:-4:0:-5:0:0:0:0:2:0:1:0:0:0:0:1:1:1:0:-1:1:25:0:0:0:0:0:2:0:0:0
hannes rolls 4 and 3.
*/
        var parts = {};
        parts["opponent"] = boardParts[2];
        parts["position"] = boardParts.slice(6,32);
        return parts;
    },
    showAscii: function(boardPane, result) {
        boardPane.innerHTML = result;
    },
    draw: function(boardPane, board) {
        var piece = {'O': "board/playerpiece.gif",
                     'X': "board/opponentpiece.gif",};
        function moveChecker() {
            alert('clicked '+this.id+'  '+event.button);
            return false;   /* suppress contextmenu for right clicks */
        }
        function drawPoint(checkers, padding, color) {
            function drawCheckers(checkers, color) {
                var point = "";
                if (padding) {
                    point = "<div style=\"height:"+(162-checkers*27)+"px\"></div>";
                }
                for (var c = 0; c < checkers; c++) {
                    point += '<img src=' + piece[color] + ' alt=' + color + '>';
                }
                return point;
            }
            if (checkers == 0) {
                return "";
            } else {
                return drawCheckers((checkers > 0) ? checkers : -checkers, color);
            }
        }
        function setCheckers(position, $b) {
            var color, point, checkers, div;
            for (var i=1; i<26; i++) {
                    checkers = position[i];
                if (checkers > 0) {
                    color='O';
                    div = "<div id=\"p"+i+"\" class=\"starthere\">";
                } else {
                    color='X';
                    div = "<div id=\"p"+i+"\">";
                }
                point = drawPoint(parseInt(checkers), i>12, color);
                jQuery(div+point+"</div>").appendTo($b);
            }
        }
        function setAction(index, element) {
            var action;
            element.onclick = moveChecker;
            element.oncontextmenu = moveChecker;

            /*if (color == 'X') {
                return "\">";
            } else {
                return "\" onclick=\"this.moveChecker('#p" +
                          from + "','#p" + from+pips + "')\">";
            }*/

        }
        var elements = this.parseBoard(board);
        var drawPosition = function(target, position) {
            var $board;
            $board = $(target);
            $board.find("div").remove();
            setCheckers(position, $board);
            $board.find('.starthere').each(setAction);
        };
        drawPosition(boardPane, elements['position']);
    }
  }
};

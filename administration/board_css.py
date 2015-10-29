# -*- coding: utf-8 -*-

# in folder TGSClient do
# python administration/board_css.py > board.css

from StringIO import StringIO

class BoardCss():
    def __init__(self, filepath):
        """Create the boards CSS."""
        self.metrics = self._read_metrics(filepath)
        self.board_css = self._board()
        self.board_css += self._points()
        self.board_css += self._checkers()
        self.board_css += self._dice()
        self.board_css += self._decoration()

    def _board(self,):
        css = StringIO()
        board = self.metrics['board']
        print >>css, "#boardBg {background-image: url(resources/board/%s);" \
                             "width:%dpx; height:%dpx;}" % board
        print >>css, "#board2 { margin-left:%dpx; margin-bottom:%dpx; " \
                               "height:%dpx; width:%dpx;}" \
                                         % (board[1] + 30, 18, board[2], 350)
        return css.getvalue()

    def _points(self,):
        """Create the boards points."""
        css = StringIO()
        rule = "#p%(point)d {position:absolute; top:%(top)dpx; " \
               "left:%(left)dpx; width:%(width)dpx; height:%(height)dpx;}"
        WIDTH = self.metrics['point_width']
        HEIGHT = 6 * self.metrics['piece_dimension'][1]
        BAR_WIDTH = self.metrics['bar_width']
        xpos = self.metrics['xposition']
        for i in range(24):
            values = dict((('point', i+1),
                           ('top', {True: self.metrics['top_margin'],
                                    False: self.metrics['bottom_margin'] - \
                                                                HEIGHT}[i>11]),
                           ('left', xpos),
                           ('width', WIDTH),
                           ('height', HEIGHT),
                          ))
            if i < 11:
                xpos -= WIDTH
            if i > 11:
                xpos += WIDTH
            if i == 5:
                xpos -= BAR_WIDTH
            if i == 17:
                xpos += BAR_WIDTH
            print >>css, rule % values
        return css.getvalue()

    def _checkers(self,):
        """Create the boards checker positions."""
        css = StringIO()
        h = self.metrics['piece_dimension'][1]
        hh = h / 2
        print >>css, ".c5 { position:relative; top:-%dpx; }" % (4 * h + hh)
        print >>css, ".c9 { position:relative; top:-%dpx; }" % (8 * h)
        offset = {5:8*h+hh, 9:16*h+h, 12:22*h+hh+h}
        for i in range(5,15): # 5..14
            if i in offset:
                o = offset[i]
            print >>css, ".cp%d { position:relative; top:-%dpx; }" % \
                                            (i, 2*i*h - o)
        for i in range(1,6): # 1..5
            print >>css, ".cs%d { height:%dpx; }" % (i, i*h)
        return css.getvalue()

    def _dice(self,):
        """Create the boards checker positions."""
        css = StringIO()
        dw, dh = self.metrics['dice_dimension']
        dx, dy = self.metrics['player_dice1']
        print >>css, "#pDice1 { position:absolute; top:%dpx; left:%dpx; " \
                                "width:%dpx; height:%dpx; }" % (dy, dx, dw, dh)
        dx, dy = self.metrics['player_dice2']
        print >>css, "#pDice2 { position:absolute; top:%dpx; left:%dpx; " \
                                "width:%dpx; height:%dpx; }" % (dy, dx, dw, dh)
        dx, dy = self.metrics['opponent_dice1']
        print >>css, "#oDice1 { position:absolute; top:%dpx; left:%dpx; " \
                                "width:%dpx; height:%dpx; }" % (dy, dx, dw, dh)
        dx, dy = self.metrics['opponent_dice2']
        print >>css, "#oDice2 { position:absolute; top:%dpx; left:%dpx; " \
                                "width:%dpx; height:%dpx; }" % (dy, dx, dw, dh)
        dx, dy, dw, dh = self.metrics['roll_dice']
        print >>css, "#rollDice { position:absolute; top:%dpx; left:%dpx; " \
                                "width:%dpx; height:%dpx; }" % (dy, dx, dw, dh)
        dx, dy, dw, dh = self.metrics['send_move']
        print >>css, "#sendMove { position:absolute; top:%dpx; left:%dpx; " \
                                "width:%dpx; height:%dpx; }" % (dy, dx, dw, dh)
        return css.getvalue()

    def _decoration(self,):
        """Create the boards checker positions."""
        css = StringIO()
        width = self.metrics['piece_dimension'][0]
        left, top, height = self.metrics['pditch']
        print >>css, "#p0 { position:absolute; top:%dpx; left:%dpx; " \
                     "width:%dpx; height:%dpx; }" % (top, left, width, height)
        print >>css, "#oDitchP { position:absolute; top:%dpx; left:%dpx; " \
                     "width:%dpx; height:%dpx; }" % (top, left, width, height)
        left, top, height = self.metrics['pbar']
        print >>css, "#p25 { position:absolute; top:%dpx; left:%dpx; " \
                     "width:%dpx; height:%dpx; }" % (top, left, width, height)
        left, top, height = self.metrics['oditch']
        print >>css, "#p0P { position:absolute; top:%dpx; left:%dpx; " \
                       "width:%dpx; height:%dpx; }" % (top, left, width, height)
        print >>css, "#oDitch { position:absolute; top:%dpx; left:%dpx; " \
                       "width:%dpx; height:%dpx; }" % (top, left, width, height)
        left, top, height = self.metrics['obar']
        print >>css, "#oBar { position:absolute; top:%dpx; left:%dpx; " \
                       "width:%dpx; height:%dpx; }" % (top, left, width, height)
        thick = self.metrics['piece_dimension'][2]
        for i in range(16):
            print >>css, ".pds%d { height:%dpx; }" % (i, i*thick)
        dx, dy, dw, dh = self.metrics['undo']
        print >>css, "#undo { position:absolute; top:%dpx; left:%dpx; " \
                                "width:%dpx; height:%dpx; }" % (dy, dx, dw, dh)
        dx, dy = self.metrics['upperpipsX']
        print >>css, ".upperpipsX { position:absolute; top:%dpx; left:%dpx; }" \
                                                                    % (dy, dx)
        dx, dy = self.metrics['lowerpipsX']
        print >>css, ".lowerpipsX { position:absolute; top:%dpx; left:%dpx; }" \
                                                                    % (dy, dx)
        dx, dy = self.metrics['upperpipsO']
        print >>css, ".upperpipsO { position:absolute; top:%dpx; left:%dpx; }" \
                                                                    % (dy, dx)
        dx, dy = self.metrics['lowerpipsO']
        print >>css, ".lowerpipsO { position:absolute; top:%dpx; left:%dpx; }" \
                                                                    % (dy, dx)
        return css.getvalue()

    metrics_keys = (
        'board_dimensions', 'point_width', 'piece_dimension',
        'bar_width', 'xposition', 'top_margin', 'bottom_margin',
        'dice_dimension', 'player_dice1', 'player_dice2',
        'opponent_dice1', 'opponent_dice2', 'roll_dice', 'send_move',
        'pditch', 'oditch', 'pbar', 'obar', 'undo',
        'upperpipsX', 'lowerpipsX', 'upperpipsO', 'lowerpipsO',
        )

    def _read_metrics(self, filepath):
        def _convert(value):
            if len(value) > 1:
                return tuple([int(v) for v in value])
            else:
                return int(value[0])
        tint = lambda m: (int(m[0]), int(m[1]))
        f = open(filepath)
        metrics = [l.split('#')[0].rstrip() for l in f.readlines()]
        metrics = [m.split() for m in metrics if m.split()]
        final = [(m[0], _convert(m[1:])) for m in metrics[1:]]
        final.append((metrics[0][0], (metrics[0][1],
                    int(metrics[0][2]), int(metrics[0][3]))))
        final = dict(final)
        f.close()
        return final

if __name__ == '__main__':
    import os.path, sys
#    metrics_file = os.path.join(os.path.dirname(__file__), 'normal.metrics')
    metrics_file = os.path.join(sys.argv[1], 'normal.metrics')
    print "/* %-55s */" % "This css file is created automatically by board_css.py."
    print "/* %-55s */" % "Do not edit as changes will be overridden."
    print
    print BoardCss(metrics_file).board_css

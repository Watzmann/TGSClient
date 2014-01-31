# -*- coding: utf-8 -*-

# in folder TGSClient do
# python administration/board_css.py > board.css

from StringIO import StringIO

class BoardCss():
    def __init__(self,):
        """Create the boards CSS."""
        self.board_css = self._points()
        self.board_css += self._checkers()
        self.board_css += self._dice()
        self.board_css += self._decoration()

    def _points(self,):
        """Create the boards points."""
        css = StringIO()
        rule = "#p%(point)d { position:absolute; top:%(top)dpx; left:%(left)dpx; width:%(width)dpx; height:%(height)dpx; }"
        WIDTH = 31
        HEIGHT = 162        # 27*6
        BAR_WIDTH = 31
        width = 430
        for i in range(24):
            values = dict((('point', i+1),
                           ('top', {True: 30, False: 370-HEIGHT}[i>11]),
                           ('left', width),
                           ('width', WIDTH),
                           ('height', HEIGHT),
                          ))
            if i < 11:
                width -= WIDTH
            if i > 11:
                width += WIDTH
            if i == 5:
                width -= BAR_WIDTH
            if i == 17:
                width += BAR_WIDTH
            print >>css, rule % values
        print >>css, "#p0 { position:absolute; top:238px; left:468px; width:27px; height:120px; }"
        print >>css, "#p25 { position:absolute; top:42px; left:245px; width:27px; height:135px; }"
        return css.getvalue()

    def _checkers(self,):
        """Create the boards checker positions."""
        css = StringIO()
        print >>css, ".c5 { position:relative; top:-%dpx; }" % (4*27 + 13)
        print >>css, ".c9 { position:relative; top:-%dpx; }" % (8*27)
        offset = {5:8*27+13, 9:16*27+27, 12:22*27+40}
        for i in range(5,15): #5..14
            if i in offset:
                o = offset[i]
            print >>css, ".cp%d { position:relative; top:-%dpx; }" % \
                                            (i, 2*i*27 - o)
        return css.getvalue()

    def _dice(self,):
        """Create the boards checker positions."""
        css = StringIO()
        print >>css, "#pDice1 { position:absolute; top:182px; left:338px; width:21px; height:21px; }"
        print >>css, "#pDice2 { position:absolute; top:182px; left:398px; width:21px; height:21px; }"
        print >>css, "#oDice1 { position:absolute; top:182px; left:129px; width:21px; height:21px; }"
        print >>css, "#oDice2 { position:absolute; top:182px; left:189px; width:21px; height:21px; }"
        print >>css, "#rollDice { position:absolute; top:178px; left:417px; width:38px; height:45px; }"
        print >>css, "#sendMove { position:absolute; top:176px; left:335px; width:89px; height:47px; }"
        return css.getvalue()

    def _decoration(self,):
        """Create the boards checker positions."""
        css = StringIO()
        print >>css, "#oDitch { position:absolute; top:31px; left:468px; width:27px; height:120px; }"
        print >>css, "#oBar { position:absolute; top:220px; left:245px; width:27px; height:135px; }"
        print >>css, "#undo { position:absolute; top:188px; left:247px; width:22px; height:22px; }"
        print >>css, ".upperpipsX { position:relative; top:131px; left:43px; }"
        print >>css, ".lowerpipsX { position:relative; top:198px; left:43px; }"
        print >>css, ".upperpipsO { position:relative; top:143px; left:43px; }"
        print >>css, ".lowerpipsO { position:relative; top:186px; left:43px; }"
        return css.getvalue()

if __name__ == '__main__':
    print "/* %-55s */" % "This css file is created automatically by board_css.py."
    print "/* %-55s */" % "Do not edit as changes will be overridden."
    print
    print BoardCss().board_css

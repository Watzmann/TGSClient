# -*- coding: utf-8 -*-

from StringIO import StringIO

class BoardCss():
    def __init__(self,):
        """Create the boards CSS."""
        css = StringIO()
        rule = "#p%(point)d { position:absolute; top:%(top)dpx; left:%(left)dpx; width:%(width)dpx; height:%(height)dpx; }"
        WIDTH = 31
        HEIGHT = 162        # 27*6
        BAR_WIDTH = 31
        width = 430
        for i in range(25):
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
        print >>css, "#pDice1 { position:absolute; top:182px; left:338px; width:21px; height:21px; }"
        print >>css, "#pDice2 { position:absolute; top:182px; left:398px; width:21px; height:21px; }"
        print >>css, "#oDice1 { position:absolute; top:182px; left:129px; width:21px; height:21px; }"
        print >>css, "#oDice2 { position:absolute; top:182px; left:189px; width:21px; height:21px; }"
        print >>css, "#rollDice { position:absolute; top:178px; left:417px; width:38px; height:45px; }"
        print >>css, "#sendMove { position:absolute; top:176px; left:335px; width:89px; height:47px; }"
        print >>css, ".upperpipsX { position:relative; top:131px; left:43px; }"
        print >>css, ".lowerpipsX { position:relative; top:198px; left:43px; }"
        print >>css, ".upperpipsO { position:relative; top:143px; left:43px; }"
        print >>css, ".lowerpipsO { position:relative; top:186px; left:43px; }"
        print >>css, ".c5 { position:relative; top:-%dpx; }" % (4*27 + 13)
        print >>css, ".c9 { position:relative; top:-%dpx; }" % (8*27)
        offset = {5:9*27+13, 9:18*27+27, 12:46*27+40}
        for i in range(5,15): #5..14
            if i in offset:
                o = offset[i]
            print >>css, ".cp%d { position:relative; top:-%dpx; }" % \
                                            (i, 2*i*27 - o)
        self.board_css = css.getvalue()

if __name__ == '__main__':
    print BoardCss().board_css

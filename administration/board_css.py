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
            print >>css,  rule % values
        print "#pDice1 { position:absolute; top:182px; left:338px; width:21px; height:21px; }"
        print "#pDice2 { position:absolute; top:182px; left:398px; width:21px; height:21px; }"
        print "#oDice1 { position:absolute; top:182px; left:129px; width:21px; height:21px; }"
        print "#oDice2 { position:absolute; top:182px; left:189px; width:21px; height:21px; }"
		print ".upperpips { position:relative; top:131px; left:43px; }"
		print ".lowerpips { position:relative; top:198px; left:43px; }"
        self.board_css = css.getvalue()

if __name__ == '__main__':
    print BoardCss().board_css

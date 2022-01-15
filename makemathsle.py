import re
template = open("maths.html").read();
sums = open("sums.json").read();
game = open("sumgame.js").read();
cut = False
for line in template.split('\n'):
  if line.strip() == '<!-- GAME -->':
    cut = True
    print '<script>';
    print game
    print '</script>';
  elif line.strip() == '<!-- END_GAME -->':
    cut = False
  elif line.strip()  ==  '// SUMS':
    print line
    print '  var sums=%s' % sums
    cut = True
  elif line.strip() == '// END_SUMS':
    cut = False
  if not cut:
    print line

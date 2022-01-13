import re
template = open("index.html").read();
words = open("words.json").read();
game = open("game.js").read();
cut = False
for line in template.split('\n'):
  if line.strip() == '<!-- GAME -->':
    cut = True
    print '<script>';
    print game
    print '</script>';
  elif line.strip() == '<!-- END_GAME -->':
    cut = False
  elif line.strip()  ==  '// WORDS':
    print line
    print '  var words=%s' % words
    cut = True
  elif line.strip() == '// END_WORDS':
    cut = False
  if not cut:
    print line

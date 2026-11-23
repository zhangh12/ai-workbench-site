# creation-hands.jpg

The two hands of Michelangelo's *The Creation of Adam* (Sistine Chapel ceiling, about 1511), the right one rebuilt
as a robot's hand.

- Cut from: `'Adam's Creation Sistine Chapel ceiling' by Michelangelo JBU33.jpg`, a photograph by Jörg Bittner Unna (2011),
  4810 x 3207, public domain.
  https://commons.wikimedia.org/wiki/File:%27Adam%27s_Creation_Sistine_Chapel_ceiling%27_by_Michelangelo_JBU33.jpg
  (SHA-1 of the file as downloaded on 2026-11-22: 54079e0ad7679bb05e0d9c276c06caa20ded3bc5)
- The part used: x 1480 to 2520, y 1262 to 1670 (1040 x 408).
- The left hand and the wall are the photograph as it is: no retouching, no colour correction. The picture is written
  at twice the size of the part used (2080 x 816), so that the drawn parts of the right hand are sharp.
- The right hand and forearm keep their place, their outline and their pose, and are rebuilt inside that outline as a
  robot's hand: a dark mechanism, light shells on it (one for each part of a finger, the back of the hand, the forearm)
  parted where the hand bends, pins at the joints, rods across the wrist, cables in an opening of the forearm. The
  shells are lit by the painting's own broad light and shade, and the gaps between the fingers are the painting's own
  dark lines. This is done by `make_art.py` (which also says exactly how); nothing is painted by hand and no image
  generator is used.

To make it again: download the photograph, then

```sh
python video/site/art/make_art.py "<the photograph>"        # --plain: the detail unchanged
```

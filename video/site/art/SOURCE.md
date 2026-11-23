# creation-hands.jpg

The two hands of Michelangelo's *The Creation of Adam* (Sistine Chapel ceiling, about 1511), the right one changed
into a mechanical hand.

- Cut from: `'Adam's Creation Sistine Chapel ceiling' by Michelangelo JBU33.jpg`, a photograph by Jörg Bittner Unna (2011),
  4810 x 3207, public domain.
  https://commons.wikimedia.org/wiki/File:%27Adam%27s_Creation_Sistine_Chapel_ceiling%27_by_Michelangelo_JBU33.jpg
  (SHA-1 of the file as downloaded on 2026-11-22: 54079e0ad7679bb05e0d9c276c06caa20ded3bc5)
- The part used: x 1480 to 2520, y 1262 to 1670 (1040 x 408).
- The left hand and the wall are the photograph as it is: no retouching, no colour correction, no enlarging.
- The right hand and forearm keep their place, their outline and the painting's own light and shade. Their colours are
  turned to steel, and joints, seams and bolts are drawn on them. This is done by `make_art.py` (which also says exactly
  how); nothing is painted by hand and no image generator is used.

To make it again: download the photograph, then

```sh
python video/site/art/make_art.py "<the photograph>"        # --plain: the detail unchanged
```

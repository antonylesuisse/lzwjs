
# lzwjs

LZW designed to encode long (above 4MB) javascript Strings for storage in
UTF-8 encoded files or strings (such as HTML or XML) in a subset of ascii.

We use a code formed by 3 base characters. The UTF-8 encoding restrict us to
characters below 0x80 which have 85.5% density (0x00-0x7F encoding: 0xxxxxxx
7/8 = 87.5%), as the density decrease above (i.e. 0x080-0x7FF encoding is
110xxxxx 10xxxxxx thus only 11/16 = 68.75%).

By default base=64 uses A-Z a-z 0-9 "-_", so that it is humanly
readable, printable, pastable and usable in xml attributes or URLs without
any escape.

The waste is only 12.5%, 1bit unused per byte, if you take into account the
UTF-8 restriction or 25%, 2bit unused per byte if you compare it to raw
binary files.

Optionally we also support the following bases:

- 86  default + "!#%()*+,./:;=?@[]^{|}~" safe extra printable ascii
- 87  above + " " space char
- 89  above + "$`" unsafe for js template string
- 120 above + [\x01\x1f] non null control chars
- 121 above + "\x1f" delete char, safe for xml text and attributes
- 124 above + "&'>" safe for javascript strings in html
- 125 above + "\00" null still safe for javascript strings in html
- 128 above + '<"\\' all ascii

Long enough strings are needed for the algorithm to be efficient as we need
to fill the code size which is base**3, (around 4MB for base64, around 30MB
for base=120, around 50MB for base 128)

Benchmarks relative to gzip/bzip2 confirms this. It's on par with gzip/bzip2
for once you take into account the base encoding.

Deeply Inspired by https://gist.github.com/revolunet/843889 lzw_encoder.js

https://github.com/antonylesuisse/lzwjs

Public domain. Antony Lesuisse. 2021.

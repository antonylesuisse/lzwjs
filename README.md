
# lzw64js

LZW designed to encode javascript Strings for storage in UTF-8 encoded files
or strings (such as HTML or XML), using a 18 bit code formed by 3 base64
characters.

The best density can only be reached with characters below 0x80 (0x00-0x7F
encoding: 0xxxxxxx 7/8 = 87.5% density), as the density decrease above
(0x080-0x7FF encoding: 110xxxxx 10xxxxxx 11/16 = 68.75% density).

We choose to waste a bit per byte to stay in the alphanumeric range
augmented by "-" and "_", so that it is humanly readable, printable,
pastable and usable in xml attributes or URLs without any escape.

The waste is only 12.5%, 1bit unused per byte, if you take into account the
UTF-8 restriction or 25%, 2bit unused per byte if you compare it to raw
binary files.

Benchmarks relative to gzip/bzip2 confirms this. It's on par with gzip/bzip2
for long enough strings (above 512kB) once you take into account the
encoding.

Deeply Inspired by https://gist.github.com/revolunet/843889 lzw_encoder.js

Public domain. Antony Lesuisse. 2021.

https://github.com/antonylesuisse/lzw64js


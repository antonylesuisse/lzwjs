//
// lzwjs
//
// LZW designed to encode long (above 4MB) javascript Strings for storage in
// UTF-8 encoded files or strings (such as HTML or XML) in a subset of ascii.
//
// We use a code formed by 3 base characters. The UTF-8 encoding restrict us to
// characters below 0x80 which have 85.5% density (0x00-0x7F encoding: 0xxxxxxx
// 7/8 = 87.5%), as the density decrease above (i.e. 0x080-0x7FF encoding is
// 110xxxxx 10xxxxxx thus only 11/16 = 68.75%).
//
// By default base=64 uses [A-Z] [a-z] [0-9] "-_", so that it is humanly
// readable, printable, pastable and usable in xml attributes or URLs without
// any escape.
//
// The waste is only 12.5%, 1bit unused per byte, if you take into account the
// UTF-8 restriction or 25%, 2bit unused per byte if you compare it to raw
// binary files.
//
// Optionally we also support the following bases:
//
// 86  default + "!#%()*+,./:;=?@[]^{|}~" safe extra printable ascii
// 87  above + " " space char
// 89  above + "$`" unsafe for js template string
// 120 above + [\x01\x1f] non null control chars
// 121 above + "\x1f" delete char, safe for xml text and attributes
// 124 above + "&'>" usafe for xml, safe for javascript strings in html
// 125 above + "\00" null still safe for javascript strings in html
// 128 above + '<"\\' all ascii
//
// Long enough strings are needed for the algorithm to be efficient as we need
// to fill the code size which is base**3, (around 4MB for base64, around 30MB
// for base=120, around 50MB for base 128)
//
// Benchmarks relative to gzip/bzip2 confirms this. It's on par with gzip/bzip2
// for once you take into account the base encoding.
//
// Deeply Inspired by https://gist.github.com/revolunet/843889 lzw_encoder.js
//
// https://github.com/antonylesuisse/lzwjs
//
// Public domain. Antony Lesuisse. 2021.

function lzw_encode(s,base=64) {
    if (!s) return s;
    var sym="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!#%()*+,./:;=?@[]^{|}~ $`";
    sym +=String.fromCodePoint(...Array(32).keys()).slice(1)+"\xf7&'>\0<\"\\";
    var d=new Map();
    var s=unescape(encodeURIComponent(s)).split("");
    var word=s[0];
    var num=256;
    var o=[];
    function out(word,num) {
        var key=word.length>1 ? d.get(word) : word.charCodeAt(0);
        o.push(sym[key%base],sym[(key/base|0)%base],sym[(key/base|0)/base|0]);
    }
    for (var i=1; i<s.length; i++) {
        var c=s[i];
        if (d.has(word+c)) {
            word+=c;
        } else {
            d.set(word+c,num++);
            out(word,num);
            word=c;
            if(num==(base*base*base)-1) {
                d.clear();
                num=256;
            }
        }
    }
    out(word);
    return o.join("");
}

function lzw_decode(s,base=64) {
    var sym="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!#%()*+,./:;=?@[]^{|}~ $`";
    sym +=String.fromCodePoint(...Array(32).keys()).slice(1)+"\xf7&'>\0<\"\\";
    var symd={};
    for(var i=0; i<base; i++){
        symd[sym.charAt(i)]=i;
    }
    var d=new Map();
    var num=256;
    var word=String.fromCharCode(symd[s[0]]+(symd[s[1]]*base)+(symd[s[2]]*base*base));
    var prev=word;
    var o=[word];
    for(var i=3; i<s.length; i+=3) {
        var key=symd[s[i]]+(symd[s[i+1]]*base)+(symd[s[i+2]]*base*base);
        word=key<256 ? String.fromCharCode(key) : d.has(key) ? d.get(key) : word+word.charAt(0);
        o.push(word);
        d.set(num++, prev+word.charAt(0));
        prev=word;
        //if(num==(1<<18)-1) {
          if(num==(base*base*base)-1) {
            d.clear();
            num=256;
        }
    }
    return decodeURIComponent(escape(o.join("")));
}

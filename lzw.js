//
// lzwjs
//
// LZW designed to encode javascript Strings for storage in UTF-8 encoded files
// or strings (such as HTML or XML) in a subset of ascii.
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
// The waste is only 14.2% log(64)/log(128), 1bit unused per byte, if you take
// into account the UTF-8 restriction or 25% log(64)/log(256), 2bit unused per
// byte if you compare it to raw binary files.
//
// It also supports bases above 64:
//
// 86  default + "!#%()*+,./:;=?@[]^{|}~" safe extra printable ascii
// 87  above + " " space char
// 89  above + "$`" unsafe for js ``
// 119 above + control chars without \0\r\n with \xf7 safe for xml
// 122 above + "&'>" usafe for xml, unsafe for js ''
// 123 above + "\00" null, still safe for js "" in html
// 128 above + '\n\r<"\\' all ascii
//
// Long enough strings are needed for the algorithm to be efficient as we need
// to fill the code size which is base**3, (around 4MB for base64, around 30MB
// for base=120, around 50MB for base 128)
//
// Benchmarks relative to gzip/bzip2 confirms this. It's on par with gzip/bzip2
// for once you take into account the base encoding waste log(base)/log(256).
//
// Deeply Inspired by https://gist.github.com/revolunet/843889 lzw_encoder.js
//
// https://github.com/antonylesuisse/lzwjs
//
// Public domain. Antony Lesuisse. 2021.

function lzw_encode(s,base=64) {
    if (!s) return s;
    var sym="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!#%()*+,./:;=?@[]^{|}~ $`";
    sym +="\1\2\3\4\5\6\7\b\t\v\f\16\17\20\21\22\23\24\25\26\27\30\31\32\33\34\35\36\37\xf7&'>\0\n\r\"<\\";
    var size=base*base*base;
    var d=new Map();
    var num=256;
    var logb=Math.log2(base);
    var s=unescape(encodeURIComponent(s)).split("");
    var word=s[0];
    var o=[];
    function pack(word) {
        var key=word.length>1 ? d.get(word) : word.charCodeAt(0);
        for(var n=(Math.log2(num)/logb|0)+1; n; n--) {
            o.push(sym[key%base]);
            key=(key/base|0);
        }
    }
    for (var i=1; i<s.length; i++) {
        var c=s[i];
        if (d.has(word+c)) {
            word+=c;
        } else {
            d.set(word+c,num);
            pack(word);
            word=c;
            if(++num==size-1) {
                d.clear();
                num=256;
            }
        }
    }
    pack(word);
    return o.join("");
}

function lzw_decode(s,base=64) {
    var sym="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!#%()*+,./:;=?@[]^{|}~ $`";
    sym +="\1\2\3\4\5\6\7\b\t\v\f\16\17\20\21\22\23\24\25\26\27\30\31\32\33\34\35\36\37\xf7&'>\0\n\r\"<\\";
    var size=base*base*base;
    var symd={};
    for(var i=0; i<base; i++){
        symd[sym.charAt(i)]=i;
    }
    var d=new Map();
    var num=257;
    var logb=Math.log2(base);
    var logn=8/logb|0;
    var i=0;
    function unpack(pos=0) {
        return symd[s[i++]]+(pos==logn ? 0 : base*unpack(pos+1));
    }
    var word=String.fromCharCode(unpack());
    var prev=word;
    var o=[word];
    while(i<s.length) {
        logn=Math.log2(num++)/logb|0;
        var key=unpack();
        word=key<256 ? String.fromCharCode(key) : d.has(key) ? d.get(key) : word+word.charAt(0);
        o.push(word);
        if(num==size-1) {
            d.clear();
            num=256;
        }
        d.set(num-2,prev+word.charAt(0));
        prev=word;
    }
    return decodeURIComponent(escape(o.join("")));
}

if(typeof window==='undefined') {
    Object.assign(exports,{lzw_encode, lzw_decode});
}

//
// lzw64js
//
// LZW designed to encode javascript Strings for storage in UTF-8 encoded files
// or strings (such as HTML or XML), using a 18 bit code formed by 3 base64
// characters.
//
// The best density can only be reached with characters below 0x80 (0x00-0x7F
// encoding: 0xxxxxxx 7/8 = 87.5% density), as the density decrease above
// (0x080-0x7FF encoding: 110xxxxx 10xxxxxx 11/16 = 68.75% density).
//
// We choose to waste a bit per byte to stay in the alphanumeric range
// augmented by "-" and "_", so that it is humanly readable, printable,
// pastable and usable in xml attributes or URLs without any escape.
//
// The waste is only 12.5%, 1bit unused per byte, if you take into account the
// UTF-8 restriction or 25%, 2bit unused per byte if you compare it to raw
// binary files.
//
// Benchmarks relative to gzip/bzip2 confirms this. It's on par with gzip/bzip2
// for long enough strings (above 512kB) once you take into account the
// encoding.
//
// Deeply Inspired by https://gist.github.com/revolunet/843889 lzw_encoder.js
//
// Public domain. Antony Lesuisse. 2021.
//
// https://github.com/antonylesuisse/lzw64js
//

function lzw64_encode(s) {
    if (!s) return s;
    var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var d=new Map();
    var s=unescape(encodeURIComponent(s)).split("");
    var word=s[0];
    var num=256;
    var o=[];
    function out(word,num) {
        var key=word.length>1 ? d.get(word) : word.charCodeAt(0);
        o.push(b64[key&0x3f]);
        o.push(b64[(key>>6)&0x3f]);
        o.push(b64[(key>>12)&0x3f]);
    }
    for (var i=1; i<s.length; i++) {
        var c=s[i];
        if (d.has(word+c)) {
            word+=c;
        } else {
            d.set(word+c,num++);
            out(word,num);
            word=c;
            if(num==(1<<18)-1) {
                d.clear();
                num=256;
            }
        }
    }
    out(word);
    return o.join("");
}

function lzw64_decode(s) {
    var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var b64d={};
    for(var i=0; i<64; i++){
        b64d[b64.charAt(i)]=i;
    }
    var d=new Map();
    var num=256;
    var word=String.fromCharCode(b64d[s[0]]+(b64d[s[1]]<<6)+(b64d[s[2]]<<12));
    var prev=word;
    var o=[word];
    for(var i=3; i<s.length; i+=3) {
        var key=b64d[s[i]]+(b64d[s[i+1]]<<6)+(b64d[s[i+2]]<<12);
        word=key<256 ? String.fromCharCode(key) : d.has(key) ? d.get(key) : word+word.charAt(0);
        o.push(word);
        d.set(num++, prev+word.charAt(0));
        prev=word;
        if(num==(1<<18)-1) {
            d.clear();
            num=256;
        }
    }
    return decodeURIComponent(escape(o.join("")));
}

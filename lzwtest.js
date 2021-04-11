// Tests
if(typeof window==='undefined') {
    if(process.argv[1].match("lzwtest.js$")) {
        function randint(min,max) {
            return Math.floor(Math.random()*(max-min+1))+min;
        }
        function randstr(len,min,max) {
            return Array.from(Array(len).keys()).map(function(){return String.fromCodePoint(randint(min,max))}).join("");
        }

        var {lzw_encode,lzw_decode} = require("./lzw.js");

        var s=randstr(8,97,122);
        var s=s+" "+s.slice(4)+" "+s;
        var z=lzw_encode(s);
        var d=lzw_decode(z);
        console.log("s(%d)=%j\nz(%d)=%j\nd(%s)=%j\ncmp=%j",s.length,s,z.length,z,d.length,d,s==d);

        var s=randstr(100,0x20,0x7e);
        var s=Array.from(Array(10000).keys()).map(function(){return s}).join("");
        var z=lzw_encode(s,16);
        var d=lzw_decode(z,16);
        console.log("s(%d) z(%d) d(%s) cmp=%j",s.length,z.length,d.length,s==d);

        var s=randstr(25000,0x1F600,0x1FBFF);
        var z=lzw_encode(s,26);
        var d=lzw_decode(z,26);
        console.log("s(%d) z(%d) d(%s) cmp=%j",s.length,z.length,d.length,s==d);
    }
}

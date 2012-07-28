var log = function (msg, obj) {
    if (!console) return false;
    if (msg) console.log(msg);
    if (obj) console.dir(obj);
};
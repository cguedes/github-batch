//////////////////////////////
// File format (sample)
//
//   G00 cguedes
//   G01 cguedes bart
//   G02 lisa
//   # G04 foo bar             this line will be ignored
//
//////////////////////////////
module.exports = function(filename, cb) {
    var fs = require("fs");
    var students = [];

    fs.readFile(filename, "utf-8", function read(err, data) {
        if (err) return cb(err); 

        data.split("\r\n").forEach(function(line) {
            if(line.charAt(0) == "#") return;

            var parts = line.split(" ");
            var group = parts.shift().trim();;
            students = students.concat(parts.map(function(u) { return { group: group, user: u.trim() } }));
             
            // with ecmascript 6 :-)
            // students = students.concat(parts.map(u => { group: group, user: u.trim() }));
        });
        cb(null, students);
    });

}


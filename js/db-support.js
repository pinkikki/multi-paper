const NeDB = require('nedb-promise');
const db = new NeDB({
    filename: "./db/master.db",
    autoload: true
});

exports.select = function () {
    return db.find({});
};

exports.update = function (conditions, no, conTtt, withTtt) {
    db.update(
        {no: conditions["no"]},
        {$set: {no: no, con_ttt: conTtt, with_ttt: withTtt}}
    );
};
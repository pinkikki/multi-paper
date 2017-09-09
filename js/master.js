const $ = require('jquery');
const db = require('../js/db-support.js');

$(function () {

    select();
    $("#master_update").on("click", async function () {

        let paperNo = $("#paper_no").val();
        let conTtt = $("#con_ttt").val();
        let withTtt = $("#with_ttt").val();

        let result = await db.select();
        let dataRow = result[0];
        let intpaperNo = parseInt(paperNo);
        intpaperNo = isNaN(intpaperNo) ? 0 : intpaperNo;
        let floatconTtt = parseFloat(conTtt);
        floatconTtt = isNaN(floatconTtt) ? 0 : floatconTtt;
        let floatwithTtt = parseFloat(withTtt);
        floatwithTtt = isNaN(floatwithTtt ) ? 0 : floatwithTtt;
        await db.update(dataRow, intpaperNo, floatconTtt, floatwithTtt);
        select();
        alert("update");
    })
});

async function select() {
    let result = await db.select();
    let dataRow = result[0];
    $("#paper_no").val(dataRow["no"]);
    $("#con_ttt").val(dataRow["con_ttt"]);
    $("#with_ttt").val(dataRow["with_ttt"]);
}

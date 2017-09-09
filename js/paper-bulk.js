const $ = require('jquery');
const fs = require('fs-extra');
const path = require('path');
const moji = require('moji');
const XlsxTemplate = require('xlsx-template');
const BigNumber = require('bignumber.js');
const db = require('../js/db-support.js');

let rowCount = 2;
$(function () {

    $('.btn-danger').on('click', function () {
        $(this).closest('tr').remove();
    });
    $('#types').on('change', function () {
        rowCount++;
        let el = $('#row_template').clone().css('display', 'table-row').attr('id', '');
        let elAmount = el.find('input[name=amount]');
        let elconTtt = el.find('input[name=con_ttt]');
        let elwithTtt = el.find('input[name=with_ttt]')

        elAmount.attr('name', 'row' + rowCount + 'amount');
        elconTtt.attr('name', 'row' + rowCount + 'con_ttt');
        elwithTtt.attr('name', 'row' + rowCount + 'with_ttt');

        if ($(this).val() === 2) {
            $('#input_template').clone().css('display', 'inline').appendTo(el.children('#type'));
        } else {
            el.children('#type').text($(this).children('option:selected').text());
        }

        if ($(this).val() === 1) {
            elconTtt.eq(1).prop('checked', true);
            elwithTtt.eq(1).prop('checked', true);
        }
        el.insertBefore('#row_template');
        el.find('.btn-danger').on("click", function () {
            $(this).closest('tr').remove();
        })
    });
    $("#paper_create").on("click", function () {

        let people = $("#people").val();
        let opponent = $("#opponent").val();
        let caseName = $("#case_name").val();
        let lawyer = $("#lawyer").val();

        fs.readFile(path.join(__dirname, '../template/paper_template.xlsx'), async function (err, data) {
            let template = new XlsxTemplate(data);

            let sheetNumber = 1;
            let types = [];
            let sum = 0;
            let typeList = "";
            let rows = $("table tr");
            let typesForFileName = "";
            let result = await db.select();
            let dataRow = result[0];
            let conTttPercent = dataRow["con_ttt"];
            let withTttPercent = dataRow["with_ttt"];

            rows.slice(1, rows.length - 1).each(function (i) {
                let columns = $(this).children('td');
                let type;
                let elInput = columns.eq(0).find('input');
                if (elInput.length) {
                    type = elInput.val();
                } else {
                    type = columns.eq(0).text();
                }
                let amount = columns.eq(1).find('input').val();
                let conTtt = columns.eq(2).find('input[type=radio]:checked').val();
                let withTtt = columns.eq(3).find('input[type=radio]:checked').val();
                let intAmount = Number(amount);
                sum += intAmount;
                types.push({name: type, amount: formatForAmount(intAmount)});

                if (rows.length > 1) {
                    if (rows.length - 1 == i) {
                        typeList += "XX";
                    } else {
                        typeList += "，";
                    }
                }
                typeList += type;

                if (conTtt === "1") {
                    let conTttAmount = new BigNumber(intAmount).times(conTttPercent).floor().toNumber();
                    sum += conTttAmount;
                    types.push({name: type + "XXX", amount: formatForAmount(conTttAmount)});
                }
                if (withTtt === "1") {
                    let withTttAmount = new BigNumber(intAmount).times(withTttPercent).floor().toNumber();
                    sum -= withTttAmount;
                    types.push({name: type + "XXXX", amount: formatForAmount(withTttAmount, true)});
                }

                if (i !== 0) {
                    typesForFileName += "・";
                }
                typesForFileName += type;

            });

            let no = dataRow["no"];
            let values = {
                no: "XXX：" + formatForpaperNo(no),
                people: people + "XXX",
                contents: "XXX" + opponent + "XXX" + caseName + "XXX" + typeList + "XXX",
                types: types,
                sum: formatForAmount(sum)
            };
            template.substitute(sheetNumber, values);

            let now = new Date();
            let jaCal = now.toLocaleDateString("ja-JP-u-ca-japanese", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
            let dir = '../' + jaCal.substring(0, (jaCal.indexOf("年") + 1)) + "XXX";
            let lawyerForFileName = "";
            if (lawyer) {
                lawyerForFileName = "（" + lawyer + "）";
            }
            let fileName = jaCal.substring(2, jaCal.indexOf("年")) + "-" + padForpaperNo(no) + " " + people + lawyerForFileName + "（" + typesForFileName + "）.xlsx";
            fs.mkdirsSync(dir);
            fs.writeFileSync(dir + "/" + fileName, template.generate(), 'binary');
            await db.update(dataRow, no + 1, dataRow["con_ttt"], dataRow["with_ttt"]);
            alert("XXX create");

        });
    })
});

function padForpaperNo(no) {
    return ("000" + no.toString()).slice(-4);
}

function formatForpaperNo(no) {
    return moji(padForpaperNo(no)).convert('HE', 'ZE').toString();
}

function formatForAmount(amount, isMinus) {
    let formatedAmount = moji(Number(amount).toLocaleString()).convert('HE', 'ZE').toString();
    return isMinus ? "XX" + formatedAmount : "XXXX" + formatedAmount;
}
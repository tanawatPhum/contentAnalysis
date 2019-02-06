var http = require('http')
var textract = require('textract')
const filePath = "https://docs.google.com/document/export?format=docx&id=1nqi-j6qC0JPMHHrntENvyvOMRjty8mx1iu0699Kx13k&token=AC4w5VjzJhLSFZL9Xu2JLkJHIIKXF89t0g%3A1548318895286&ouid=110574417141925153093&includes_info_params=true"
config = { preserveLineBreaks: false, encoding: 'raw_unicode_escape' }

var mammoth = require("mammoth");
const https = require('https');
var request = require('request');

var unzipper = require('unzipper');

var WordExtractor = require("word-extractor");
var extractor = new WordExtractor();
var extracted = extractor.extract("MU_011.docx");
const listOfTitlesMU_01_0_11 = ['1.  ชื่อโครงการ', '2.  ชื่อผู้ขอทุน', '3.  ชื่อผู้ร่วมกลุ่มวิจัย', '4. สัดส่วนการมีส่วนร่วมในผลงาน', '5. ความสำคัญ ที่มาของปัญหาที่ทำการวิจัยและการทบทวนเอกสารที่เกี่ยวข้อง', '6. คำถามวิจัย/สมมติฐานการวิจัย'];
const listOfSubTitlesMU_01_0_11 = ['2.1 สถานภาพ', '2.2 วัน/เดือน/ปีเกิด', '2.3 ประเภททุนที่เสนอขอ', '2.4 ผลผลิต'];
const listOfLabelsMU_01_0_11 = ['ภาษาไทย', 'ปีงบประมาณที่ขอทุน', 'ประเภททุนที่เสนอขอ', 'สถานภาพ', 'ผลผลิต', 'ชื่อ-นามสกุล', 'ชื่อ-สกุล', 'อายุ', 'วัน/เดือน/ปีเกิด'];
// const listOfLabelTables_MU_01_0_11 = ['เดือนที่', 'กิจกรรม (รายการที่วางแผนจะทำ)', 'ผลงานที่คาดว่าจะได้รับ (outputs)*', 'ผู้รับผิดชอบ']
var getDocumentProps = require('office-document-properties')
var parser = require('xml2json');
var unzip = require('unzip');
// var out = fs.createWriteStream('MU_011.docx');
const fs = require('fs');
var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser');
// var docx2html = require('docx2html')
// docx2html("MU_011.docx").then(function(html) {
//     console.log(html.toString())
// })

// fs.createReadStream('MU_011.docx')
//     .pipe(unzipper.Extract({ path: 'wordXml' }));
var mammoth = require("mammoth");

mammoth.convertToHtml({ path: "MU_011.docx" })
    .then(function(result) {
        var html = result.value; // The generated HTML
        var jsonOfData = {}
            // var messages = result.messages; // Any messages, such as warnings during conversion
        var allTables = html.match(/<table>(.*?)<\/table>/g)
        allTables.forEach((table) => {
            table = table.replace(/<table>/, "<table id='tableDoc'>")
            $ = cheerio.load(table)
            cheerioTableparser($);
            var tableData = $("#tableDoc").parsetable(true, true, true);
            console.log("tableData", tableData)
        })

        var valueOfAllTables = []
            // console.log("allTables", allTables)
            // allTables.forEach((table) => {
            //     var headerOfTable = []
            //     var allRows = table.match(/<tr>(.*?)<\/tr>/g)
            //     if (allRows) {
            //         allRows.forEach((row, indexRow) => {
            //             allRecords = row.match(/<td>(.*?)<\/td>/g)
            //             jsonOfData = {}
            //             if (allRecords) {
            //                 allRecords.forEach((record, indexRecord) => {
            //                     var rawData = record.replace(/<(.*?)>/g, "")
            //                     if (rawData) {
            //                         if (indexRow == 0) {
            //                             headerOfTable.push(rawData)
            //                         } else {
            //                             jsonOfData[headerOfTable[indexRecord]] = rawData
            //                         }
            //                     }
            //                 })
            //             }

        //             valueOfAllTables.push(jsonOfData)
        //         })
        //     }

        // })
        //  console.log("valueOfAllTables", valueOfAllTables)
        // console.log(x)
    })
    .done();


// fs.readFile('wordXml/word/document.xml', function(err, data) {
//     var json = parser.toJson(data);
//     console.log("to json ->", json);
// });
// const fs = require('fs');
// var parser = require('xml2json');
// fs.readFile('mynewfile3.xml', function(err, data) {
//     console.log(data)
//         // var json = parser.toJson(data);
//         // console.log("to json ->", json);
//         // fs.writeFile('mynewfile3.pdf', data, function(err) {
//         //     if (err) throw err;
//         //     console.log('Saved!');
//         // });
//         // console.log(err)
//         // console.log(data)
//         // res.writeHead(200, {'Content-Type': 'text/html'});
//         // res.write(data);
//         // res.end();
// });
mammoth.extractRawText({ path: "MU_011.docx" })
    .then(function(result) {
        var text = result.value; // The raw text
        // text = doc.getBody();

        text = preProcessDocument(text)
            //console.log("text==>", text)
        const listOfTitles = listOfTitlesMU_01_0_11; //['ชื่อโครงการ', 'ชื่อผู้ขอทุน', 'ชื่อผู้ร่วมกลุ่มวิจัย', 'สัดส่วนการมีส่วนร่วมในผลงาน', 'ความสำคัญ ที่มาของปัญหาที่ทำการวิจัยและการทบทวนเอกสารที่เกี่ยวข้อง']
        const listOfSubTitles = listOfSubTitlesMU_01_0_11; //['สถานภาพ', 'วัน/เดือน/ปีเกิด', 'ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย', 'ประวัติการศึกษา', 'ระบุสาขาวิชาที่เชี่ยวชาญ', 'ผลงานวิจัยของหัวหน้ากลุ่มวิจัยได้รับการตีพิมพ์ระดับนานาชาติที่มีการอ้างอิง', 'ผลงานวิจัยที่ได้รับการจดสิทธิบัตร', 'ระบุชื่อโครงการที่เคยได้รับและกำลังได้รับทุนจากแหล่งทุนอื่น ๆ']
        const listOfLabels = listOfLabelsMU_01_0_11; //["ภาษาไทย", "ภาษาอังกฤษ", "ตำแหน่งวิชาการ", "สังกัดภาควิชา", "คณะ/สถาบัน", "โทรศัพท์", "โทรสาร", "E-mail", "วัน/เดือน/ปีเกิด", "อายุ", "ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย", "ประวัติการศึกษา", "ปริญญาตรีสาขา", "ปริญญาโทสาขา", "ปริญญาเอกสาขา", "สถาบันที่สำเร็จการศึกษา", "วุฒิอื่น ๆ", "ระบุสาขาวิชาที่เชี่ยวชาญ", "Citation",
        //     "จำนวน h index", "ชื่อโครงการ", "ชื่อแหล่งทุน", "จำนวนเงินทุนวิจัยที่ได้รับ", "ช่วงเวลาที่ได้รับทุน", "ถึงปี", "ปีที่เริ่มปฏิบัติงาน", "นับถึงปัจจุบันเป็นเวลา", "ชื่อ-นามสกุล", "และ ภาษาอังกฤษ", "ช่วงเวลาที่ได้รับทุนปี", "ปี", "สถานภาพ", "ชื่อ-สกุล", "สัดส่วน", "(ลายเซ็น)"
        // ]

        // const listOfTitles = ['ชื่อโครงการ', 'ชื่อผู้ขอทุน', 'ชื่อผู้ร่วมกลุ่มวิจัย', 'สัดส่วนการมีส่วนร่วมในผลงาน', 'ความสำคัญ ที่มาของปัญหาที่ทำการวิจัยและการทบทวนเอกสารที่เกี่ยวข้อง']
        // const listOfSubTitles = ['สถานภาพ', 'วัน/เดือน/ปีเกิด', 'ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย', 'ประวัติการศึกษา', 'ระบุสาขาวิชาที่เชี่ยวชาญ', 'ผลงานวิจัยของหัวหน้ากลุ่มวิจัยได้รับการตีพิมพ์ระดับนานาชาติที่มีการอ้างอิง', 'ผลงานวิจัยที่ได้รับการจดสิทธิบัตร', 'ระบุชื่อโครงการที่เคยได้รับและกำลังได้รับทุนจากแหล่งทุนอื่น ๆ']
        // const listOfLabels = ["ภาษาไทย", "ภาษาอังกฤษ", "ตำแหน่งวิชาการ", "สังกัดภาควิชา", "คณะ/สถาบัน", "โทรศัพท์", "โทรสาร", "E-mail", "วัน/เดือน/ปีเกิด", "อายุ", "ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย", "ประวัติการศึกษา", "ปริญญาตรีสาขา", "ปริญญาโทสาขา", "ปริญญาเอกสาขา", "สถาบันที่สำเร็จการศึกษา", "วุฒิอื่น ๆ", "ระบุสาขาวิชาที่เชี่ยวชาญ", "Citation",
        //     "จำนวน h index", "ชื่อโครงการ", "ชื่อแหล่งทุน", "จำนวนเงินทุนวิจัยที่ได้รับ", "ช่วงเวลาที่ได้รับทุน", "ถึงปี", "ปีที่เริ่มปฏิบัติงาน", "นับถึงปัจจุบันเป็นเวลา", "ชื่อ-นามสกุล", "และ ภาษาอังกฤษ", "ช่วงเวลาที่ได้รับทุนปี", "ปี", "สถานภาพ", "ชื่อ-สกุล", "สัดส่วน", "(ลายเซ็น)"
        // ]
        const listOfSymbols = [/☒/, /☐/]
        var listOfContents = identityDocument(text, listOfTitles, listOfSubTitles)
            //console.log("listOfContents====> ", listOfContents)
        var listOfvalues = extractDocument(listOfContents, listOfLabels, listOfSymbols)

        listOfvalues.forEach((ev) => {
                console.log("title==> ", ev.title)
                ev.content.valueList.forEach((ev) => {
                        console.log("results=> ", ev)
                    })
                    // console.log(ev.subContents)
                ev.subContent.forEach((subContent) => {

                    subContent.valueList.forEach((ev) => {
                        console.log("results=> ", ev)
                    })
                })
            })
            // var messages = result.messages;
    })
    .done();

// extracted.then(function(doc) {
//     var text = doc.getBody();

//     text = preProcessDocument(text)
//         // console.log("text==>", text)
//     const listOfTitles = listOfTitlesMU_01_0_11; //['ชื่อโครงการ', 'ชื่อผู้ขอทุน', 'ชื่อผู้ร่วมกลุ่มวิจัย', 'สัดส่วนการมีส่วนร่วมในผลงาน', 'ความสำคัญ ที่มาของปัญหาที่ทำการวิจัยและการทบทวนเอกสารที่เกี่ยวข้อง']
//     const listOfSubTitles = listOfSubTitlesMU_01_0_11; //['สถานภาพ', 'วัน/เดือน/ปีเกิด', 'ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย', 'ประวัติการศึกษา', 'ระบุสาขาวิชาที่เชี่ยวชาญ', 'ผลงานวิจัยของหัวหน้ากลุ่มวิจัยได้รับการตีพิมพ์ระดับนานาชาติที่มีการอ้างอิง', 'ผลงานวิจัยที่ได้รับการจดสิทธิบัตร', 'ระบุชื่อโครงการที่เคยได้รับและกำลังได้รับทุนจากแหล่งทุนอื่น ๆ']
//     const listOfLabels = listOfLabelsMU_01_0_11; //["ภาษาไทย", "ภาษาอังกฤษ", "ตำแหน่งวิชาการ", "สังกัดภาควิชา", "คณะ/สถาบัน", "โทรศัพท์", "โทรสาร", "E-mail", "วัน/เดือน/ปีเกิด", "อายุ", "ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย", "ประวัติการศึกษา", "ปริญญาตรีสาขา", "ปริญญาโทสาขา", "ปริญญาเอกสาขา", "สถาบันที่สำเร็จการศึกษา", "วุฒิอื่น ๆ", "ระบุสาขาวิชาที่เชี่ยวชาญ", "Citation",
//     //     "จำนวน h index", "ชื่อโครงการ", "ชื่อแหล่งทุน", "จำนวนเงินทุนวิจัยที่ได้รับ", "ช่วงเวลาที่ได้รับทุน", "ถึงปี", "ปีที่เริ่มปฏิบัติงาน", "นับถึงปัจจุบันเป็นเวลา", "ชื่อ-นามสกุล", "และ ภาษาอังกฤษ", "ช่วงเวลาที่ได้รับทุนปี", "ปี", "สถานภาพ", "ชื่อ-สกุล", "สัดส่วน", "(ลายเซ็น)"
//     // ]

//     // const listOfTitles = ['ชื่อโครงการ', 'ชื่อผู้ขอทุน', 'ชื่อผู้ร่วมกลุ่มวิจัย', 'สัดส่วนการมีส่วนร่วมในผลงาน', 'ความสำคัญ ที่มาของปัญหาที่ทำการวิจัยและการทบทวนเอกสารที่เกี่ยวข้อง']
//     // const listOfSubTitles = ['สถานภาพ', 'วัน/เดือน/ปีเกิด', 'ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย', 'ประวัติการศึกษา', 'ระบุสาขาวิชาที่เชี่ยวชาญ', 'ผลงานวิจัยของหัวหน้ากลุ่มวิจัยได้รับการตีพิมพ์ระดับนานาชาติที่มีการอ้างอิง', 'ผลงานวิจัยที่ได้รับการจดสิทธิบัตร', 'ระบุชื่อโครงการที่เคยได้รับและกำลังได้รับทุนจากแหล่งทุนอื่น ๆ']
//     // const listOfLabels = ["ภาษาไทย", "ภาษาอังกฤษ", "ตำแหน่งวิชาการ", "สังกัดภาควิชา", "คณะ/สถาบัน", "โทรศัพท์", "โทรสาร", "E-mail", "วัน/เดือน/ปีเกิด", "อายุ", "ปีที่เริ่มปฏิบัติงานในมหาวิทยาลัย", "ประวัติการศึกษา", "ปริญญาตรีสาขา", "ปริญญาโทสาขา", "ปริญญาเอกสาขา", "สถาบันที่สำเร็จการศึกษา", "วุฒิอื่น ๆ", "ระบุสาขาวิชาที่เชี่ยวชาญ", "Citation",
//     //     "จำนวน h index", "ชื่อโครงการ", "ชื่อแหล่งทุน", "จำนวนเงินทุนวิจัยที่ได้รับ", "ช่วงเวลาที่ได้รับทุน", "ถึงปี", "ปีที่เริ่มปฏิบัติงาน", "นับถึงปัจจุบันเป็นเวลา", "ชื่อ-นามสกุล", "และ ภาษาอังกฤษ", "ช่วงเวลาที่ได้รับทุนปี", "ปี", "สถานภาพ", "ชื่อ-สกุล", "สัดส่วน", "(ลายเซ็น)"
//     // ]
//     const listOfSymbols = [/☒/, /☐/]
//     var listOfContents = identityDocument(text, listOfTitles, listOfSubTitles)
//     console.log("listOfContents====> ", listOfContents)
//     var listOfvalues = extractDocument(listOfContents, listOfLabels, listOfSymbols)

//     listOfvalues.forEach((ev) => {
//         console.log("title==> ", ev.title)
//         ev.content.valueList.forEach((ev) => {
//                 console.log("results=> ", ev)
//             })
//             // console.log(ev.subContents)
//         ev.subContent.forEach((subContent) => {

//             subContent.valueList.forEach((ev) => {
//                 console.log("results=> ", ev)
//             })
//         })
//     })
// });

function preProcessDocument(text) {
    //cleansing whitespace and newline
    text = text.replace(/\r?\n|\r/g, "")
        //cleansing dot
    text = text.replace(/(\.{2,}|…)/g, "    ")
    return text
}

function identityDocument(text, listOfTitles, listOfSubTitles) {
    var listOfTitles2 = JSON.parse(JSON.stringify(listOfTitles))
    var listOfSubTitles2 = JSON.parse(JSON.stringify(listOfSubTitles))

    var listOfContents = []
    var resultBoundaryOfLastTile = null
    listOfTitles.forEach((title1, titleIndex) => {
        //console.log(title1)
        var listSubcontent = []
        var firstOfSubTitle = null
        var indexOfTile = -1
        var indexOfLastSubTile = -1
        var resultBoundaryOfContent = null
        listOfTitles2.forEach((title2) => {
            if (title1 != title2) {
                // title2 = title2.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                // console.log(title2)
                // var rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?([^\\d])" + title1 + ").*((\\d{1,2})(\\.{1})?([^\\d])\\" + title2 + ")")
                // var rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?(\\s)+" + title1 + ").*((\\d{1,2})(\\.{1})?(\\s)+" + title2 + ")")
                var rexFindBoundaryOfTitle = new RegExp("(?<=" + title1 + ").*(" + title2 + ")")
                    //console.log(text)
                    // console.log(rexFindBoundaryOfTitle)
                    // console.log(text)
                var contentOfAllTitle = text.match(rexFindBoundaryOfTitle)
                    //  console.log(contentOfAllTitle)
                if (contentOfAllTitle) {
                    //console.log(contentOfAllTitle)
                    // var rexFindTitle = new RegExp("(\\d{1,2})(\\.{1})?([^\\d])" + title2)
                    var rexFindTitle = new RegExp(title2)
                    var contentOfTitle = contentOfAllTitle[0].match(rexFindTitle)

                    if (contentOfTitle) {
                        //console.log("xxx", contentOfTitle)
                        if (indexOfTile == -1) {
                            indexOfTile = contentOfAllTitle[0].indexOf(contentOfTitle[0])
                            resultBoundaryOfContent = title2
                            indexOfLastSubTile = contentOfAllTitle[0].indexOf(contentOfTitle[0])
                            resultBoundaryOfLastTile = title2;
                        } else {
                            if (indexOfTile > contentOfAllTitle[0].indexOf(contentOfTitle[0])) {
                                indexOfTile = contentOfAllTitle[0].indexOf(contentOfTitle[0])
                                resultBoundaryOfContent = title2
                            }
                            if (indexOfLastSubTile < contentOfAllTitle[0].indexOf(contentOfTitle[0])) {
                                indexOfLastSubTile = contentOfAllTitle[0].indexOf(contentOfTitle[0])
                                resultBoundaryOfLastTile = title2;
                            }
                        }
                    }

                }
            } else {
                var rexFindBoundaryOfTitle = null
                    // if (titleIndex == listOfTitles.length - 1 && resultBoundaryOfLastTile) {
                    //     // console.log(resultBoundaryOfLastTile)
                    //     rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?\\s?" + resultBoundaryOfLastTile + ").*")
                    // } else {
                    //     rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?([^\\d])\\s?" + title1 + ").*(?=(\\d{1,2})(\\.{1})?([^\\d])\\s?" + resultBoundaryOfContent + ")")
                    // }
                    // rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?([^\\d])(\\s)+" + title1 + ").*(?=(\\d{1,2})(\\.{1})?([^\\d])(\\s)+" + resultBoundaryOfContent + ")")
                rexFindBoundaryOfTitle = new RegExp("(?<=(" + title1 + ")).*(?=" + resultBoundaryOfContent + ")")
                    //console.log("content0", rexFindBoundaryOfTitle)
                var content = text.match(rexFindBoundaryOfTitle)

                var indexOfLastSubTile = -1;
                var resultBoundaryOfLastSubTile = null;
                if (content) {}
            }
        })

        if (resultBoundaryOfContent || (titleIndex == listOfTitles.length - 1 && resultBoundaryOfLastTile)) {

            var rexFindBoundaryOfTitle = null
                // if (titleIndex == listOfTitles.length - 1 && resultBoundaryOfLastTile) {
                //     // console.log(resultBoundaryOfLastTile)
                //     rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?\\s?" + resultBoundaryOfLastTile + ").*")
                // } else {
                //     rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?([^\\d])\\s?" + title1 + ").*(?=(\\d{1,2})(\\.{1})?([^\\d])\\s?" + resultBoundaryOfContent + ")")
                // }
                // rexFindBoundaryOfTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?([^\\d])(\\s)+" + title1 + ").*(?=(\\d{1,2})(\\.{1})?([^\\d])(\\s)+" + resultBoundaryOfContent + ")")
            rexFindBoundaryOfTitle = new RegExp("(?<=(" + title1 + ")).*(?=" + resultBoundaryOfContent + ")")
                //console.log("content0", rexFindBoundaryOfTitle)
            var content = text.match(rexFindBoundaryOfTitle)

            var indexOfLastSubTile = -1;
            var resultBoundaryOfLastSubTile = null;
            if (content) {

                listOfSubTitles.forEach((subTitle, subTitleIndex) => {
                    var indexOfSubTile = -1;
                    var resultBoundaryOfSubTile = null
                    listOfSubTitles2.forEach((subTitle2) => {

                        if (subTitle != subTitle2) {
                            // var rexFindBoundaryOfSubTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?(\\d)\\s?" + subTitle + ").*((\\d{1,2})(\\.{1})?([\\d])\\s?" + subTitle2 + ")")
                            var rexFindBoundaryOfSubTitle = new RegExp("(?<=" + subTitle + ").*(" + subTitle2 + ")")
                                // console.log("xxxxxxxxxxxxxxxxxxxx", rexFindBoundaryOfSubTitle)
                                //  console.log(subTitle2)
                            var contentOfAllSubTitle = content[0].match(rexFindBoundaryOfSubTitle)
                                // console.log(content[0])
                            if (contentOfAllSubTitle) {
                                // console.log("xcxcxccc", contentOfAllSubTitle[0])
                                // var rexFindSubTitle = new RegExp("(\\d{1,2})(\\.{1})?(\\d)\\s?" + subTitle2)
                                var rexFindSubTitle = new RegExp(subTitle2)
                                var contentOfSubTitle = contentOfAllSubTitle[0].match(rexFindSubTitle)
                                    // console.log("xcxcxccc", contentOfSubTitle)
                                if (contentOfSubTitle) {
                                    if (indexOfSubTile == -1) {
                                        indexOfSubTile = contentOfAllSubTitle[0].indexOf(contentOfSubTitle[0])
                                        resultBoundaryOfSubTile = subTitle2
                                        indexOfLastSubTile = contentOfAllSubTitle[0].indexOf(contentOfSubTitle[0])
                                        resultBoundaryOfLastSubTile = subTitle2
                                    } else {

                                        if (indexOfSubTile > contentOfAllSubTitle[0].indexOf(contentOfSubTitle[0])) {
                                            indexOfSubTile = contentOfAllSubTitle[0].indexOf(contentOfSubTitle[0])
                                            resultBoundaryOfSubTile = subTitle2
                                        }
                                        if (indexOfLastSubTile < contentOfAllSubTitle[0].indexOf(contentOfSubTitle[0])) {
                                            indexOfLastSubTile = contentOfAllSubTitle[0].indexOf(contentOfSubTitle[0])
                                            resultBoundaryOfLastSubTile = subTitle2
                                        }
                                    }
                                }
                            }
                        }

                        // console.log(ev)
                    })
                    if (resultBoundaryOfSubTile) {
                        // console.log(resultBoundaryOfLastSubTile)
                        //console.log("resultBoundaryOfLastSubTile", resultBoundaryOfLastSubTile)
                        // var rexFindBoundaryOfSubTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?(\\d)\\s?)" + subTitle + ".*(?=(\\d{1,2})(\\.{1})?(\\d)\\s?" + resultBoundaryOfSubTile + ")")
                        var rexFindBoundaryOfSubTitle = new RegExp(subTitle + ".*(?=" + resultBoundaryOfSubTile + ")")
                            // console.log(rexFindBoundaryOfSubTitle)
                            // console.log(subTitle)
                        var subcontent = content[0].match(rexFindBoundaryOfSubTitle)
                        if (subcontent) {
                            // console.log("subcontent", subcontent[0])
                            if (!(listOfSubTitles.length - 1 == subTitleIndex) && !(listSubcontent.find(ev => ev.title == resultBoundaryOfLastSubTile))) {
                                //  console.log(resultBoundaryOfLastSubTile)
                                // var rexFindBoundaryOfLastSubTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?(\\d)\\s?)" + resultBoundaryOfLastSubTile + ".*")
                                var rexFindBoundaryOfLastSubTitle = new RegExp(resultBoundaryOfLastSubTile + ".*")
                                var lastsubContent = content[0].match(rexFindBoundaryOfLastSubTitle)
                                if (lastsubContent) {
                                    // console.log(resultBoundaryOfLastSubTile)
                                    listSubcontent.push({ title: resultBoundaryOfLastSubTile, content: lastsubContent[0] });
                                }
                            }

                            if (!firstOfSubTitle) {
                                firstOfSubTitle = subTitle
                            }
                            //console.log("subTitle", subTitle)
                            listSubcontent.push({ title: subTitle, content: subcontent[0] });

                        }
                        // listSubcontent.forEach((ev) => { console.log(ev.title) })
                        // console.log(listSubcontent.find(ev => ev.title == resultBoundaryOfLastSubTile))
                        // if (!(listOfTitles.length - 1 == subTitleIndex) && !(listSubcontent.find(ev => ev.title == resultBoundaryOfLastSubTile))) {
                        //     //  console.log(resultBoundaryOfLastSubTile)
                        //     // var rexFindBoundaryOfLastSubTitle = new RegExp("(?<=(\\d{1,2})(\\.{1})?(\\d)\\s?)" + resultBoundaryOfLastSubTile + ".*")
                        //     var rexFindBoundaryOfLastSubTitle = new RegExp(resultBoundaryOfLastSubTile + ".*")
                        //     var lastsubContent = content[0].match(rexFindBoundaryOfLastSubTitle)
                        //     if (lastsubContent) {
                        //         // console.log(resultBoundaryOfLastSubTile)
                        //         listSubcontent.push({ title: resultBoundaryOfLastSubTile, content: lastsubContent[0] });
                        //     }
                        // }
                        //console.log(listSubcontent)
                        //  console.log("subcontent", subTitle + " : " + subcontent)

                    }
                })
                if (firstOfSubTitle) {
                    // var rexFindBoundaryOfFirstSubTitle = new RegExp("(\\d{1,2})(\\.{1})?(\\d)\\s?" + firstOfSubTitle + ".*", "g")
                    var rexFindBoundaryOfFirstSubTitle = new RegExp(firstOfSubTitle + ".*", "g")
                    content[0] = content[0].replace(rexFindBoundaryOfFirstSubTitle, "")
                }
                listOfContents.push({ title: title1, content: content[0], subcontents: listSubcontent })
                    //console.log(listOfContents)
            }
        }
    })
    return listOfContents
}

function extractDocument(listOfContents, listOfLabels, listOfSymbols) {
    // var listOfSubValues = [];
    var listOfValues = [];
    listOfContents.forEach((content, index) => {
            // console.log(ev)
            // var arrayInputOfContent = ev.content.match(/(?<=[\u0E00-\u0E7F|\w]+[\.|…]+)([^\.|…]+)(?=[\.|…]+)/g)
            // console.log(ev.content)
            //console.log(ev.content)
            var valueOfContent = extractvalueOfContent(listOfLabels, listOfSymbols, content)
            if (valueOfContent.valueList.length > 0) {
                // listOfValues.push(valueOfContent)
                listOfValues.push({ title: content.title, content: valueOfContent, subContent: [] })
            }
            // console.log(content.subcontents)
            content.subcontents.forEach((subcontent) => {
                // console.log("content title", content.title)
                // console.log("subcontent", subcontent)
                var valueOfContent = extractvalueOfContent(listOfLabels, listOfSymbols, subcontent)
                if (valueOfContent.valueList.length > 0) {
                    listOfValues[index].subContent.push(valueOfContent)
                        // listOfSubValues.push(valueOfContent)
                }
            })
        })
        // listOfValues.forEach((ev) => {
        //         console.log("ALLContent", ev)

    //     })

    return listOfValues
}

function extractvalueOfContent(listOfLabels, listOfSymbols, ev) {
    //console.log(ev.content)
    var listInputOfContents = ev.content.split(/(\s{2,})|((☒|☐)(.+))/g)
    listInputOfContents = listInputOfContents.filter((ev) => { return ev != null && ev != "  " && ev != /\S/g && ev != "" && ev != "." && ev != " " && ev != "☐" && ev != "☒" })
    var notLabels = true;
    // console.log("titlexxxxxx", ev.title)
    //console.log("ev.content", ev.content)
    // console.log(listInputOfContents)
    var valueOfContent = { title: ev.title, valueList: [] }
    if (listInputOfContents) {
        listInputOfContents.forEach((input) => {

            // input = input.replace(/(\d\.\d)/g, "")
            input = input.replace(/^[\.]{1}/, "")
                // console.log("ccccc", input)
            try {
                var rexLableOfInput = new RegExp("[^\\s]+(?=[\\s]+" + input + ")", "g")
                var labelOfInput = ev.content.match(rexLableOfInput)
            } catch (e) {

            }

            //console.log("input==>", rexLableOfInput)
            // console.log("ev.content", ev.content)

            // console.log(ev.content)
            // console.log(rexLableOfInput)
            // console.log(labelOfInput)
            //console.log(labelOfInput)
            if (labelOfInput) {

                labelOfInput.forEach((label) => {

                    //console.log("label and input", label + " : " + input)
                    input = input.replace(/(\s)+/, "")
                        // label = label.replace(/(\d\.\d)/g, "")
                    label = label.replace(/(^\s)+/, "")

                    //   console.log("label and input", label + " : " + input)
                    if (((!(listOfLabels.find(ev => ev == input))) &&
                            listOfLabels.find(ev => ev == label) && input != null && input != "  " && input != /\S/g && input != "" && input != "." && input != " ") ||
                        listOfSymbols.find(ev => ev.test(input))
                    ) {
                        notLabels = false;
                        //console.log(label + ":" + input)
                        if (listOfSymbols.find(ev => ev.test(input))) {
                            input = input.split(/\s{2,}/g)

                            input.forEach((inputEv) => {
                                    // listOfLabels.forEach((label) => {

                                    //     })
                                    //  var rexFindBoundaryOfLabel = new RegExp("(?<=(\\d{1,2})(\\.{1})?(\\d{1,2}))" + input + ").*((\\d{1,2})(\\.{1})?(\\d{1,2})\\" + title2 + ")")

                                    var listValueOfSymbol = inputEv.match(/(☒)([^☐]+)/g)
                                        // console.log(label + ":" + inputEv)
                                        // console.log("cxcxcxc", listValueOfSymbol)
                                    if (listValueOfSymbol) {

                                        listValueOfSymbol.forEach((ev, index) => {
                                            listValueOfSymbol[index] = ev.replace(/☒/g, "");
                                        })

                                        if (listOfLabels.find(ev => ev == label)) {
                                            // console.log(label)
                                            // console.log("listValueOfSymbol", listValueOfSymbol)

                                            valueOfContent.valueList.push({ label: ev.title, value: listValueOfSymbol })
                                        }
                                    }
                                })
                                // // var listValueOfSymbol = input.match(/(☒)\s?[^\s]+/g)
                                // if (listValueOfSymbol) {
                                //     // listValueOfSymbol.forEach((ev, index) => {
                                //     //     listValueOfSymbol[index] = ev.replace(/☒/g, "");
                                //     // })
                                //     // console.log(listValueOfSymbol)
                                //     // listOfvalues[index].valueList.push({ label: label, value: listValueOfSymbol })
                                // }


                        } else if (!(valueOfContent.valueList.find(ev => ev.label == label))) {
                            // console.log("label and input", label + " : " + input)
                            valueOfContent.valueList.push({ label: label, value: input })
                        }
                    }

                })
            }

        })
    }
    if (notLabels) {
        valueOfContent.valueList.push({ label: ev.title, value: ev.content })
    }
    // console.log("valueOfContent==>", valueOfContent)
    return valueOfContent
}
http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Hello World!');
    console.log("localhost:8080 started")
}).listen(8080);
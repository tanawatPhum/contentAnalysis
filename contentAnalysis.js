var http = require('http')
config = {
    preserveLineBreaks: false,
    encoding: 'raw_unicode_escape'
}

var mammoth = require("mammoth");
const listOfTitles = ['1.  ชื่อโครงการ', '2.  ชื่อผู้ขอทุน', '3.  ชื่อผู้ร่วมกลุ่มวิจัย', '4. สัดส่วนการมีส่วนร่วมในผลงาน', '5. ความสำคัญ ที่มาของปัญหาที่ทำการวิจัยและการทบทวนเอกสารที่เกี่ยวข้อง', '6. คำถามวิจัย/สมมติฐานการวิจัย', '7. วัตถุประสงค์ของกลุ่มวิจัย', '8. ระเบียบวิธีวิจัย ขั้นตอนการดำเนินงาน และแผนการดำเนินกลุ่มวิจัย (โปรดระบุให้ชัดเจนพร้อมเอกสารอ้างอิง)', '9. ระยะเวลาที่ทำการวิจัย', '10. สถานที่ทำการวิจัย/เก็บข้อมูล และอุปกรณ์ในการทำวิจัยที่มีอยู่แล้วในหน่วยงาน'];
const listOfSubTitles = ['2.1 สถานภาพ', '2.2 วัน/เดือน/ปีเกิด', '2.3 ประเภททุนที่เสนอขอ', '2.4 ผลผลิต'];
const listOfLabels = ['ภาษาไทย', 'ปีงบประมาณที่ขอทุน', 'ประเภททุนที่เสนอขอ', 'สถานภาพ', 'ผลผลิต', 'ชื่อ-นามสกุล', 'ชื่อ-สกุล', 'อายุ', 'วัน/เดือน/ปีเกิด'];
const listOfLabelTables = ['เดือนที่', 'กิจกรรม (รายการที่วางแผนจะทำ)', 'ผลงานที่คาดว่าจะได้รับ (outputs)*', 'ผู้รับผิดชอบ']
var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser');
var mammoth = require("mammoth");
var pathDoc = "MU_CP01.docx"
var originalText = null;


mammoth.extractRawText({
        path: pathDoc
    })
    .then(function(result) {
        var text = result.value; // The raw text

        originalText = JSON.parse(JSON.stringify(text))
            // text = doc.getBody();

        text = preProcessDocument(text)
        const listOfSymbols = [/☒/, /☐/]
        var listOfContents = identityDocument(text, listOfTitles, listOfSubTitles)
            //console.log("listOfContents====> ", listOfContents)
        extractDocument(listOfContents, listOfLabels, listOfSymbols).then((listOfvalues) => {
            // console.log(listOfvalues)
            listOfvalues.forEach((ev) => {
                // console.log("title==> ", ev.title)
                // console.log(ev)
                ev.content.valueList.forEach((ev) => {
                        console.log("results=> ", ev)
                    })
                    // console.log(ev.subContents)
                ev.subContent.forEach((subContent) => {
                    subContent.valueList.forEach((ev) => {
                        console.log("results=> ", ev)
                    })
                })
                ev.tableContent.forEach((ev) => {
                    console.log("results=> ", ev)
                })
            })
        })


        // var messages = result.messages;
    })
    .done();

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
                                    listSubcontent.push({
                                        title: resultBoundaryOfLastSubTile,
                                        content: lastsubContent[0]
                                    });
                                }
                            }

                            if (!firstOfSubTitle) {
                                firstOfSubTitle = subTitle
                            }
                            //console.log("subTitle", subTitle)
                            listSubcontent.push({
                                title: subTitle,
                                nextTitle: resultBoundaryOfSubTile,
                                content: subcontent[0]
                            });

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
                listOfContents.push({
                        title: title1,
                        nextTitle: resultBoundaryOfContent,
                        content: content[0],
                        subcontents: listSubcontent
                    })
                    //console.log(listOfContents)
            }
        }
    })
    return listOfContents
}

function extractDocument(listOfContents, listOfLabels, listOfSymbols) {
    // var listOfSubValues = [];
    return new Promise((resolve, reject) => {
        var listOfValues = [];
        listOfContents.forEach((content, index) => {
                var valueOfContent = extractvalueOfContent(listOfLabels, listOfSymbols, content)
                    // if (valueOfContent.valueList.length > 0) {
                listOfValues.push({
                        title: content.title,
                        content: valueOfContent,
                        subContent: [],
                        tableContent: []
                    })
                    // }
                content.subcontents.forEach((subcontent, subIndex) => {

                    var valueOfContent = extractvalueOfContent(listOfLabels, listOfSymbols, subcontent)
                        // if (valueOfContent.valueList.length > 0) {
                    listOfValues[index].subContent.push(valueOfContent)
                    listOfValues[index].subContent[subIndex]["tableContent"] = []
                        // }
                })
            })
            // console.log(listOfContents)
        extractvalueOfTableContent().then((valueOfAllTables) => {
            valueOfAllTables.forEach((table) => {
                var rexOfFindTitleOfTable = null


                table.forEach((allValues) => {
                    var stringFindTitleOfTable = "^"
                    allValues.forEach((value) => {
                        //console.log(value)
                        var newLabel = value.label.replace(/\(/g, "\\(")
                        newLabel = newLabel.replace(/\)/g, "\\)")
                        stringFindTitleOfTable = stringFindTitleOfTable + "(?=.*" + newLabel + ")"
                    })
                    stringFindTitleOfTable = stringFindTitleOfTable + ".*$"
                    rexOfFindTitleOfTable = new RegExp(stringFindTitleOfTable)
                    listOfContents.forEach((content, index) => {
                        // console.log(content.content);
                        // console.log(rexOfFindTitleOfTable)
                        if (content.content.match(rexOfFindTitleOfTable)) {
                            // console.log(listOfValues[index])
                            listOfValues[index].tableContent.push(allValues)
                        }
                        content.subcontents.forEach((subcontent, subIndex) => {
                            if (subcontent.content.match(rexOfFindTitleOfTable)) {
                                listOfValues[index].subContent[subIndex].tableContent.push(allValues)
                            }
                        })
                    })
                })
            })
            resolve(listOfValues)
        })

    })

    // console.log("listOfTableValues", listOfTableValues)
    // listOfValues.forEach((ev) => {
    //         console.log("ALLContent", ev)

    //     })


}

function extractvalueOfTableContent() {

    return new Promise((resolve, reject) => {
        mammoth.convertToHtml({
                path: pathDoc
            })
            .then(function(result) {
                var valueOfAllTables = []
                var html = result.value; // The generated HTML

                // var messages = result.messages; // Any messages, such as warnings during conversion
                var allTables = html.match(/<table>(.*?)<\/table>/g)

                allTables && allTables.forEach((table) => {
                    table = table.replace(/<table>/, "<table id='tableDoc'>")
                    $ = cheerio.load(table)
                    cheerioTableparser($);
                    var dataOfTables = $("#tableDoc").parsetable(true, true, true);
                    var labelName = null
                    var jsonAllData = []
                    dataOfTables.forEach((table, index) => {

                        table.forEach((data, subIndex) => {


                            if (listOfLabelTables.find(label => label == data)) {
                                labelName = data
                            } else {
                                if (labelName && data) {
                                    if (index == 0) {
                                        jsonAllData.push([{ label: labelName, value: data }])
                                    } else {
                                        try {

                                            jsonAllData[subIndex - 1].push({ label: labelName, value: data })

                                        } catch (e) {}
                                    }
                                }
                            }
                        })

                    })
                    if (jsonAllData.length > 0) {
                        valueOfAllTables.push(jsonAllData)
                    }
                })
                resolve(valueOfAllTables)
            })
            .done();
    })


}

function extractvalueOfContent(listOfLabels, listOfSymbols, ev) {
    //console.log(ev.content)
    var listInputOfContents = ev.content.split(/(\s{2,})|((☒|☐)(.+))/g)
    listInputOfContents = listInputOfContents.filter((ev) => {
        return ev != null && ev != "  " && ev != /\S/g && ev != "" && ev != "." && ev != " " && ev != "☐" && ev != "☒"
    })
    var notLabels = true;
    // console.log("titlexxxxxx", ev.title)
    //console.log("ev.content", ev.content)
    // console.log(listInputOfContents)
    var valueOfContent = {
        title: ev.title,
        valueList: []
    }
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

                                            valueOfContent.valueList.push({
                                                label: ev.title,
                                                value: listValueOfSymbol
                                            })
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
                            valueOfContent.valueList.push({
                                label: label,
                                value: input
                            })
                        }
                    }

                })
            }

        })
    }
    if (notLabels && ev.content && ev.title) {

        var rexFindBoundaryOfTitle = new RegExp("(?<=(" + ev.title + "))(.*?(\\n|\\r|\\r\\n))+.*?(?=" + ev.nextTitle + ")", "g")
        var originalContent = originalText.match(rexFindBoundaryOfTitle)
        if (originalContent) {
            // originalContent[0] =  originalContent[0].replace(/(\\n|\\r|\\r\\n)/g,)

            valueOfContent.valueList.push({
                label: ev.title,
                value: originalContent[0]
            })
        }

    }
    // console.log("valueOfContent==>", valueOfContent)
    return valueOfContent
}
http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end('Hello World!');
    console.log("localhost:8080 started")
}).listen(8080);
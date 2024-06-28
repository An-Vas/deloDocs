const { getDocumentsFromApi, viewGroups} = require('./deloAccess/apiLogic');
const { processDocuments } = require('./bdSave/docsUpdateLogic');


const conditions = [
    ['Result', 'Doc'],
    ['Rc.DocDate', "1/01/1900" + ":" + "24/06/2024"],
    ['Rc.DocGroup', "0.2TZ.2U1."],
];


async function main() {

    viewGroups();
    var docs = await getDocumentsFromApi(conditions, "TEST", "1234");
    console.log("Got documents: ")
    console.log(docs)
    processDocuments(docs);

}

main();







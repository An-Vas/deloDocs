const { getDocumentsFromApi, viewGroups} = require('./deloAccess/apiLogic');
const { processDocuments } = require('./bdSave/docsUpdateLogic');


const conditions = [
    ['Result', 'Doc'],
    ['Rc.DocDate', "1/01/1900" + ":" + "30/07/2024"],
    // ['Rc.DocGroup', "0.2UB.2UD.2UF."],
];


async function main() {

    viewGroups();
    var docs =  await getDocumentsFromApi(conditions, "TEST", "1234");
    console.log("Got documents: ")
    console.log(docs)
    processDocuments(docs);

}

main();







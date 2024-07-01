const {connect, findDoc, updateDoc, insertDoc, disconnect, getDocId, insertFile, recreateDocsTable, recreateFilesTable} = require("./bdAccess");
const {saveFile, makedir } = require("./storageFilesSaver");

async function processDocuments(documents){
    const pool = await connect();
    // await recreateDocsTable(pool);
    // await recreateFilesTable(pool);
    for (const doc of documents) {
        const existingDoc = await findDoc(pool, doc);
        if (existingDoc) {
            await updateDoc(pool, doc);
        } else {
            await insertDoc(pool, doc);
        }

        if (doc.texts.length > 0){
            var docId = await getDocId(pool, doc);
            var folderPath = await makedir("Files_" + docId);
            var num = 0;
            for (const fileContent of doc.texts){
                num++;
                var filePath = folderPath + "/" + fileContent[1];
                saveFile(filePath,  fileContent[0]);
                await insertFile(pool, docId, fileContent[1], num)
            }
        }
    }
    await disconnect(pool);
}


module.exports = { processDocuments };

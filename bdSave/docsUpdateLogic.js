const {connect, findDoc, updateDoc, insertDoc, disconnect} = require("./bdAccess");

async function processDocuments(documents){
    const pool = await connect();
    for (const doc of documents) {
        const existingDoc = await findDoc(pool, doc);
        if (existingDoc) {
            await updateDoc(pool, doc);
        } else {
            await insertDoc(pool, doc);
        }
    }
    await disconnect(pool);
}


module.exports = { processDocuments };

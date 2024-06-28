const mssql = require('mssql');


const config = {
    "user": "sa",
    "password": "1234",
    "server": "localhost",
    "database": "DeloSaveDb",
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

async function insertDoc(pool, doc) {
    try {
        const request = pool.request();
        request.input('name', mssql.NVarChar, doc.name);
        request.input('num', mssql.NVarChar, doc.num);
        request.input('date', mssql.NVarChar, doc.date.toISOString());
        request.input('ispp', mssql.NVarChar, doc.ispp);
        request.input('ispd', mssql.NVarChar, doc.ispd);
        request.input('ispPost', mssql.NVarChar, doc.ispPost);
        request.input('ispCode', mssql.NVarChar, doc.ispCode);
        request.input('sign', mssql.NVarChar, doc.sign);
        request.input('signDep', mssql.NVarChar, doc.signDep);
        request.input('signPost', mssql.NVarChar, doc.signPost);
        request.input('grif', mssql.NVarChar, doc.grif);
        request.input('texts', mssql.NVarChar, doc.texts);
        const query = 'INSERT INTO DocsTable (name, num, date, ispp, ispd, ispPost, ispCode, sign, signDep, signPost, grif, texts) VALUES (@name, @num, @date, @ispp, @ispd, @ispPost, @ispCode, @sign, @signDep, @signPost, @grif, @texts)';
        await request.query(query);
        console.log('Data inserted successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
    }
}


async function updateDoc(pool, doc) {
    try {
        const request = pool.request();
        request.input('name', mssql.NVarChar, doc.name);
        request.input('num', mssql.NVarChar, doc.num);
        request.input('date', mssql.NVarChar, doc.date.toISOString());
        request.input('ispp', mssql.NVarChar, doc.ispp);
        request.input('ispd', mssql.NVarChar, doc.ispd);
        request.input('ispPost', mssql.NVarChar, doc.ispPost);
        request.input('ispCode', mssql.NVarChar, doc.ispCode);
        request.input('sign', mssql.NVarChar, doc.sign);
        request.input('signDep', mssql.NVarChar, doc.signDep);
        request.input('signPost', mssql.NVarChar, doc.signPost);
        request.input('grif', mssql.NVarChar, doc.grif);
        request.input('texts', mssql.NVarChar, doc.texts);
        const query = ('UPDATE DocsTable SET name = @name, date = @date, ispp=@ispp, ispd=@ispd, ispPost=@ispPost, ispCode=@ispCode, sign=@sign,signDep=@signDep, signPost=@signPost, grif=@grif, texts=@texts WHERE (num = @num AND name=@name AND date=@date)');
        await request.query(query);
        console.log('Document updated successfully.');
    } catch (err) {
        console.error('Error updating document:', err.message);
    }
}


async function findDoc(pool, doc) {
    try {
        const request = pool.request();
        request.input('name', mssql.NVarChar, doc.name);
        request.input('num', mssql.NVarChar, doc.num);
        request.input('date', mssql.NVarChar, doc.date.toISOString());
        const query = (`SELECT COUNT(*) as count
                        FROM DocsTable
                        WHERE (num = @num AND name =@name AND date =@date)`);

        const result = await request.query(query);
        const rowCount = result.recordset[0].count;
        return rowCount !== 0;

    } catch (err) {
        console.error('Error finding a doc:', err);
        return null;
    }

}

async function connect(pool) {
    pool = await new mssql.ConnectionPool(config);
    await pool.connect();
    return pool;
}


function disconnect(pool) {
    try {
        pool.close();
    } catch (err) {
        console.error('Error disconnecting to the database:', err);
        return null;
    }

}



module.exports = {connect, disconnect, findDoc, insertDoc, updateDoc};
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
        const query = 'INSERT INTO DocsTable (name, num, date, ispp, ispd, ispPost, ispCode, sign, signDep, signPost, grif) VALUES (@name, @num, @date, @ispp, @ispd, @ispPost, @ispCode, @sign, @signDep, @signPost, @grif)';
        await request.query(query);
        console.log('Data inserted successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

async function insertFile(pool, docId, name, num) {
    try {
        const request = pool.request();
        request.input('docId', mssql.INT, docId);
        request.input('num', mssql.INT, num);
        request.input('name', mssql.NVarChar, name);

        const query = 'INSERT INTO FilesTable (docId, name, num) VALUES (@docId, @name, @num)';
        await request.query(query);
        console.log('FileInfo inserted successfully!');
    } catch (error) {
        console.error('Error inserting FileInfo: ', error);
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
        const query = ('UPDATE DocsTable SET name = @name, date = @date, ispp=@ispp, ispd=@ispd, ispPost=@ispPost, ispCode=@ispCode, sign=@sign,signDep=@signDep, signPost=@signPost, grif=@grif WHERE (num = @num AND date=@date)');
        await request.query(query);
        console.log('Document updated successfully.');
    } catch (err) {
        console.error('Error updating document:', err.message);
    }
}


async function findDoc(pool, doc) {
    try {
        const request = pool.request();
        request.input('num', mssql.NVarChar, doc.num);
        request.input('date', mssql.NVarChar, doc.date.toISOString());
        const query = (`SELECT COUNT(*) as count
                        FROM DocsTable
                        WHERE (num = @num AND date = @date)`);

        const result = await request.query(query);
        const rowCount = result.recordset[0].count;
        return rowCount !== 0;

    } catch (err) {
        console.error('Error finding a doc:', err);
        return null;
    }

}


async function getDocId(pool, doc) {
    try {
        const request = pool.request();
        request.input('num', mssql.NVarChar, doc.num);
        request.input('date', mssql.NVarChar, doc.date.toISOString());
        const query = (`SELECT id
                        FROM DocsTable
                        WHERE (num = @num AND date = @date)`);

        const result = await request.query(query);
        const res = result.recordset[0].id;

        return res;

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

async function recreateFilesTable(pool){
     try {
        const request = pool.request();
        const query1 = (`DROP TABLE FilesTable`);
        const query2 = (`CREATE TABLE FilesTable (docId INT, name  nvarchar(50), num INT)`);
        await request.query(query1);
        const result = await request.query(query2);
        return result;

    } catch (err) {
        console.error('Error creating table:', err);
        return null;
    }
}

async function recreateDocsTable(pool){
    try {
        const request = pool.request();
        const query1 = (`DROP TABLE DocsTable`);
        const query2 = (`CREATE TABLE DocsTable 
                                (id INT primary key IDENTITY(1,1) not null,
                                 name nvarchar(MAX), 
                                 num  nvarchar(50) not null,
                                 date datetime not null,
                                 ispp nvarchar(50),
                                 ispd nvarchar(50),
                                 ispPost nvarchar(50),
                                 ispCode nvarchar(50),
                                 sign nvarchar(50),
                                 signDep nvarchar(50),
                                 signPost nvarchar(50),
                                 grif nvarchar(50),
                         )`);
        await request.query(query1);
        const result = await request.query(query2);
        return result;

    } catch (err) {
        console.error('Error creating table:', err);
        return null;
    }
}



module.exports = {connect, disconnect, findDoc, insertDoc, updateDoc, insertFile, getDocId, recreateDocsTable, recreateFilesTable};
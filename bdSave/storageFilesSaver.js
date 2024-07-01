const fs = require('fs');
const path = require('path');

async function saveFile(filepath, fileContent) {

    await fs.writeFile(filepath, fileContent, (err) => {
        if (err) {
            console.error('Error occurred while writing a file', err);
        } else {
            console.log('Writing a file: success');
        }
    });

}


async function makedir(dirName) {

    const newDirPath = path.join(__dirname, dirName);

    if (!fs.existsSync(newDirPath)) {
        fs.mkdirSync(newDirPath);
        console.log("Creating Folder " + dirName +  ": success");
    } else {
        console.log("Creating Folder " + dirName +  ": already exists");
    }
    return newDirPath;
}

module.exports = {saveFile, makedir };
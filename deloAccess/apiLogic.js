const { convertRKObject, convertClassifierObject} = require('./apiAccess');


async function getDocumentsFromApi(conditions, login, pass){
    var convertRK = new convertRKObject(login, pass);
    convertRK.resetConditions();
    conditions.forEach(([key, value]) => convertRK.addCondition(key, value));
    const count = convertRK.Count();
    var resultArr = [];
    for (var i = 0; i < count; i++){
        resultArr.push(await convertRK.Get(i));
    }

    convertRK.DeInit();
    return resultArr;
}


function viewGroups(){

    var convertClassifier = new convertClassifierObject("TEST", "1234");
    convertClassifier.Run("DocGroup");
    console.log(convertClassifier.GetElementsCodes());
    convertClassifier.DeInit();

}



module.exports = {
    getDocumentsFromApi, viewGroups
};

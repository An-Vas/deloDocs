const winax = require("winax");
const fs = require('fs');
const path = require('path');

class DeloAPIObject{
    constructor(){
        this.Head = null;
        this.ResultSet = null;
        this.result = [];
        this.error = "";
    }

    GetOLE()  {
        console.log("GetOLE: trying to get object")
        try {
            this.Head = new ActiveXObject("eapi.head");
        } catch (err) {
            console.log("GetOLE: error")
            return "" + err;
        }
        return "";
    }


    Init ( login, pass ) {
        var res = this.GetOLE();
        if (res != ""){
            console.log("Init: get OLE is not OK " + res);
            return res;
        }

        if ((login != null) && (pass != null)) {
            console.log("Init: opening with login and pass");
            this.Head.OpenWithParams(login, pass);
        } else {
            console.log("Init: opening without login and pass");
        }
        if (this.Head.ErrCode != 0){
            console.log("Init: error  " + this.Head.ErrCode)
            return this.GenerateError(this.Head);
        } else {
            console.log("Init: success")
            return "";
        }

    }
    DeInit () {
        if (this.Head.Active) {
            this.Head.Close();
            this.Head = null;
            console.log("DeInit: success")
        } else {
            console.log("DeInit: Head is not Active")
        }
    }
    InitResult = function ( criterion ) {
        console.log("InitResult: criterion " + criterion);
        this.ResultSet = this.Head.getResultSet();
        this.ResultSet.Source = this.Head.GetCriterion(criterion);
    }
    FillResult = function () {
        this.ResultSet.Fill();
        if (this.ResultSet.ErrCode != 0) {
            this.error = GenerateError(this.ResultSet);
            console.log("FillResult: error " + this.error);
            return false;
        }
        if (this.ResultSet.Count <= 0) {
            console.log("FillResult: count of resultset <= 0 ");
            return false;
        }
        return true;
    }
    GenerateError( ActiveXObject ) {
        return "" + " " + ActiveXObject.ErrCode + " - " + ActiveXObject.ErrText;
    }
    GetObject ( area, isnOrDcode ) {
        return this.Head.GetRow(area, isnOrDcode);
    }

}


// function convertTable()
// {
// }
//
//
// function convertEDS()
// {
//     convertTable();
//
//     function convertEDSConvert ( item, counter ) {
//         return CRK_GetEDS(item);
//     }
// }
//
//
// function convertCertificate()
// {
//     convertTable();
//
//     this.Convert = function ( item, counter ) {
//         var res = new Object();
//         res.id = item.CertificateID;
//         res.kind = item.CertificateKind;
//         res.desc = item.Description;
//
//         var fName = "cert" + res.id + "_" + (new Date()).ToString("", "") + ".txt";
//         var fp = new FilePath();
//         fp.GetTempDirectory();
//         var tempDir = new File(fp);
//         item.SaveToFile(tempDir + fName);
//         var text = new VirtualText();
//         var f = new File(tempDir + fName);
//         f.copyTo(text);
//         f = null;
//         Unlink(tempDir + fName);
//         res.stream = text;
//
//         return res;
//     }
// }


class convertRKObject {

    constructor(login, pass) {
        this.deloApi = new DeloAPIObject();
        this.deloApi.Init(login, pass);
        this.conditions = [];
        this.links = false;
        this.ResultSet = null;
    }

    resetConditions () {
        this.conditions = [];
    }
    addCondition ( name_attr, value ) {
        this.conditions[this.conditions.length] = {name: name_attr, val: value};
    }
    Count () {

        this.deloApi.InitResult("Table");
        this.ResultSet = this.deloApi.ResultSet;

        for (var i=0;i<this.conditions.length;i++) {
            this.ResultSet.Source.SetParameters(this.conditions[i].name, this.conditions[i].val);
        }
        if (!this.deloApi.FillResult())
            return 0;
        console.log("Count of docs: " + this.ResultSet.Count)
        this.ResultSet = this.deloApi.ResultSet;
        return this.ResultSet.Count;
    }
    Get ( i ) {
        if (i >= this.ResultSet.Count) return null;
        if (i < 0) return null;
        return this.Convert(this.ResultSet.Item(i), i);
    }

    DeInit(){
        this.deloApi.DeInit();
    }

    Convert = CRK_Convert;

};




function DeloDocument( item )
{
    this.name = item.RegNum;
    if (item.Contents != null) this.name = item.Contents;
    this.num = item.RegNum;
    this.date = item.DocDate;

    this.Compare = function ( dd ) {
        if (dd == null) return false;
        if (this.Compare1(dd)) return true;
        if (dd.parent != null) return this.Compare(dd.parent);
        return false;
    }
    this.Compare1 = function ( dd ) {
        if (this.name != dd.name) return false;
        if (this.num != dd.num) return false;
        if (this.date != dd.date) return false;
        return true;
    }
    this.MainInfo = function () {
        var prm = new Vars();
        prm.name = this.name;
        prm.num = this.num;
        prm.date = this.date;
        prm.parent = this.parent;
        return prm;
    }
}




function CRK_Convert( item, counter, parent )
{

    var prm = new DeloDocument(item);
    if (prm.Compare(parent)) {
        prm.noSave = true;
        return prm;
    }
    prm.noSave = false;
    prm.parent = parent;


    prm.lastModified = CRK_GetLastModified(item.Protocol);

    var rub = CRK_GetRubric(item.Rubric);
    var rub = [];
    prm.rubrics = rub[0];
    prm.codes = rub[1];

    prm.ispp = "";						// исполнитель
    prm.ispd = "";						// структурное подразделение
    prm.ispPost = "";					// должность
    try {
        var StrpIps = item.Executor;		// структурное подразделение/исполнитель
        if (StrpIps.ErrCode != (-100)) {
            if (StrpIps.Surname == null) {	// то это структурное подразделение
                prm.ispd = StrpIps.Name;
                prm.ispdCode = StrpIps.DCode;
            }
            else {							// исполнитель
                prm.ispp = StrpIps.Surname;
                prm.ispPost = StrpIps.Post;
                prm.ispCode = StrpIps.DCode;
                if (StrpIps.Parent.ErrCode != (-100)) {
                    prm.ispd = StrpIps.Parent.Name;
                    prm.ispdCode = StrpIps.Parent.DCode;
                }
            }
        }
    } catch (err) {
    }

    prm.sign = "";						// подпись
    prm.signDep = "";					// структурное подразделение подписавшего
    prm.signPost = "";					// должность подписавшего
    try {
        var personSign = item.PersonSign;
        if (personSign.ErrCode != (-100)) {
            prm.sign = personSign.Surname;
            prm.signPost = personSign.Post;
            prm.signCode = personSign.DCode;
            if (personSign.Parent.ErrCode != (-100)) {
                prm.signDep = personSign.Parent.Name;
                prm.signDepCode = personSign.Parent.DCode;
            }
        }
    } catch (err) {
    }

    prm.texts = CRK_GetFiles(item.Files);
    prm.secret = true;
    prm.grif = "";
    var Secur = item.Security;
    if (Secur.ErrCode == 0) {
        var secName = Secur.Name;
        if (secName.toLowerCase() == "общий") prm.secret = false;
        prm.grif = secName;
    }

    prm.links = [];
    // this.links			- Если включен флаг загрузки связанных
    // (parent == null)		- Если это основной документ (сохраняем только 1-й уровень связей)
    // (item.LinkCnt > 0)	- Если есть связи
    if (this.links && (parent == null) && (item.LinkCnt > 0)) {
        prm.links = CRK_GetLinks(item.LinkRef, prm.MainInfo());
    }

    return prm;
}

function CRK_GetLastModified( item )
{
    var names = [];
    var codes = [];
    item.CurrentIndex = 0;
    var lastTime = null;
    while (!item.IsEnd) {
        // console.log("IProtocol ");
        if ((item.CurrentItem._ObjectKind) == 355) {
            var time = item.CurrentItem.When;
            if ((lastTime == null) || (time > lastTime))
                lastTime = time;
        }
        item.Next();
    }
    return lastTime;
}

function CRK_GetRubric( item )
{
    var names = [];
    var codes = [];
    item.CurrentIndex = 0;
    while (!item.IsEnd) {
        // console.log("IRubric ");
        // if (typeof (item.CurrentItem) == "IRubric") {
        if ((item.CurrentItem._ObjectKind) == 107) {
            var cname = item.CurrentItem.Name;
            var ccode = item.CurrentItem.DCode;
            if (cname == null) continue;
            if (cname == "") continue;
            if (ccode == null) continue;
            if (ccode == "") continue;
            names[names.length] = cname;
            codes[codes.length] = ccode;
        }
        item.Next();
    }
    return [names, codes];
}

function CRK_GetLinks( item, parent )
{
    var links = [];
    item.CurrentIndex = 0;
    while (!item.IsEnd) {
        console.log("ILink ");
        console.log("_ObjectKind " + (item.CurrentItem._ObjectKind));
        if (item.CurrentItem == "ILinkRef") {
            var target = item.CurrentItem.RcLink;
            if (target.ErrCode != (-100)) {
                var lDoc = CRK_Convert(target, null, parent);
                if (!lDoc.noSave) {
                    var typeLink = item.CurrentItem.TypeLink;
                    var lType = typeLink.Name;
                    var lComment = typeLink.Note;
                    links[links.length] = {type: lType, comment: lComment, doc: lDoc};
                }
            }
        }
        item.Next();
    }
    return links;
}

function CRK_GetFiles( item )
{
    var files = [];
    item.CurrentIndex = 0;
    while (!item.IsEnd) {
        if (item.CurrentItem._ObjectKind == 128) {
            if(item.IS_HIDDEN || item.ishidden || item.CurrentItem.Contents.Name==null || item.CurrentItem.Contents.Name.toLowerCase().indexOf("комплект")>-1 || item.CurrentItem.ishidden) continue;
            files[files.length]=[CRK_GetFileStream(item.CurrentItem), item.CurrentItem.Contents.Name];
        }
        item.Next();
    }
    return files;
}

function CRK_GetFileStream( item )
{
    return "TEMP Example file content"; // Здесь должно возвращаться содержимое файла

    if (item.Contents == null) return null;
    var content = item.Contents;
    // console.log(item.Contents);
    var fName = content.Name;
    var fileName = fName;

    const folderPath = path.resolve(__dirname, "TempFolder");

    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) throw err;

        const filePath = path.resolve(folderPath, fileName);

        fs.writeFile(filePath, "", (err) => {
            if (err) throw err;
        });


        content.Prepare(filePath);
        // content.Prepare(folderPath);
        // content.Open();


        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err}`);
                return;
            }
            console.log("data " + data);
        });


        // fs.writeFile(filePath, content, (err) => {
        //     if (err) throw err;
        //
        // });
    });

    // var fp = new FilePath();
    // fp.GetTempDirectory();
    // var tempDir = new File(fp);
    // content.Prepare(tempDir);

    ///////////////content.Open();

    // var f = new File(tempDir + fName);
    // var text = new VirtualText();
    // f.copyTo(text);
    // f = null;
    // Unlink(tempDir + fName);
    content.UnPrepare();



    try{
        var edsigns = CRK_GetEDSigns(item.EDS) ;
    }catch(err) {
        edsigns = [];
    }


    // return {stream: text, name: item.Descript, fileName: fName, dateUp: item.date_upd, eds: edsigns};
}

function CRK_GetEDSigns( item )
{
    var edSigns = [];
    item.CurrentIndex = 0;
    while (!item.IsEnd) {
        if (item.CurrentItem == "IFileEDS") {
            edSigns[edSigns.length] = CRK_GetEDS(item.CurrentItem);
        }
        item.Next();
    }
    return edSigns;
}

function CRK_GetEDS( item )
{
    var res = new Object();
    res.isn = item.Isn;
    res.info = item.SignText;
    res.date = item.SignDate;
    var dep = item.Person;
    if (dep.ErrCode != (-100)) {
        res.ispd = dep.Name;
        res.ispdCode = dep.DCode;
    }
    var sKind = item.SignKind;
    if (sKind.ErrCode != (-100)) {
        res.kind = sKind.Name;
        res.kindTitle = sKind.SignText;
    }
    res.certificateId = item.CertificateID;

    var fName = "eds_" + (new SRDDate()).ToString("", "") + ".txt";
    var fp = new FilePath();
    fp.GetTempDirectory();
    var tempDir = new File(fp);
    item.SaveToFile(tempDir + fName);
    var text = new VirtualText();
    var f = new File(tempDir + fName);
    f.copyTo(text);
    f = null;
    Unlink(tempDir + fName);
    res.stream = text;

    if (res.certificateId != null) {
        var cert = this.GetObject("Certificate", res.certificateId);
        res.certificate = CRK_GetCertificate(cert);
        if (res.certificate.id == null) res.certificate.id = res.certificateId;
    }

    return res;
}

function CRK_GetCertificate( item )
{
    var res = new Object();
    res.id = item.CertificateID;
    res.kind = item.CertificateKind;
    res.desc = item.Description;

    var fName = "cert" + res.id + "_" + (new SRDDate()).ToString("", "") + ".txt";
    var fp = new FilePath();
    fp.GetTempDirectory();
    var tempDir = new File(fp);
    item.SaveToFile(tempDir + fName);
    var text = new VirtualText();
    var f = new File(tempDir + fName);
    f.copyTo(text);
    f = null;
    Unlink(tempDir + fName);
    res.stream = text;

    return res;
}


/*****************************************
 ** DeloClassifier
 ** элемент классификатора
 *****************************************/
function DeloClassifier( item, parentCode )
{
    this.name = item.Name;
    this.fullName = this.name;
    this.source = "ДелоТСФ";
    this.code = item.DCode;
    this.level = item.Layer;
    this.parentCode = parentCode;
    this.isParent = false;
    this.post = "";
    this.person = 0;

    if (typeof (item) == "IDepartment")
    {
        if (item.Surname != null)
        {
            this.name = item.Surname;
            if (item.Post != null) this.post = item.Post;
            this.person = 1;
        }
    }
}


class convertClassifierObject{
    constructor(login, pass) {
        this.deloApi = new DeloAPIObject();
        this.deloApi.Init(login, pass);
        this.maxLevel = 1;
        this.arrElements = new Array();
    }

    Run = function ( voc ) {
        this.deloApi.InitResult("Vocabulary");
        this.ResultSet = this.deloApi.ResultSet;
        this.ResultSet.Source.Vocabulary = voc;
        if (!this.deloApi.FillResult())
            return;
        this.ResultSet.Source.Vocabulary = voc;
        for (var i=0;i<this.ResultSet.Count;i++)
            this.Convert(this.ResultSet.Item(i), i);
    }
    Convert = function ( item, counter ) {
        var parentCode = "";
        if (item.Layer != 1) parentCode = item.Parent.DCode;
        if (parentCode != "") {
            for (var i=0;i<this.arrElements.length;i++) {
                if (this.arrElements[i].code == parentCode)
                    this.arrElements[i].isParent = true;
            }
        }
        this.arrElements[this.arrElements.length] = new DeloClassifier(item, parentCode);
        if (item.Layer > this.maxLevel) this.maxLevel = item.Layer;
    }

    GetElementsProperties ( prop ) {
        var res = [];
        for (var i=0;i<this.arrElements.length;i++) {
            var elem = this.arrElements[i];
            res[i] = elem[prop];
        }
        return res;
    }
    GetElementsCodes () {
        return this.GetElementsProperties("code");
    }
    GetElementsNames () {
        return this.GetElementsProperties("name");
    }

    DeInit (){
        this.deloApi.DeInit();
    }


}




module.exports = {
    convertClassifierObject, convertRKObject
};

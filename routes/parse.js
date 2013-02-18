// Parse giant XML file into mongo

exports.parse = function(req){
  var db = req.app.settings.db;
  db.collection('urls', function(err, collection) {
    
    var bigXml = require('big-xml');
    var reader = bigXml.createReader('recipedetail.xml', /^(url)$/, {});
    reader.on('record', function(record) {
      for (var prop in record.children){
        var entry = record.children[prop];
        if (entry.text && entry.text.substr(0,4) == "http"){
          collection.insert({url : entry.text, visited : false });            
        }
      }
    });
  });
  return function(){};
}

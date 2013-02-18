// Generate probability tables 
var db, collection;

exports.generate = function(req, res){
  db = req.app.settings.db;
  db.collection('ingredients', function(err, c) {
    ingredients = c; 
    
    var cursor = ingredients.find({});
    
    db.collection('table', function(err, t){
        recurse(cursor, t, 0);
        res.send('done');
    });

  });

  return function(){};
};

exports.list = function(req, res){
  db = req.app.settings.db;
  db.collection('table', function(err, collection) {
    var result = collection.find({}).sort({'appearances' : -1}).limit(20).toArray(function(err, stuff){
        res.send(stuff);
    });
  });    

  return function(){};
};

// This might be better as a native mongo function, but oh well.
function recurse(cursor, table, index){
  cursor.nextObject(function(err, item){
    if (!item) return;

    item.ingredients.forEach(function(ingredient){
      var others = item.ingredients.slice(0);
      others.splice(others.indexOf(ingredient), 1);
    
      table.findOne({ name : ingredient }, function(err, result){
        entry = result ||  { name : ingredient, appearances : 0, used_with : {} };
        entry.appearances++;

        others.forEach(function(other){
          if (!entry.used_with[other]) entry.used_with[other] = 1;
          else entry.used_with[other]++; 
        });

        table.update({ name : ingredient }, entry, { upsert : true }, function(){
          // console.log(ingredient); 
          recurse(cursor, table, index + 1);
        });
      });
    });  
  });

}

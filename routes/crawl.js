// Retrieve ingredient lists from server
var http = require('http') 
  , jsdom = require('jsdom')
  , db
  , collection;

exports.crawl = function(req){
  db = req.app.settings.db;
  db.collection('urls', function(err, c) {
    collection = c; 
    // Get ingredient lists
    var cursor = collection.find({});

    recurse(cursor, 0);
  });

  return function(){};
}
      
function recurse(cursor, index){
  cursor.nextObject(function(err, item){
   if (item && item.url) {
     extract(item.url, success, failure)

     function success(arr){
       // save ingredients to DB
       console.log(arr, index);
       db.collection('ingredients', function(err, ingredients){
         ingredients.insert({ ingredients:  arr, index: index });
         collection.remove({ url : item.url});
       });

       // advance cursor and go again
       recurse(cursor, index + 1);
     };

     function failure(){
       // wait a while and try again
         console.log('timeout happened')
         recurse(cursor, index + 1);
     };

   }
  });
}

// Open a URL and extract the links.  Optionally, run a callback.
function extract(url, success, failure){
  var results = [];

  try { 
      http.get(url, function(res){
          var pageData = "";
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            pageData += chunk;
          });

         res.on('end', function(){
           jsdom.env({
             html:  pageData,
             scripts: ['http://code.jquery.com/jquery-1.6.min.js']
           }, function(err, window){
             var $ = window.jQuery;
             var results = [];
             $('.ingredient-name').each(function(i, d){
               results.push($(this).text());
             });
             success(results);
           });
         }).on('error', function(err){
            console.log(err);
            failure();
         });
      }).setTimeout(2000, function(){
        console.log('Timed out.');
        failure();
      });
  } catch(err){
    failure();
  }
}

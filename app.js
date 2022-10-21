const express = require('express');  
const bodyParser = require('body-parser');  
const path = require('path');  
const NodeCouchDb = require('node-couchdb');



const couch = new NodeCouchDb({  
    auth:{  
        user: 'admin', 
        pass: 'admin'  
}  
});  

const dbName = 'directors';
const viewUrl = '/_design/directors/_view/all_directors';

couch.listDatabases().then(function(dbs){  
    console.log(dbs);  
});

const app = express();  

app.set('view engine', 'ejs');  
app.set('views', path.join(__dirname, 'views'));  

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/views'));  

app.get('/', function(req, res){  
 couch.get(dbName, viewUrl).then(
        function(data, headers, status){
        console.log(data.data.rows);
        res.render('index',{
            directors:data.data.rows
        });
    },
    function(err){
        res.send(err);
    }); 
});   


app.post('/director/add', function(req, res){
    const name = req.body.name;
    const movie =  [{ "title": req.body.title1, "year": req.body.year1 },
                    { "title": req.body.title2, "year": req.body.year2 },
                    { "title": req.body.title3, "year": req.body.year3 }
                    ];

    couch.uniqid().then(function(ids){
        const id = ids[0];

        couch.insert(dbName, {
            _id: id,
            name: name,
            movies: movie
        }).then(
            function(data, headers, status){
                res.redirect('/');
            },
            function(err){
                res.send(err);
            });
    });
});

app.post('/updateDirector/:id', function(req, res){
    const id = req.params.id;
    const rev = req.body.rev;

    const movies = [{"title": req.body.update_title}];

    couch.update(dbName, {
        _id: id,
        _rev: rev,
        movies: movies
    }).then(
         function(data, headers, status){
            req.redirect('/');
    },
    function(err){
        res.send(err);
    });
});

app.post('/director/delete/:id', function(req, res){
    const id = req.params.id;
    const rev = req.body.rev;

    couch.del(dbName, id, rev).then(
        function(data, headers, status){
            res.redirect('/');          
        },
        function(err){
            res.send(err);
        });
});

app.listen(3000, function(){  
 console.log('Server started on 3000 Port');  
});

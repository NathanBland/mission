/*
* Based heavily on the scotch.io tutorial. 
* https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular
* implemented to learn angular.
*/

var express = require("express"); //setup
var mongoose = require("mongoose"); //mongodb
var morgan = require("morgan"); //log requests to console
var bodyParser = require('body-parser'); //keep html safe.
var methodOverride = require("method-override"); //sim DELETE and PUT
var app = express();

//config

mongoose.connect('mongodb://' + (process.env.IP || 'localhost') + '/todo');

app.use(express.static(__dirname + '/public'));                 // serve static files.
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// define model =================
var Todo = mongoose.model('Todo', {
    text : String
}); //should be moved to its own file...

// routes ======================================================================

// api ---------------------------------------------------------------------
// get all todos
app.get('/api/todos', function(req, res) {

    // use mongoose to get all todos in the database
    Todo.find(function(err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            return res.send(err)

        res.json(todos); // return all todos in JSON format
    });
});

// create todo and send back all todos after creation
app.post('/api/todos', function(req, res) {

    // create a todo, information comes from AJAX request from Angular
    Todo.create({
        text: req.body.text,
        done: false
    }, function(err, todo) {
        if (err)
            return res.send(err);

        // get and return all the todos after you create another
        Todo.find(function(err, todos) {
            if (err)
                return res.send(err)
            res.json(todos);
        });
    });

});

// delete a todo
app.delete('/api/todos/:todo_id', function(req, res) {
    Todo.remove({
        _id: req.params.todo_id
    }, function(err, todo) {
        if (err)
            return res.send(err);

        // get and return all the todos after you create another
        Todo.find(function(err, todos) {
            if (err)
                return res.send(err)
            res.json(todos);
        });
    });
});
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.set('port', process.env.PORT || 8000);
app.set('ip', process.env.IP || '0.0.0.0');

var server = app.listen(app.get('port'), app.get('ip'), function() {
    var address = server.address();
    console.log("Todo app running on https://%s:%s",
        address.address, address.port);
});
const express = require('express');
const app = express();
const mysql= require('mysql');
//mongo
require('dotenv').config();
const mongoose = require('mongoose');
const chalk = require('chalk')

//var bodyParser = require('body-parser')
 
// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
//app.use(bodyParser.json())

//anstelle von body-parser funktioniert auch:
app.use('/', express.static('public'))
app.use(express.json())

//MySQL connection
const connection = mysql.createConnection({
    host: 'localhost', // process.env.HOST
    user: 'micha',
    password: 'password',
    database: 'miniblog'
});

//MongoDB connection
mongoose.connect(process.env.MONGODBPATH, {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log(chalk.green('Mongo connected'));
});

const PostSchema = new mongoose.Schema({
    creationDate: {type: Date, default: Date.now },
    title: String,
    content: String
  });


const Post = mongoose.model('Post', PostSchema);
//=====================================================================================
//Mongo
app.get('/mongoBlog', async(req,res)=>{
    const posts = await Post.find()
    console.log("posts:")
    console.log(posts)
    res.json(posts)
});

app.post('/mongoBlog', async(req,res)=>{
    const post = await Post.create(req.body)
    res.json(post)
});

app.get('/mongoBlogFind/:_id', async(req,res)=>{
    const post = await Post.findById({"_id":req.params._id}) //gibt Objekt zurück
    res.json(post)
});

app.get('/mongoBlogFindAll/:searchStr', async(req,res)=>{
    console.log(req.params);
    const subStr = new RegExp(req.params.searchStr.toLowerCase(),"i")
    console.log(subStr)
        const post = await Post.find({
            
        $or:[
        {'title': subStr},
        {'content': subStr}
        ]
    })
    res.json(post)
});

app.put('/mongoBlog/:_id', async (req,res)=>{
    const post = await Post.findByIdAndUpdate(req.params._id, req.body, {new: true})
    res.json(post)
})

app.post('/mongoBlogDelete/:_id', async(req,res)=>{
    const post = await Post.deleteOne({"_id":req.params._id})
    console.log(post)
    res.json(post)
});

//=====================================================================================
//MySQL
app.post('/blogposts', (req, res) => {
    console.log('server got something to post');
    console.log(req.body);

    if(!(req.body.title && req.body.content)) {
        return res.send({ error: 'Title and content required' });
    }
    
    const querySend = `
            insert into blogposts (
                created,
                title, 
                content
            )
            values (now(),?,?);
        `;

    connection.query(
        querySend, [ req.body.title, req.body.content ],

        (err, result) => {
            if(err) {
                console.log('Error: ' + err);
                return res.send({ error: err });
            }
            return res.send({ error: 0, blogpostId: result.id });
        });            
});

app.get('/blogposts', (req, res) => {
    let queryStr = '';

    if(req.query.q){
        console.log('Query Search: ' + req.query.q)
        queryStr = `select * from blogposts 
        where title like "%${req.query.q}%" 
        or content like "%${req.query.q}%"`;
    }else{
        queryStr = `select * from blogposts`;
    }

    connection.query(queryStr, (err, rows) => {
        console.log('rows:');
        console.log (rows);           
        if(err){
            return res.send({error: err});
        }
       
        console.table(rows);
        return res.send(rows); 
        });
});


    
app.listen(3000);   
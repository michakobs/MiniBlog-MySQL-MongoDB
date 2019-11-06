require('dotenv').config();
const bcrypt = require('bcrypt');

const express = require('express');
const app = express();
const mysql= require('mysql');
const mongoose = require('mongoose');
const User = require('./User');
const chalk = require('chalk');

//var bodyParser = require('body-parser')
 
// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
//app.use(bodyParser.json())

//anstelle von body-parser funktioniert auch:
app.use('/', express.static('public'))
app.use(express.json())


console.log(chalk.blue(process.env.HOST))
//MySQL connection
const connection = mysql.createConnection({
    
    host: process.env.SQLHOST,
    user: process.env.SQLUSER,// USER funktioniert nicht
    password: process.env.SQLPASSWORD,
    database: process.env.SQLDATABASE
});
connection.connect();

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
    content: String,
    email: String
  });


const Post = mongoose.model('Post', PostSchema);
//====================================================================================
//Passwort hashing

const getHash = (password) => {
    return new Promise((resolve, reject) => {
        console.log('hash password')
        bcrypt.hash(password, 10, (err, res) => {
            if(err) return reject(err);
            console.log(`${password} = ${res}`)
            return resolve(res);
        });
    });
}

let compareHash = (password, userHash) => {
    return new Promise((resolve, reject) => {
        console.log('compare password')
        
        bcrypt.compare(password, userHash, (err, resultCompare) => {
            if(err) return reject(err);
                if(resultCompare) {
                    console.log('fit')
                    return resolve(true);
                }else{
                    console.log('unfit')
                    return resolve(false);
                }
            })
    })
}

//=====================================================================================
//Mongo authentication

//Session cookie
const session = require('express-session') //Express-session einbinden
app.use(session({
    secret: 'mySecretKey', //crypto-Schlüssel
    resave: true,
    saveUninitialized: true
}))

//-------------------------SEED
/*
let seedData = [
    {
        email: "ralf@gmail.com",
        password: "ralfpw",
        privilege: "guest"
    },
    {
        email: "steffi@gmail.com",
        password: "steffipw",
        privilege: "admin"
    },
    {
        email: "sandra@yahoo.com",
        password: "sandrapw",
        privilege: "admin"
    },
];

let createUser = async(userEPP) => {

    let userFound = await User.find()
        if(userFound.length > 0){
                console.log(chalk.green.bold.inverse('already seeded'))
        } else {
                await User.insertMany(userEPP);
                console.log(chalk.yellow.bold.inverse('Users created'))
        }
    process.exit()
};
createUser(seedData);
*/

app.get('/login', async(req,res)=>{

    console.log(`Login ==>> ${req.query.password}`)
    
    const searchQuery = {'email':req.query.email};
    
    // const searchQuery = { email:req.query.email, password:req.query.password} 
    // funktioniert auch
    
    
    
    let userFound = await User.find(searchQuery);
    console.log(userFound);
    if(userFound[0].email === req.query.email){
        
        let approved = await compareHash(req.query.password, userFound[0].password)
        console.log('approval= ' + approved);
        if(approved === true){
            //console.log('found User: ' + userFound) 
            req.session.email = req.query.email;
            req.session.privilege = userFound[0].privilege;
            console.log(chalk.red.inverse(req.session.email + '  ist angemeldet als  ' + req.session.privilege))
            return res.send({'error':0, 'message':`Hallo ${req.session.email}`})
        } else {
            return res.send({'error':1002, 'message':`Wrong password!`});
        }
    }else{
        return res.send({'error':1001, 'message':`Sign up!`});
    }
});
    

const auth = (req,res,next) =>{
    console.log(req.session.email);
    if(!req.session.email){
        return res.send({'email':''});
    }
    next(); //next() leitet req weiter an die nächste callback-funktion
}

const authAdmin = (req,res,next) =>{
    if(req.session.privilege != 'admin'){
        return res.send({'email':'Unauthorized'});
    }
    next(); //next() leitet req weiter an die nächste callback-funktion
}

app.get ('/authentication', (req,res)=>{
    if(!req.session.email){
        return res.send({'email':''});
    }

    console.log('req.session.email')
    console.log(req.session.email)
    return res.send({'email':req.session.email});
})

app.get('/logout', auth, (req,res)=>{
    delete req.session.email
        return res.send({'email':''}) //Nachricht an user
})

app.get('/createAcc', async(req,res)=>{

        if(!(req.query.email && req.query.password)){
            return res.send({'error': 1001, 'message':'Email und Passwort angeben'})
        }

        let userHash = await getHash(req.query.password);
        
        console.log(`Sign up ==>> ${req.query.password} = ${userHash}`)

        let accountEPP = [
            {
                email: req.query.email,
                password: userHash,
                privilege: "guest"
            }
        ];

        let userFound = await User.find({'email':req.query.email});
        
        if(userFound.length > 0){
                console.log(chalk.green.bold.inverse('email already exits'))
                return res.send({'error': 1002, 'message':'User exists'})
        } else {
                await User.create(accountEPP);
                console.log(chalk.yellow.bold.inverse('Account created'))
                req.session.email = req.query.email;
                req.session.privilege = 'guest';
                console.log(chalk.red.inverse(req.session.email + '  ist angemeldet als  ' + req.session.privilege))

                return res.send({'error': 0, 'message':`Hallo ${req.session.email}`})
        }
})



app.get('/content', authAdmin, (req, res) => { //auth wird ausgeführt, req wird erst weiterverarbeitet
                                          //wenn auth next() ausführt
    return res.send('This is the secret area')
})

app.get('/privateProfile', auth, (req,res) => {
    return res.send('Private area!')
})

app.get('/deleteAcc', auth, async(req,res) => {

    await User.deleteOne({'email':req.session.email});
    delete req.session.email;
    return res.send('You are deleted');
})

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

app.get('/getAdmin', auth, async(req,res) => {

    let filter = {'email': req.session.email};
    await User.findOneAndUpdate(filter,{'privilege': 'admin'},{new:true});
    return res.send({message: 'Now you are an Admin.'})
})



//=====================================================================================
//MongoBlog
app.get('/mongoBlog', auth, async(req,res)=>{
    const posts = await Post.find()
    console.log("posts:")
    console.log(posts)
    res.json(posts)
});

app.post('/mongoBlog', auth, async(req,res)=>{
    const post = await Post.create(req.body)
    res.json(post)
});

app.get('/mongoBlogFind/:_id', auth, async(req,res)=>{
    const post = await Post.findById({"_id":req.params._id}) //gibt Objekt zurück
    res.json(post)
});

app.get('/mongoBlogFindAll/:searchStr', auth, async(req,res)=>{
    console.log(req.params);
    const subStr = new RegExp(req.params.searchStr.toLowerCase(),"i")
    console.log(subStr)

    const posts = await Post.find({
            
        $or:[
        {'title': subStr},
        {'content': subStr},
        {'email': subStr}
        ]
    })
    res.json(posts)
});

app.put('/mongoBlog/:_id', auth, async (req,res)=>{
    console.log(req.params._id)
    console.log("req.body")
    console.log(req.body)
    const post = await Post.findByIdAndUpdate(req.params._id, req.body, {new: true})
    res.json(post)
})

app.delete('/mongoBlog/:_id', auth, async(req,res)=>{
    const post = await Post.deleteOne({"_id":req.params._id})
    console.log(post)
    res.json(post)
});

//=====================================================================================
//MySQL
app.post('/blogposts', auth, (req, res) => {
    console.log('server got something to post');
    console.log(req.body);

    if(!(req.body.title && req.body.content)) {
        return res.send({ error: 'Title and content required' });
    }
    
    const querySend = `
            insert into blogposts (
                creationDate,
                title, 
                content,
                email
            )
            values (now(),?,?,?);
        `;

    connection.query(
        querySend, [ req.body.title, req.body.content, req.session.email ],

        (err, result) => {
            if(err) {
                console.log('Error: ' + err);
                return res.send({ error: err });
            }
            return res.send({ error: 0, blogpostId: result.id });
        });            
});

app.put('/blogposts/:_id', auth, (req, res) => {
    console.log('server got something to post');
    console.log(req.body);

    if(!(req.body.title && req.body.content)) {
        return res.send({ error: 'Title and content required' });
    }
    
    const querySend = `
            update blogposts set
                title = ?, 
                content = ?,
                email = ?
            where
                _id = ?`;

    connection.query(
        querySend, [ req.body.title, req.body.content, req.session.email, req.params._id ],

        (err, result) => {
            if(err) {
                console.log('Error: ' + err);
                return res.send({ error: err });
            }
            return res.send({ error: 0, blogpostId: result.id });
        });            
});

app.get('/blogposts', auth, (req, res) => {
    let queryStr = '';

    if(req.query.q){
        console.log('Query Search: ' + req.query.q)
        queryStr = `select * from blogposts 
        where title like "%${req.query.q}%" 
        or content like "%${req.query.q}%"
        or email like "%${req.query.q}%"`;
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

app.delete('/blogposts/:_id', auth, (req, res) => {
    
    const querySend = `
            delete from blogposts where
                _id = ?`;

    connection.query(
        querySend, [ req.params._id ],

        (err, result) => {
            if(err) {
                console.log('Error: ' + err);
                return res.send({ error: err });
            }
            return res.send({ error: 0, blogpostId: result.id });
        });            
});



    
app.listen(3000);   
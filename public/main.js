

const articleBtn = document.getElementById('navArticle');
const newArticleBtn = document.getElementById('newArticle');
const contentArea = document.getElementById('content');
const articleHeaderArea = document.getElementById('articleHeader');
const articleContentArea = document.getElementById('articleContent');
const articleInputArea = document.getElementById('articleInput');
const headlineInputArea = document.getElementById('headlineInput');
const articleTextInpArea = document.getElementById('articleTextInp');
const articleUpdateArea = document.getElementById('articleUpdate');
const sendTextBtn = document.getElementById('sendText');
const mysqlBtn = document.getElementById('navMysql');
const mongoBtn = document.getElementById('navMongoDB');

const emailField = document.getElementById('email')
const passwordField = document.getElementById('password')
const notifyField = document.getElementById('notify')
const loginBtn = document.getElementById('login')
const logoutBtn = document.getElementById('logout')
const signupBtn = document.getElementById('signup')

let route = '';

const logInStyler = (status) => {
    if(status === 0){
        document.getElementById('header').style.height = '85px';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block'
    } else {
        document.getElementById('header').style.height = '155px';
        logoutBtn.style.display = 'inline-block';
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none'
    }

}
//------------login logout
const login = async() => {
    const userEmail = emailField.value;
    const userPassword = passwordField.value;

    const result = await fetch(`http://localhost:3000/login?email=${userEmail}&password=${userPassword}`);
    const data = await result.text();
    notifyField.innerHTML = data;
    emailField.value = '';
    passwordField.value = '';
    logInStyler(1);
    initBlog(route);
}

const logout = async() => {
    const result = await fetch(`http://localhost:3000/logout`);
    const data = await result.json();

    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Du hast dich erfolgreich ausgeloggt!</div></div>`;
        notifyField.innerHTML = 'You need to log in!';
        emailField.value = '';
        passwordField.value = '';
        logInStyler(0);
        route = '';
    }else{
       initBlog(route); 
    }
}

const signup = async() => {
    const userEmail = emailField.value;
    const userPassword = passwordField.value;
    console.log(userEmail)
    const result = await fetch(`http://localhost:3000/createAcc?email=${userEmail}&password=${userPassword}`);
    const data = await result.text();
    notifyField.innerHTML = data;
    emailField.value = '';
    passwordField.value = '';
    logInStyler(1);
    initBlog(route);
}
//------------------------

let authentication = async() => {
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return false;
    }
    logInStyler(1);
    return true;
}

(async() => {
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        route = '';
        return;
    }
    notifyField.innerHTML = data.email;
    emailField.value = '';
    passwordField.value = '';
    logInStyler(1);
    initBlog(route);
})()

mysqlBtn.addEventListener("click", async()=>{

    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
    }    
    mysqlBtn.style.color = 'red';
    mongoBtn.style.color = 'white';
    route = 'blogposts';
    logInStyler(1);
    initBlog(route);
}); 

mongoBtn.addEventListener("click", async()=>{
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
        }    
    mongoBtn.style.color = 'red';
    mysqlBtn.style.color = 'white';
    route = 'mongoBlog';
    logInStyler(1);
    initBlog(route);
}); 

const initBlog = async(route) => {

    if (route === '') {
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Wähle eine Datenbank!</div></div>`;
        return;
    }
    contentArea.style.display = "flex";
    articleInputArea.style.display = "none";
    articleUpdateArea.style.display = "none";   
    const result = await fetch(`http://localhost:3000/${route}`);
    const data = await result.json();
    console.log('data:');
    console.log(data);
    writeBlogData(data);
}

const writeBlogData = (data) => {
    let articleHTML = ``;
    let dataID = 0;
    let date = '';
    
    for(article of data){
        console.log(article.email);
        let user = article.email.split('@',1);
        console.log(user);
        articleHTML += `<div class='article' id='${article._id}'>
        <div class="idfy user">user: ${user}</div>
        <div class="idfy">date: ${article.creationDate}</div>
        <div class="idfy">ID#${article._id}</div>
        <span class="idfy">title:</span><a id="articleHeader${article._id}" class='headerlink' href="#"> ${article.title}</a>
        <div id="articleContent${article._id}" class="articleContent">${article.content}</div>
        <div class="manipulate">
        <button id='delete${article._id}' class="delBtn" onclick="deleteById('${article._id}')">delete</button>
        <button id='update${article._id}' class="updBtn" onclick="updateFunc('${article._id}','${user}')">update</button>
        </div>
        </div>` 

    }
    contentArea.innerHTML = articleHTML; 
    contentArea.scrollIntoView({block: "start", behavior: "smooth"}); 
}



const updateFunc = async(artid, user) => {

    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
        } 
    else if (data.email.split('@',1) != user){
        alert('not your blogpost');
        return;
    }

    articleUpdateArea.style.display = "flex"; 
    contentArea.style.display = "none";
    articleInputArea.style.display = "none";

    let htmlStr = `
    <div class='currentID'>update ID: ${artid}</div>
    <input type="text" name="" id="headlineUpdate"></input>
    <textarea name="articleTextInp" id="articleTextUpd" cols="50" rows="20"></textarea>
    <button id='updText' onclick="updateById('${artid}')">Update</button>`
    articleUpdateArea.innerHTML = htmlStr;

    document.getElementById('headlineUpdate').value = document.getElementById(`articleHeader${artid}`).innerHTML;
    document.getElementById('articleTextUpd').value = document.getElementById(`articleContent${artid}`).innerHTML;
}



articleBtn.addEventListener("click", async()=>{
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
    }   
    logInStyler(1); 
    contentArea.style.display = "flex";
    articleInputArea.style.display = "none";
}); 

newArticleBtn.addEventListener("click",async()=>{
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
    }  
    logInStyler(1);  
    contentArea.style.display = "none";
    articleInputArea.style.display = "flex";
}); 

sendTextBtn.onclick = async() => {
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
        } 
    logInStyler(1);
    let newArticle = {
        title: `${headlineInputArea.value}`,
        content: `${articleTextInpArea.value}`,
        email: `${data.email}`
    }
    let newArticleJSON = JSON.stringify(newArticle);
    //let newArticleJSON = newArticle.json()

    console.table("newArticle");
    console.table(newArticle);

    try{
        await fetch(`http://localhost:3000/${route}`,
            {
                headers: {
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                method: "POST",
                body: newArticleJSON
            })
        }
        catch(e){
            console.log('Error' + e);
        }
    initBlog(route);
}

const updateById = async(id) => {
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
    }    
    logInStyler(1);
    let newArticle = {
        title: headlineUpdate.value,
        content: articleTextUpd.value,
        email: data.email
    }
    let newArticleJSON = JSON.stringify(newArticle);
    //let newArticleJSON = newArticle.json()

    console.table(newArticle);

    try{
        await fetch(`http://localhost:3000/${route}/${id}`,
            {
                headers: {
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                method: "PUT",
                body: newArticleJSON
            })
        }
        catch(e){
            console.log('Error' + e);
        }
    initBlog(route);
}

const deleteById = async(id) => {
    const result = await fetch(`http://localhost:3000/authentication`);
    const data = await result.json();
    console.log('authentication data=');
    console.log(data);
    if(data.email === ''){
        contentArea.innerHTML = `<div class='article' id='#'>
        <div class="init">Logge dich ein!</div></div>`;
        logInStyler(0);
        return;
    } 
    logInStyler(1);   

    try{
        await fetch(`http://localhost:3000/${route}/${id}`,
            {
                headers: {
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                method: "DELETE"
            })
        }
        catch(e){
            console.log('Error' + e);
        }
    initBlog(route);
}


let searchField = document.getElementById('searchField');


let findInBlog = async() => {
    let searchStr = document.getElementById('searchField').value;
    if(searchStr === ''){
        initBlog(route);
        return;
    }
    console.log('FIND >> ' + route)
    console.log('searchStr: ' + searchStr)
    contentArea.style.display = "flex";
    articleInputArea.style.display = "none";
    let data = '';
    if(route === 'mongoBlog'){ //================MongoDB
        subRoute = 'mongoBlogFindAll'
        const result = await fetch(`http://localhost:3000/${subRoute}/${searchStr}`);
        data = await result.json();
        console.log('Mongo data:');
        console.log(data);
        writeBlogData(data);
    } else { //==================================MySQL
        const result = await fetch(`http://localhost:3000/${route}?q=${searchStr}`);
        data = await result.json();
        console.log('MySQL data:');
        console.log(data);
        writeBlogData(data);
    }
}
searchField.addEventListener("change", findInBlog)
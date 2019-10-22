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

let route = '';

mysqlBtn.addEventListener("click", ()=>{
    mysqlBtn.style.color = 'red';
    mongoBtn.style.color = 'white';
    route = 'blogposts';
    initBlog(route);
}); 

mongoBtn.addEventListener("click", ()=>{
    mongoBtn.style.color = 'red';
    mysqlBtn.style.color = 'white';
    route = 'mongoBlog';
    initBlog(route);
}); 

const initBlog = async(route) => {
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
        articleHTML += `<div class='article' id='${article._id}'><div class="idfy">date: ${article.creationDate}</div><div class="idfy">ID#${article._id}</div>
        <span class="idfy">title:</span><a id="articleHeader${article._id}" class='headerlink' href="#"> ${article.title}</a>
        <div id="articleContent${article._id}" class="articleContent">${article.content}</div>
        <div class="manipulate">
        <button id='delete${article._id}' class="delBtn" onclick="deleteFunc('${article._id}')">delete</button>
        <button id='update${article._id}' class="updBtn" onclick="updateFunc('${article._id}')">update</button>
        </div>
        </div>` 

    }
    contentArea.innerHTML = articleHTML;  
}



const updateFunc = (artid) => {
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

const deleteFunc = (artid) => {
    
}

articleBtn.addEventListener("click", ()=>{
    contentArea.style.display = "flex";
    articleInputArea.style.display = "none";
}); 

newArticleBtn.addEventListener("click", ()=>{
    contentArea.style.display = "none";
    articleInputArea.style.display = "flex";
}); 

sendTextBtn.onclick = async() => {
    
    let newArticle = {
        title: `${headlineInputArea.value}`,
        content: `${articleTextInpArea.value}`
    }
    let newArticleJSON = JSON.stringify(newArticle);
    //let newArticleJSON = newArticle.json()

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
    
    let newArticle = {
        title: `${headlineInputArea.value}`,
        content: `${articleTextInpArea.value}`
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


let searchField = document.getElementById('searchField');


let findInBlog = async() => {
    let searchStr = document.getElementById('searchField').value;
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
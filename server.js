const express = require('express');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;

const users = [];
const replace = require('replace-in-file');
var fs = require('fs');
app.use(bodyParser.json());
app.use(express.static(process.cwd()+"/my-app/dist/angular-nodejs-example/"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.post('/api/create-module', async (req, res) => {
  const { exec } = require("child_process");
  let  routes = '[';
  let li = '';
  let lists = '';
  let options = {};
  await new Promise((resolve,reject)=>{
    exec("cd admin && ng g module "+req.body.name+" --route "+req.body.name+" --module app.module", (error, stdout, stderr) => {
    
    if(stdout){
      
      li = '\n<li class="nav-item"><a class="nav-link active">'+req.body.name+'</a></li>'
      options = {
        files: 'admin/src/app/'+req.body.name+'/'+req.body.name+'-routing.module.ts',
        from: /Routes = .*/g
        
      };
      resolve(stdout)
  // exec("cd admin/src/app/"+req.body.name+"&& sed 's/routes/routing/g' "+req.body.name+"-routing.module.ts", (error, stdout, stderr) => {
  //     console.log("its createds")
  //     });
  
    }
  })
  })
  if(req.body.list){
    var component = req.body.name+'/list';
    await new Promise((resolve,reject)=>{
        exec("cd admin && ng g  c "+component, (error, stdout, stderr) => {
        if(stdout){
            routes = routes+"\n{path: 'list', component: ListComponent},";
            var data = fs.readFileSync(options.files).toString().split("\n");
            data.splice(0, 0, "import { ListComponent } from './list/list.component';" );
            var text = data.join("\n");

            fs.writeFile(options.files, text, function (err) {
              if (err) return err;
              resolve(routes)
            });
            lists = lists+'\n<li class="nav-item"><a class="nav-link active" routerLink="/'+component+'">List</a></li>'
        }
        });
    })
  }
  if(req.body.add_edit){
    var component = req.body.name+'/add-edit';
    await new Promise((resolve,reject)=>{
      exec("cd admin && ng g c "+component, (error, stdout, stderr) => {
      if(stdout){
        routes = routes+"\n{path: 'add-edit', component: AddEditComponent},\n{path: 'add-edit/:id?', component: AddEditComponent}]";
        var data = fs.readFileSync(options.files).toString().split("\n");
            data.splice(0, 0, "import { AddEditComponent } from './add-edit/add-edit.component';" );
            var text = data.join("\n");

            fs.writeFile(options.files, text, function (err) {
              if (err) return err;
              resolve(routes)
            });
            lists = lists+ '\n<li class="nav-item"><a class="nav-link active" routerLink="/'+component+'">Add</a></li>'
            
         }
    });
    })
  }else{
    routes = routes+']';
  }
  if(lists){
    var ul = li+'\n<ul>'+lists+'\n</ul>';
  }
  else{
    var ul = li;
  }
  await new Promise((resolve,reject)=>{ 
    fs.appendFile('admin/src/app/sidebar/sidebar.component.html',ul, 'utf8',
    (err)=> { 
      if (err) throw err;
      resolve(ul)
      console.log("Data is appended to file successfully.")
    });
  })
  options.to = 'Routes = '+ routes;
  return replace(options)
  .then(results => {
    console.log('Replacement results:', results);
    
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
 })

app.post('/api/user', (req, res) => {
  const user = req.body;
  users.push(user);
  res.json("user addedd");
});

app.get('/', (req,res) => {
  res.sendFile(process.cwd()+"/my-app/dist/angular-nodejs-example/index.html")
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

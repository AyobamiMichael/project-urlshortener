require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
const { doesNotMatch } = require('assert');


const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: Number
})

const urlShortner = mongoose.model('Urllist', urlSchema);



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

 app.use(express.json());
 app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));


const requestObj = {};
const generateRandNum = () => {
  const randNumber = Math.floor(Math.random() * 99);
  return randNumber;
} 

app.post('/api/shorturl', (req, res, next)=>{
        
  const randNum = generateRandNum()
  var query = req.body.url

   if(!query.includes('https://')){
      res.json({error: 'invalid url'});
       return
   }

  urlShortner.findOne({original_url: query}, (error, result) =>{
    if(error) console.log(error);
    if(result){
          console.log("Already created")
          let resultObj = {'original_url': result.original_url, 'short_url': result.short_url};

           res.json(resultObj)
    }else{

           const URL = new urlShortner({ original_url: req.body.url, short_url: randNum})

           URL.save((err, data) => {
    if (err) {
      console.log(err);
     } else {
       console.log(data);
         requestObj['original_url'] = req.body.url;
         requestObj['short_url'] = randNum
         res.json(requestObj)
        // res.json(data);
      }
    });
        
    } 
  }) 
     
});

app.get('/api/shorturl/:value',(req, res)=>{
  const value = req.params.value;
  console.log(value);
  var intValue = parseInt(value);
//      const foundUrl = findUrl();
     urlShortner.findOne({short_url: intValue}, (error, urlFound)=>{
             if(error){
               console.log(error);
             }else{
                 console.log(urlFound.original_url);

                 res.redirect(urlFound.original_url);
             }      
     });
   
       
});



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

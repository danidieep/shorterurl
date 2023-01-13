require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const { urlencoded } = require('body-parser');
const app = express();
const MONGO_URI='mongodb+srv://daniAdmin:YJnkgxhbtE99bSJr@cluster0.yenpvps.mongodb.net/shortener-url?retryWrites=true&w=majority'
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short: Number
})

const Url = mongoose.model("URL", urlSchema)

const verifyUrl = (url) =>{
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}
// Basic Configuration
const port = process.env.PORT || 3000;



app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:input', (req, res) =>{
  let input = req.params.input
  Url.findOne({short: input}, (err, urlFound) =>{
    if(!err && urlFound != undefined){
      console.log(urlFound)
      res.redirect(urlFound.original_url)
    } 
  })
})


app.post('/api/shorturl', urlencoded({extended:false}), (req, res) =>{
  let url = req.body.url
  let obj = {}
  let lastShort = 1
  obj.original_url = url
  let urlRegex = new RegExp(/https?:\//)

  try {
      if(!obj.original_url.match(urlRegex)){
     res.json({error : "invalid url"})
     return
  }
    Url.findOne({}).sort({short:'desc'}).exec((e, data)=>{
      if(!e && data != undefined){
        lastShort = data.short+1
      }
      if(!e){
        Url.findOneAndUpdate({original_url:url}, {original_url: url, short: lastShort}, {new: true, upsert: true},
          (err, savedUrl) =>{
            if(!err){
              console.log(savedUrl)
              res.json({original_url: url, short_url: savedUrl.short})
            }
          })
      }
    })
  } catch (error) {
    res.send(error)
  }
    
  
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

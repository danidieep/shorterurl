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



app.post('/api/shorturl', urlencoded({extended:false}), (req, res) =>{
  let url = req.body.url
  let lastShort = 1
  let obj = {}
  obj.original_url = url
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
  if(!url.match(urlRegex)){
    return res.json({error : "invalid url"})
  }
  Url.findOne({}).sort({short:'desc'}).exec((e, data)=>{
    if(!e && data != undefined){
      lastShort = data.short+1
    }
    if(!e){
      Url.findOneAndUpdate({original_url:url}, {original_url: url, short: lastShort}, {new: true, upsert: true},
        (err, savedUrl) =>{
          if(!err){
            obj.short = savedUrl.short
            res.json(obj)

          }
        })
    }
  })
})

app.get('/api/shorturl/:shortUrl', (req, res) =>{
  let {shortUrl} = req.params
  Url.findOne({short: shortUrl}, (err, urlFound) =>{
    if(err) res.json({error: "URL not found"})
    res.redirect(urlFound.original_url)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

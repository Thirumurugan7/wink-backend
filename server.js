const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { log } = require('console');

const app = express();
const port = 3001;

// MongoDB Connection
mongoose.connect('mongodb+srv://Thiru:Gryffindor7@cluster0.96vb1.mongodb.net/Links', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const linkSchema = new mongoose.Schema({
  walletAddress: String,
  amount: Number,
  chainDetails: String,
  uniqueId: String,
  type:Number,
  contractAddress: String,
  abi: String,
  functionName: String,
  uri:String


});

const Link = mongoose.model('Link', linkSchema);


app.use(cors());
app.use(bodyParser.json());

app.post('/create-link', async (req, res) => {
  console.log("called");
  const {  walletAddress,
    amount,
    chainDetails,

    type,
    contractAddress,
    functionName,
    uri,
    abi, } = req.body;

    console.log(walletAddress,
      amount,
      chainDetails,
  
      type,
      contractAddress,
      functionName,
      uri,
      abi);
    let uniqueId;
    let isUnique = false;
  
    // Generate a unique ID and check if it already exists in the database
    while (!isUnique) {
      uniqueId = uuidv4();
      const existingLink = await Link.findOne({ uniqueId });
      if (!existingLink) {
        isUnique = true;
      }
    }
  const newLink = new Link({
    walletAddress,
    amount,
    chainDetails,
    uniqueId,
    type,
    contractAddress,
    functionName,
    abi,
    uri
  });

  await newLink.save();

  res.status(200).json({ link: `http://localhost:3000/?search=${uniqueId}` });
});


app.get('/get-link/:uniqueId', async (req, res) => {
  console.log("caleed get");
  const { uniqueId } = req.params;
  const link = await Link.findOne({ uniqueId });

  if (link) {
    res.status(200).json(link);
  } else {
    res.status(404).json({ message: 'Link not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

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
});

const Link = mongoose.model('Link', linkSchema);

app.use(cors());
app.use(bodyParser.json());

app.post('/create-link', async (req, res) => {
  const { walletAddress, amount, chainDetails } = req.body;
  const uniqueId = uuidv4();

  const newLink = new Link({
    walletAddress,
    amount,
    chainDetails,
    uniqueId,
  });

  await newLink.save();

  res.json({ link: `http://localhost:3000/?search=${uniqueId}` });
});

app.get('/get-link/:uniqueId', async (req, res) => {
  const { uniqueId } = req.params;
  const link = await Link.findOne({ uniqueId });

  if (link) {
    res.json(link);
  } else {
    res.status(404).json({ message: 'Link not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

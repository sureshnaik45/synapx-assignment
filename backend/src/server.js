require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processClaim } = require('./controllers/claimController');
const os = require('os');

const app = express();
const upload = multer({ dest: os.tmpdir() });

app.use(cors());
app.use(express.json());

app.post('/api/claims/upload', upload.single('file'), processClaim);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
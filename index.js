const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');

const { PORT, MONGO, HOST } = process.env;

const uploadURL = require("./s3");

app.listen(PORT, HOST, () => {
	console.log(`[server] listening on ${HOST}:${PORT}`);
});

mongoose.connect(`${MONGO}CrowdfundingApp`);

const db = mongoose.connection;

db.once('open', () => console.log(`Connected to: ${MONGO}`));

app.use(express.json());
app.use(require('cors')());

const users = require('./controllers/user.controller');

app.use('/user', users);

app.listen(PORT);
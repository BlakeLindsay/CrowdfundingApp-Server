const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');

const { PORT, MONGO } = process.env;

mongoose.connect(`${MONGO}CrowdfundingApp`);

const db = mongoose.connection;

db.once('open', () => console.log(`Connected to: ${MONGO}`));

app.use(express.json());
app.use(require('cors')());

const users = require('./controllers/user.controller');

app.use('/user', users);

app.listen(PORT);
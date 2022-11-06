/**
 * Mongoose Node.js shell.
 * @author: Ignacio Nieto Carvajal <contact@digitalleaves.com>
 * A convenient MongoDB command shell written in Node.js using Mongoose.
 */

//
// Requirements
//
import mongoose from 'mongoose';
import catNames from 'cat-names';
//
// Constants
//

//
// Variables
//

// connection
let connection = null;
let mongoUrl = null;

//
// Functions
//

const connectToDatabase = (dbName, callback) => {
	if (!connection) {
		console.log('Opening database connection to '+dbName);
		if (dbName.startsWith('mongodb:')) {
			mongoUrl = dbName;
		} else {
			mongoUrl = `mongodb://localhost:27017/${dbName}`;
		}
		const db = mongoose.createConnection(mongoUrl, {
			useNewUrlParser: true,
			useUnifiedTopology: false,
		});
		connection = db;

		// If the Node process ends, close the Mongoose connection
		process.on('SIGINT', () => { if (connection) { connection.close(() => { connection = null; }) } });
		process.on('exit', () => { if (connection) { connection.close(() => { connection = null; }) } });

		if (callback) { callback(connection); }
	} else {
		if (callback) { callback(connection); }
	}
};

const currentConnection = () => connection;

const closeConnection = (callback) => {
	if (connection) {
		connection.close(() => {
			connection = null;
			if (callback) { callback(); }
		});
	} else {
		if (callback) { callback(); }
	}
};

//
// Initialization
//

const myArgs = process.argv.slice(2);

if (myArgs.length < 1) {
	console.log('Using default "test" database on localhost');
}
const databaseUrl = myArgs.length < 1 ? 'test' : myArgs[0];

try {
	connectToDatabase(databaseUrl, async function (connection) {
		if (!connection) {
			console.log('Error establishing connection to database. Exiting.');
			closeConnection(() => { process.exit(-1); });
		} else {
			console.log('Connection established. Connected to '+mongoUrl);
		}
		// Define schema and model
		const kittySchema = new mongoose.Schema({
			name: String
		});
		var Kitten = connection.model('kittens', kittySchema);
		console.log('📊 Created kitty schema and model.')

		// Create a random cat
		const name = catNames.random();
		var oneKitty = new Kitten({ name: name });
		console.log('🐈 Adding cat named '+name);

		oneKitty.save(function (err, harrykitty) {
			if (err) return console.error(err);
			console.log('🎉 Successfully added cat '+oneKitty.name);

			// Retrieving all cats
			console.log('🐈🐈🐈 Retrieving all cats');
			Kitten.find({}, function (err, kittens) {
				console.log(err);
				console.log(kittens);
				// exit
				console.log('🐈 My work here is done. Exiting... Meow!!!');
				closeConnection(() => { process.exit(0); });
			})
		});
	});
} catch (e) {
	
}

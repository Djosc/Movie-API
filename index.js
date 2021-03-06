/**
 * Define JSON
 * @typedef {string} JSON
 * Express Routes
 * @namespace Routes
 */

const express = require('express'),
	morgan = require('morgan'),
	mongoose = require('mongoose'),
	Models = require('./models.js');
const { check, validationResult } = require('express-validator');

// !deprecated apparently
// const bodyParser = require('body-parser');

const Movies = Models.Movie;
const Users = Models.User;

app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
// let allowedOrigins = ['*'];
// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             let message = 'The CORS policy for this application doesn\'t allow access from origin '
//                 + origin;
//             return callback(new Error(message), false);
//         }
//         return callback(null, true);
//     }
// }));
app.use(cors());

let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

mongoose.connect(process.env.CONNECTION_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send('Welcome to My Flix!');
});

app.get('/documentation', (req, res) => {
	res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * Movies - Gets full list of movies
 * @function
 * @name get/movies
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - full collection of movies as JSON
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	// app.get('/movies', (req, res) => {
	Movies.find()
		.then((movies) => {
			res.status(200).json(movies);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * Movies - Gets single movie by title
 * @function
 * @name get/movies/:Title
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - movie object as JSON
 */
app.get(
	'/movies/:Title',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.findOne({ Title: req.params.Title })
			.then((movie) => {
				res.status(200).json(movie);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

/**
 * Genre - get genre description by genre name
 * @function
 * @name get/genres/:Genre
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - genre description as JSON
 */
app.get(
	'/genres/:Genre',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.findOne({ 'Genre.Name': req.params.Genre })
			.then((genre) => {
				res.status(200).json(genre.Genre.Description);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

/**
 * Director - get director info by name
 * @function
 * @name get/directors/:Director
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - director object as JSON
 */
app.get(
	'/directors/:Director',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.findOne({ 'Director.Name': req.params.Director })
			.then((director) => {
				res.status(200).json(director.Director);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

/**
 * Get Users - get all users
 * @function
 * @name get/users
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - user objects as JSON
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.find()
		.then((users) => {
			res.status(200).json(users);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * Get User - get user by username
 * @function
 * @name get/users/:Username
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - user object as JSON
 */
app.get(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Users.findOne({ Username: req.params.Username })
			.then((user) => {
				res.json(user);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

/**
 * Post User - post new user to DB
 * @function
 * @name post/users
 * @memberof Routes
 * @param {Array} validation Checks - form validation functions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - new user object as JSON
 */
app.post(
	'/users',
	// Validation Logic for request
	[
		check('Username', 'Username is required').isLength({ min: 5 }),
		check(
			'Username',
			'Username contains non-alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check('Password', 'Password is required').not().isEmpty(),
		check('Email', 'Email does not appear to be valid').isEmail(),
	],
	(req, res) => {
		// Check validation object for errors
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		let hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOne({ Username: req.body.Username }) // Check if username already exists
			.then((user) => {
				if (user) {
					return res.status(400).send(req.body.Username + ' already exists.');
				} else {
					Users.create({
						Username: req.body.Username,
						Password: hashedPassword,
						Email: req.body.Email,
						Birthday: req.body.Birthday,
					})
						.then((user) => {
							res.status(201).json(user);
						})
						.catch((error) => {
							console.error(error);
							res.status(500).send('Error ' + error);
						});
				}
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error ' + error);
			});
	}
);

/**
 * Update User - update user by username
 * @function
 * @name put/users/:Username
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Array} validation Checks - form validation functions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - updated user object as JSON
 */
app.put(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	// Validation Logic for request
	[
		check('Username', 'Username is required').isLength({ min: 5 }),
		check(
			'Username',
			'Username contains non-alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check('Password', 'Password is required').not().isEmpty(),
		check('Email', 'Email does not appear to be valid').isEmail(),
	],
	(req, res) => {
		// Check validation object for errors
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ erros: errors.array() });
		}

		let hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
				$set: {
					Username: req.body.Username,
					Password: hashedPassword,
					Email: req.body.Email,
					Birthday: req.body.Birthday,
				},
			},
			{ new: true }, // make sure updated document is returned
			(err, updatedUser) => {
				if (err) {
					console.error(err);
					res.status(500).send('Error: ' + err);
				} else {
					res.json(updatedUser);
				}
			}
		);
	}
);

/**
 * Add Favorite - post new movie to user's favorites
 * @function
 * @name post/users/:Username/movies/:MovieID
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - updated user object as JSON
 */
app.post(
	'/users/:Username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
				$push: { FavoriteMovies: req.params.MovieID },
			},
			{ new: true }, // make sure updated document is returned
			(err, updatedUser) => {
				if (err) {
					console.error(err);
					res.status(500).send('Error: ' + err);
				} else {
					res.json(updatedUser);
				}
			}
		);
	}
);

/**
 * Remove Favorite - remove movie from user's favorites
 * @function
 * @name delete/users/:Username/movies/:MovieID
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response object - updated user object as JSON
 */
app.delete(
	'/users/:Username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
				$pull: { FavoriteMovies: req.params.MovieID },
			},
			{ new: true }, // make sure updated document is returned
			(err, updatedUser) => {
				if (err) {
					console.error(err);
					res.status(500).send('Error: ' + err);
				} else {
					res.json(updatedUser);
				}
			}
		);
	}
);

/**
 * Delete User - delete specific user's account
 * @function
 * @name delete/users/:Username/movies/:MovieID
 * @memberof Routes
 * @param {function} passport.authenticate - authenticates with jwt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {String} response - String saying if the user was deleted or not found
 */
app.delete(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Users.findOneAndRemove({ Username: req.params.Username })
			.then((user) => {
				if (!user) {
					res.status(400).send(req.params.Username + ' was not found.');
				} else {
					res.status(200).send(req.params.Username + ' was deleted.');
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('An error has been found');
	next();
});

// List on port specified by env variable or default to port 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on port: ' + port);
});

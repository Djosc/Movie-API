const express = require('express'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

// !deprecated apparently
// const bodyParser = require('body-parser'); 

const port = 8080;

const Movies = Models.Movie;
const Users = Models.User;

app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/myFlixDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to My Flix!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// Gets full list of movies
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Gets data about a movie by title
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.status(200).json(movie)
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Get genre description
app.get('/genres/:Genre', (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Genre })
        .then((genre) => {
            res.status(200).json(genre.Genre.Description);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Get director info by name
app.get('/directors/:Director', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Director })
        .then((director) => {
            res.status(200).json(director.Director);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Get all users 
// ! add to documentation
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Get user by Username 
// ! add to documentation
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// Register new user
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists.');
            }
            else {
                Users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                    .then((user) => { res.status(201).json(user) })
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
});

// Update user info by Username
app.put('/users/:Username', (req, res) => {
    // res.status(200).send('Succesfull PUT request updating user info');
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set:
            {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        { new: true }, // make sure updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            }
            else {
                res.json(updatedUser);
            }
        });
});

// Add movie to the user's favorite list
// ! update documentation
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $push: { FavoriteMovies: req.params.MovieID }
        },
        { new: true }, // make sure updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            }
            else {
                res.json(updatedUser);
            }
        });
});

// Remove movie from the user's favorite list
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $pull: { FavoriteMovies: req.params.MovieID }
        },
        { new: true }, // make sure updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            }
            else {
                res.json(updatedUser);
            }
        });
});

// Delete user's account by Username
app.delete('/users/:Username', (req, res) => {
    // res.status(200).send('Successfull DELETE request deleting user\'s account');
    Users.findOneAndUpdate({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found.');
            }
            else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been found');
    next();
});

app.listen(port, () => {
    console.log('Listening on port: ' + port);
});

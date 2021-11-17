const express = require('express'),
    morgan = require('morgan');

const port = 8080;
app = express();

let moviesArr = [
    {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        genre: ['Drama'],
        releaseYear: '1994'
    },
    {
        title: 'The Godfather',
        director: 'Francis Ford Coppola',
        genre: ['Crime', 'Drama'],
        releaseYear: '1972'
    },
    {
        title: 'The Godfather: Part II',
        director: 'Francis Ford Coppola',
        genre: ['Crime', 'Drama'],
        releaseYear: '1974'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan',
        genre: ['Action', 'Crime', 'Drama', 'Thriller'],
        releaseYear: '2008'
    },
    {
        title: '12 Angry Men',
        director: 'Sidney Lumet',
        genre: ['Crime', 'Drama'],
        releaseYear: '1957'
    },
    {
        title: 'Schindler\'s List',
        director: 'Steven Spielberg',
        genre: ['Biography', 'Drama', 'History'],
        releaseYear: '1993'
    },
    {
        title: 'The Lord of the Rings: The Return of the King ',
        director: 'Peter Jackson',
        genre: ['Action', 'Adventure', 'Drama', 'Fantasy'],
        releaseYear: '2003'
    },
    {
        title: 'Pulp Fiction',
        director: 'Quentin Tarantino',
        genre: ['Crime', 'Drama'],
        releaseYear: '1994'
    },
    {
        title: 'The Good, the Bad and the Ugly',
        director: 'Sergio Leone',
        genre: ['Adventure', 'Western'],
        releaseYear: '1996'
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        director: 'Peter Jackson',
        genre: ['Action', 'Adventure', 'Drama', 'Fantasy'],
        releaseYear: '2001'
    }
];

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
    res.json(moviesArr);
});

// Gets data about a movie by title
app.get('/movies/:title', (req, res) => {
    let movie = moviesArr.find((movie) => { return movie.title === req.params.title });

    if (movie) {
        res.status(200).json(movie);
    }
    else {
        res.status(400).send('No movie with title: ' + req.params.title);
    }
});

// TODO fully implement endpoints
// Get genre description
app.get('/genres/:genre', (req, res) => {
    res.status(200).send('Successfull GET request returning genre description');
});

// Get director info
app.get('/directors/:director', (req, res) => {
    res.status(200).send('Successfull GET request returning director info');
});

// Register new user
app.post('/users', (req, res) => {
    res.status(200).send('Successfull POST request for registering new user');
});

// Update user info
app.put('/users/:userName', (req, res) => {
    res.status(200).send('Succesfull PUT request updating user info');
});

// Add movie to the user's favorite list
app.post('/users/add/:movie', (req, res) => {
    res.status(200).send('Succesfull POST request adding movie favorites list');
});

// Remove movie from the user's favorite list
app.delete('/users/remove/:movie', (req, res) => {
    res.status(200).send('Succesfull DELETE request removing movie from favorites list');
});

// Delete user's account
app.delete('/users/deleteAccount', (req, res) => {
    res.status(200).send('Successfull DELETE request deleting user\'s account');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been found');
    next();
});

app.listen(port, () => {
    console.log('Listening on port: ' + port);
});

const express = require('express'),
    morgan = require('morgan');

const port = 8080;
app = express();

let myMovies = [
    {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        releaseYear: '1994'
    },
    {
        title: 'The Godfather',
        director: 'Francis Ford Coppola',
        releaseYear: '1972'
    },
    {
        title: 'The Godfather: Part II',
        director: 'Francis Ford Coppola',
        releaseYear: '1974'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan',
        releaseYear: '2008'
    },
    {
        title: '12 Angry Men',
        director: 'Sidney Lumet',
        releaseYear: '1957'
    },
    {
        title: 'Schindler\'s List',
        director: 'Steven Spielberg',
        releaseYear: '1993'
    },
    {
        title: 'The Lord of the Rings: The Return of the King ',
        director: 'Peter Jackson',
        releaseYear: '2003'
    },
    {
        title: 'Pulp Fiction',
        director: 'Quentin Tarantino',
        releaseYear: '1994'
    },
    {
        title: 'The Good, the Bad and the Ugly',
        director: 'Sergio Leone',
        releaseYear: '1996'
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        director: 'Peter Jackson',
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

app.get('/movies', (req, res) => {
    res.json(myMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been found');
    next();
});

app.listen(port, () => {
    console.log('Listening on port: ' + port);
});

const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const intilizeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

intilizeDatabaseAndServer()

//Get Movies API
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    select
        movie_name AS movieName
    From
        movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray)
})

//Add Movie API
app.post('/movies/', async (request, response) => {
  const getDetails = request.body
  const {directorId, movieName, leadActor} = getDetails
  const addMovieQuery = `
  INSERT INTO 
      movie(director_id, movie_name, lead_actor)
  values(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//Get Movie API
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  select 
    *
  from
      movie
  where
   movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  const {movie_id, director_id, movie_name, lead_actor} = movie
  const dbResponse = {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  }
  response.send(dbResponse)
})

//update Movie API
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getBody = request.body
  const {directorId, movieName, leadActor} = getBody
  const updateMovieQuery = `
  update
    movie
  set 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}' 
  where
    movie_id = ${movieId} ;`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    delete
      from movie
    where
      movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get Directors API
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    select
        director_id as directorId ,
        director_name as directorName
    from
        director;`
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(directorsArray)
})

//Get Movies directed by specific director API
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getSpecificMoviesQuery = `
    select
        movie_name AS movieName
    From
        movie
    where
        director_id = ${directorId};`
  const specificMoviesArray = await db.all(getSpecificMoviesQuery)
  response.send(specificMoviesArray)
})

module.exports = app

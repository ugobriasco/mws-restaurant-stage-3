# MWS Restaurants Review III

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Installation

This application depends on [node.js LTS Version: v6.11.2 ](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/get-npm), [sails.js](http://sailsjs.com/) and [gulp](https://gulpjs.com/)
Please make sure you have these installed before proceeding forward.

### Install Sails and Gulp globally

```
# npm i sails -g
# npm i gulp -g
```

### Install dependancies and build the project

```
# npm i
```

## Usage

Start the server:

```
# npm start
```

Launch the client:

```
# gulp
```

The project will be reachable under:

```
# http://localhost:3000
```

### Local Development API Server

debug: Environment : development
debug: Port : 1337

#### GET Endpoints

##### Get all restaurants

```
http://localhost:1337/restaurants/
```

##### Get favorite restaurants

```
http://localhost:1337/restaurants/?is_favorite=true
```

##### Get a restaurant by id

```
http://localhost:1337/restaurants/<restaurant_id>
```

##### Get all reviews for a restaurant

```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

##### Get all restaurant reviews

```
http://localhost:1337/reviews/
```

##### Get a restaurant review by id

```
http://localhost:1337/reviews/<review_id>
```

##### Get all reviews for a restaurant

```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

#### POST Endpoints

##### Create a new restaurant review

```
http://localhost:1337/reviews/
```

####### Parameters

```
{
    "restaurant_id": <restaurant_id>,
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```

#### PUT Endpoints

##### Favorite a restaurant

```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
```

##### Unfavorite a restaurant

```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false
```

##### Update a restaurant review

```
http://localhost:1337/reviews/<review_id>
```

####### Parameters

```
{
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```

#### DELETE Endpoints

##### Delete a restaurant review

```
http://localhost:1337/reviews/<review_id>
```

## Architecture

Local server

- Node.js
- Sails.js

Build

- Gulp.js

## Contributors

- [Brandy Lee Camacho - Technical Project Manager](mailto:brandy.camacho@udacity.com)
- [David Harris - Web Services Lead](mailto:david.harris@udacity.com)
- [Omar Albeik - Frontend engineer](mailto:omaralbeik@gmail.com)
- [Ugo Briasco - Udacity student](mailto:hi@ugobriasco.me)

## Issues

If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an issue to our [Waffle Dashboard](https://waffle.io/udacity/mwnd-issues). Even better you can submit a Pull Request with a fix :)

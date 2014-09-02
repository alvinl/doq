Doq
===========

Easily deploy Node.js apps using Docker containers.

## Requirements
- [Node](http://nodejs.org/)
- [Docker](https://www.docker.com/)

## Setup
You'll first need to build the Docker image before running the app.

1. Clone the repo
2. Build the Dockerfile in the repo `docker build -t doq-node:latest .`

## Config
Default config variables can be found in `config/index.js` and can be overriden by using the following environment variables:
- `PORT` The port the app will run on (defaults to `3000`)

## Installation
1. Clone the repo
3. `npm install`
4. `npm start`

## Developing
1. Install the app (see above)
2. Run `npm run watch` to have the js and css compiled automatically as you develop
3. Run `npm run build` before pushing out changes

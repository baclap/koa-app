'use strict';

// all requires for modules not in node_modules will be relative to here
require('app-module-path').addPath(__dirname);

const koa = require('koa');
const logger = require('koa-logger');
const jwt = require('koa-jwt');
const serve = require('koa-static');
const router = require('app/router');
const render = require('app/middleware/render');

const app = koa();
app.use(logger());

// all request pass through authentication layer
// will set this.state.user if the JWT verifies
// if this.state.user is not set then you know the user is not authenticated
app.use(jwt({
  secret: 'secret', // TODO change to use RS256 https://sendgrid.com/blog/json-web-tokens-koa-js/
  cookie: 'jwt', // the name of the cookie where auth token is saved
  passthrough: true // will allow request to continue through middleware stack with ctx.state.user set to null
}));

app.use(serve('public'));
app.use(render);
app.use(router.routes());

module.exports = app;

// start app if it isn't being required into another module
if (!module.parent) {
  const port = process.env.PORT || 9999;
  app.listen(port);
  console.log('Listening on port ' + port);
}

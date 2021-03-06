'use strict';

const bcrypt = require('co-bcrypt');
const jwt = require('koa-jwt');
const User = require('app/models/user');
const r = require('thinky')().r;

module.exports = {
  showLogin: function *(next) {
    this.body = yield this.render('login');
  },
  doLogin: function *(next) {
    // submitted credentials
    const username_email = this.request.body.username_email;
    const password = this.request.body.password;

    // fetch user by username or email
    let filterField = 'username';
    if (username_email.indexOf('@') != -1) {
      filterField = 'email';
    }
    const users = yield User.filter(
      r.row(filterField).match('(?i)^' + username_email + '$')
    ).run();

    if (users.length === 1) {
      const user = users[0];
      // now check if the submitted password is correct
      const success = yield bcrypt.compare(password, user.hash)
      if (success) {
        // create token
        const token = jwt.sign({
          id: user.id,
          username: user.username,
          email: user.email
        }, 'secret');

        // set token cookie
        this.cookies.set('jwt', token);

        // send user to homepage
        this.redirect('/');
        return;
      } else {
        this.flash.errors.push('Incorrect password');
      }
    } else {
      this.flash.errors.push('User not found'); // or somehow there were more than 1 found...
    }

    // ensure token is not set... might not be needed, will think on it
    this.cookies.set('jwt', null);
    this.body = yield this.render('login');
  },
  doLogout: function *(next) {
    this.cookies.set('jwt', null);
    this.redirect('/');
  }
};

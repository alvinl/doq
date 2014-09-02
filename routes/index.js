
/**
 * Dependencies
 */

var express = require('express'),
    router  = express.Router();

/**
 * GET /
 *
 * Render the `index` view
 */

router.get('/', function(req, res) {

  return res.render('index', { title: 'Doq' });

});

/**
 * GET /active
 *
 * Render the `active` view that lists all containers
 */

router.get('/active', function(req, res) {

  return res.render('active', { title: 'Doq | Active apps' });

});

module.exports = router;

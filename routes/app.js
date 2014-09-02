

/**
 * Dependencies
 */

var express = require('express'),
    router  = express.Router();

/**
 * GET /app/:containerID
 *
 * Params:
 *   - `containerID`: The container to render the view for
 *
 * Renders the `app` view if the given `containerID` exists, otherwise
 * redirect to `/`.
 */

router.get('/:containerID', function (req, res, next) {

  var docker      = req.app.get('docker'),
      containerID = req.params.containerID,
      container   = docker.getContainer(containerID);

  container.inspect(function (err, containerInfo) {

    if (err && !~err.message.indexOf('404'))
      return next(err);

    // Container doesn't exist
    else if (err)
      return res.redirect('/');

    return res.render('app', { title: 'Doq | App control',
                               containerHash: req.params.containerID,
                               containerPort: containerInfo.NetworkSettings.Ports ? containerInfo.NetworkSettings.Ports['8080/tcp'][0].HostPort : null });

  });

});

module.exports = router;



/**
 * Dependencies
 */

var sseStreamer = require('sse-streamer'),
    ansi_up     = require('ansi_up'),
    express     = require('express'),
    router      = express.Router();

/**
 * POST /api/delete
 *
 * Args:
 *   - `containerID`: The id of the container to delete
 *
 * Deletes the given container
 */

router.post('/delete', function (req, res, next) {

  var containerID = req.body.containerID,
      docker      = req.app.get('docker');

  docker.getContainer(containerID).remove({ force: true }, function (err) {

    if (err)
      return next(err);

    return res.end();

  });

});

/**
 * POST /api/relaunch
 *
 * Args:
 *   - `containerID`: The id of the container to relaunch
 *
 * Restarts the given container
 */

router.post('/relaunch', function (req, res, next) {

  var containerID = req.body.containerID,
      docker      = req.app.get('docker');

  docker.getContainer(containerID).restart({ t: 1 }, function (err, restartedContainer) {

    if (err)
      return next(err);

    console.dir(restartedContainer);

    return res.end();

  });

});

/**
 * POST /api/launch
 *
 * Args:
 *   - `url`: Http clone url to pull app from
 *   - `vars`: Environment variables to launch the container with
 *
 * Launches a new container
 */

router.post('/launch', function(req, res, next) {

  var appRepo = req.body.url,
      envVars = req.body.vars,
      docker  = req.app.get('docker');

  var reservedVars  = ['APP_REPO', 'PORT'],
      containerVars = ['NODE_VER=0.10', 'APP_REPO=' + appRepo, 'PORT=8080'];

  // Add given non-reserved environment variables
  for (var envVar in envVars) {

    if (!~reservedVars.indexOf(envVar))
      containerVars.push(envVar + '=' + envVars[envVar]);

  }

  /**
   * Options to create container with
   *
   * @type {Object}
   */
  var containerCreateOpts = {

    Image:        'doq-node',
    Memory:       262144000,
    Env:          containerVars,
    ExposedPorts: { '8080/tcp': {} },
    AttachStderr: false,
    AttachStdin:  false,
    AttachStdout: false,
    Cmd:          null,
    Tty:          true

  };

  /**
   * Options to start container with
   *
   * @type {Object}
   */
  var containerStartOpts = {

    PortBindings: {

      '8080/tcp': [ { 'HostIp': '', 'HostPort': '' } ]

    }

  };

  docker.createContainer(containerCreateOpts, function (err, container) {

    if (err)
      return next(err);

    container.start(containerStartOpts, function (err) {

      if (err)
        return next(err);

      container.inspect(function (err, containerInfo) {

        if (err)
          return next(err);

        return res.json({ port: containerInfo.NetworkSettings.Ports['8080/tcp'][0].HostPort,
                          id:   container.id });

      });

    });

  });

});

/**
 * GET /api/containers
 *
 * Returns an array of all containers
 */

router.get('/containers', function (req, res, next) {

  var docker = req.app.get('docker');

  docker.listContainers({ all: true }, function (err, containers) {

    if (err)
      return next(err);

    return res.json(containers);

  });

});

/**
 * GET /logs/:containerID
 *
 * Params:
 *   - `containerID`: The id of the container to return logs for
 *
 * Returns an SSE stream containing the logs of the given container
 */

router.get('/logs/:containerID', function (req, res, next) {

  var docker      = req.app.get('docker'),
      containerID = req.param('containerID'),
      stream      = new sseStreamer(req, res),
      container   = docker.getContainer(containerID);

  container.logs({ follow: true, stdout: true, stderr: true, tail: 100 }, function (err, data) {

    if (err)
      return next(err);

    data.on('data', function (containerStream) {

      stream.send({ data: JSON.stringify(ansi_up.ansi_to_html(containerStream.toString())), event: 'log' });

    });

  });

});

module.exports = router;

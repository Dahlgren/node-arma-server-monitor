var binary = require('binary');

var trimBuffer = function (buffer, encoding) {
  var result = buffer.toString(encoding);
  var strlen = result.indexOf("\0");
  if (strlen == -1) {
    return result;
  } else {
    return result.slice(0, strlen);
  }
};

var parse = function (buffer) {
  // Check for server without running mission
  var vars = binary.parse(buffer)
    .word16lu('pid')
    .word16lu('objc0')
    .word16lu('objc1')
    .word16lu('objc2')
    .vars;

  if (vars.pid == 0) {
    return vars;
  }

  var vars = binary.parse(buffer)

    // Stats
    .word16lu('pid')
    .word16lu('objc0')
    .word16lu('objc1')
    .word16lu('objc2')
    .word16lu('players') // number of alive players
    .word16lu('ail') // number of alive server local AI units
    .word16lu('air') // number of alive server remote AI units

    // Performance floats
    .word16lu('fps') // simulation cycles per second average
    .word16lu('fps_min') // simulation cycles per second minimal
    .word16lu('cps') // condition evaluations per second
    .word32lu('mem') // amount of allocated physical memory (MB)
    .word32lu('nti') // network traffic in (kB/s)
    .word32lu('nto') // network traffic out (kB/s)
    .word32lu('dir') // disc read (kB/s)

    // Server tick
    .word32lu('tick')

    // Parse char arrays
    .buffer('mission', 32) // name of running mission
    .buffer('profile', 32) // name of running instance

    // Parsed data
    .vars;

  // Convert floats
  vars.fps = parseFloat(vars.fps) / 1000;
  vars.fps_min = parseFloat(vars.fps_min) / 1000;
  vars.cps = parseFloat(vars.cps) / 1000;
  vars.mem = parseFloat(vars.mem) / 1000;
  vars.nti = parseFloat(vars.nti) / 1000;
  vars.nto = parseFloat(vars.nto) / 1000;
  vars.dir = parseFloat(vars.dir) / 1000;

  // Char buffers to string with c style null termination
  vars.mission = trimBuffer(vars.mission, 'ascii');
  vars.profile = trimBuffer(vars.profile.toString(), 'ascii');

  return vars;
};

module.exports = parse;

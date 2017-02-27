// This worker is meant to be invoked as a cronjob once in a while.
//
// The responsibilities of the worker include:
// - updating scene points
// - updating text fields for search
//
// Each responsibility is implemented by a Job.
// - Job is a module directly under worker/
// - Job has job.run(callback), where callback is function (err)
//
// Notes for implementing a job:
// - require db where you need it. No need to pass it around.
// - after success, do console.log('<jobname>: <human readable results>')

var db = require('../server/services/db');
var pointsJob = require('./points');
var async = require('async');

db.init(function (dbErr) {
  if (dbErr) {
    console.error('Failed to connect to MongoDB.');
    console.error(dbErr);
    return;
  }

  var jobs = [
    pointsJob,
  ];

  async.eachSeries(jobs, function iteratee(job, cb) {
    job.run(cb);
  }, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('Work done successfully L337 H4XoR.');
    }
    // In any case, close the db.
    db.close();
  });
});

/* eslint-disable global-require */
// This worker is meant to be invoked as a cronjob once in a while.
//
// The responsibilities of the worker include but are not limited to:
// - updating scene points
// - updating text fields for search
//
// Each responsibility is implemented by a Job.
// - Job is a module directly under worker/
// - Job has entry at worker/jobname/index.js
// - The entry has exports.run(callback), where callback is function (err)
//
// Notes for implementing a job:
// - add require for the new job below into array 'jobs'
// - require db where you need it. No need to pass it around.
// - after success, do console.log('<jobname>: <human readable results>')

const db = require('tresdb-db');

const jobs = [
  require('./search'),
  require('./points'),
  require('./locpoints'),
  require('./layers'),
  require('./cleartemp'),
  require('./places'),
];

const async = require('async');

db.init((dbErr) => {
  if (dbErr) {
    console.error('Failed to connect to MongoDB.');
    console.error(dbErr);
    return;
  }

  async.eachSeries(jobs, (job, cb) => {
    job.run(cb);
  }, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Work done successfully L337 H4XoR.');
    }
    // In any case, close the db.
    db.close();
  });
});

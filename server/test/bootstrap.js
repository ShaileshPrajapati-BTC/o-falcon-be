var Sails = require('sails');
var sails;
const config = require('../config/env/test');
before(function (done) {

    // Increase the Mocha timeout so that Sails has enough time to lift.
    this.timeout(50000);

    Sails.lift(config, function (err, server) {
        if (err) return done(err);
        // here you can load fixtures, etc.
        // here you can clear fixtures, etc.
        else done(err, sails);
    });
});
describe('hooks', async () => {

    before(async () => {
    });

    after(function () {
        // runs after all tests in this block
    });

    beforeEach(function () {
        // runs before each test in this block
    });

    afterEach(function () {
        // runs after each test in this block
    });

    // test cases
});
after(function (done) {

    Sails.lower(done);
});
console.log("+-----------------------+");
console.log("| GitHub Batch (remove) |");
console.log("+-----------------------+");


var program = require('commander');
program
  .version('0.0.1')
  .usage('[options]')
  .option('-o, --organization <value>', 'The GitHub organization')
  .option('-p, --prefix <value>', 'The team/repository prefix (e.g. 1314i-LI31D_LI51D)')
  .option('-a, --authToken <value>', 'A authorization token to use GitHub API')
  .parse(process.argv);

if(!program.organization || !program.prefix || !program.authToken) 
{
    program.help();
    return process.exit(-1);
}


var config = {
    org: program.organization,
    authToken: program.authToken,
    prefix: program.prefix,
}
run(config);


function run(config) {
    var async = require("async");
    var Enumerable = require("linq");
    var request = require("request").defaults({ headers: { 
        "Authorization": "token " + config.authToken,
        "User-Agent": "GitHubBatch" 
    }});

    var links = {
        forOrgRepositories: function(org)         { return "/orgs/" + org + "/repos"; },
        forOrgTeams:        function(org)         { return "/orgs/" + org + "/teams"; },
        forTeam:            function(teamId)      { return "/teams/" + teamId; },
        forTeamMember:      function(team, user)  { return "/teams/" + team + "/members/" + user; },
        forRepository:      function(owner, repo) { return "/repos/" + owner + "/" + repo; },
    }

    console.log("Running with the following configuration");
    console.log();
    console.log(config);

    async.series(
        [
            getTeams, 
            checkIfIsToContinue,
            removeRepositories, 
            removeTeams
        ], 
        function(error, result) {
            if(error) return console.error("ERROR: " + error);
            console.log("... Done");
            process.exit();
        }
    );

    function getTeams(cb) {
        console.log("Retrieving teams for organization " + config.org);
        req("GET", links.forOrgTeams(config.org), null, function(error, teams) {
            if(error) return cb(error);
            
            config.teams = Enumerable.From(teams).Where(function(t) { return t.slug.indexOf(config.prefix) == 0 }).ToArray();
            console.log(config.teams);

            return cb();
        });
    }
    
    function checkIfIsToContinue(cb) {

        console.log("You will REMOVE the following repositories/teams:");
        Enumerable.From(config.teams).Select("t => '  -> ' + t.slug").ForEach(console.log);

        var read = require("read");
        read({prompt: "Sure to remove those repositories? (yes|no)", default: "no" }, function(error, yesno) {
            if(error || yesno == "no") {
                return cb("Execution aborted");
            }
            if(yesno == "yes" || yesno == "y") {
                return cb();
            }
            return cb("Execution aborted. Invalid option.");
        });
    }

    function removeRepositories(cb) {
        
        async.each(
            Enumerable.From(config.teams).Select("t => t.slug").ToArray(),
            function(slug, cb) {
                req("DELETE", links.forRepository(config.org, slug), null, cb);
            },
            cb
        );
    }


    function removeTeams(cb) {
        async.each(
            Enumerable.From(config.teams).Select("t => t.id").ToArray(),
            function(teamId, cb) {
                req("DELETE", links.forTeam(teamId), null, cb);
            },
            cb
        );
    }


    function req(method, path, data, cb) {
        var opts = { method: method, url: 'https://api.github.com' + path };
        if(data) opts.body = JSON.stringify(data);

        console.log("START: " + opts.method + " " + opts.url);

        request(opts, function (error, response, body) {
                if (!error && (response.statusCode >= 200 && response.statusCode < 300)) {
                    console.log("SUCCESS: " + opts.method + " " + opts.url);
                    var data = {};
                    console.log("body: " + body);
                    if(body) data = JSON.parse(body);
                    console.log(data);
                    console.error("-----------------------------------");
                    return cb(null, data);
                }

                console.error("ERROR: statusCode = " + response.statusCode);
                console.error(body);
                console.error("-----------------------------------");
                return cb("http request error");
            }
        );    
    }

}

console.log("+-----------------------+");
console.log("| GitHub Batch          |");
console.log("+-----------------------+");


var program = require('commander');
program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('-o, --organization <value>', 'The GitHub organization')
  .option('-p, --prefix <value>', 'The team/repository prefix (e.g. 1314i-LI31D_LI51D)')
  .option('-a, --authToken <value>', 'A authorization token to use GitHub API')
  .parse(process.argv);

if(!program.organization || !program.prefix || !program.authToken || program.args.length != 1) 
{
    program.help();
    return process.exit(-1);
}


require("./studentsloader")(program.args[0], function(err, students) {
    if(err) return console.error(err);

    var config = {
        org: program.organization,
        authToken: program.authToken,
        prefix: program.prefix,
        students: [
            //{ group: "G00", user: "cguedes" },
            //{ group: "G01", user: "cguedes" },
            //{ group: "G01", user: "lfalcao-isel" },
            //{ group: "G02", user: "cguedes" },
        ]
    }
    config.students = config.students.concat(students);
    run(config);

});


function run(config) {
    var async = require("async");
    var Enumerable = require("linq");
    var request = require("request").defaults({ headers: { "Authorization": "token " + config.authToken }});

    var links = {
        forOrgRepositories: function(org)        { return "/orgs/" + org + "/repos"; },
        forOrgTeams:        function(org)        { return "/orgs/" + org + "/teams"; },
        forTeamMember:      function(team, user) { return "/teams/" + team + "/members/" + user; },
    }

    console.log("Running with the following configuration");
    console.log();
    console.log(config);

    var teams = Enumerable.From(config.students)
                          .GroupBy(function(s) { return s.group; })
                          .Select(convertToTeam)
                          .ForEach(updateTeamInGitHub);

    function convertToTeam(teamRawData) {
        return {
            org: config.org,
            num: teamRawData.Key(),
            name: config.prefix + "-" + teamRawData.Key(),
            permission: "push",
            students: teamRawData.Select("s => { user: s.user }").ToArray()
        }
    }
    
    function updateTeamInGitHub(team) {
        console.log("Updating team " + team.name + " in GitHub...");
        console.log(JSON.stringify(team));
        
        async.series(
            [
                createRepository, 
                createTeam, 
                addTeamMembers
            ], 
            function(error, result) {
                if(error) return console.error("ERROR: " + error);
                return console.log("... Done")
            }
        );

        function createRepository(cb) {
            req("POST",
                links.forOrgRepositories(team.org), 
                {   
                    name: team.name, 
                    description: "Repositório do grupo " + team.num,
                    private: true,
                    auto_init: true,
                    gitignore_template: "Java"
                }, 
                cb                
            );
        }


        function createTeam(cb) {
            req("POST",
                links.forOrgTeams(team.org), 
                { 
                    name: team.name, 
                    permission: team.permission, 
                    repo_names: [ team.org + "/" + team.name ] 
                },
                function(err, ghteam) {
                    if(err) return cb(err);
                    team.id = ghteam.id
                    return cb(null, team);
                });
        }

        function addTeamMembers(cb) {
            async.each(
                team.students, 
                function(student, cb) {
                    console.log("Adding team member " + JSON.stringify(student));
                    req("PUT", links.forTeamMember(team.id, student.user), null, cb);
                }, 
                cb
            );
        }
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

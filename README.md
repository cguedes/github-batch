# GitHub batch

This tool batches the creation of github repositories and teams in the context of an organization.

## Usage

```
  Usage: app.js [options] <file ...>

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -o, --organization <value>  The GitHub organization
    -p, --prefix <value>        The team/repository prefix (e.g. 1314i-LI31D_LI51D)
    -a, --authToken <value>     A authorization token to use GitHub API
``` 

## Sample 

If you execute the command 

```
node app.js -o isel-leic-cg -p 1314i-LI31D_LI51D -a <GITHUB_TOKEN> groups.txt
```

you will create four repositories, and teams, named `1314i-LI31D_LI51D_GXX` (where XX is 00, 01, 02 and 03) in the `isel-leic-cg` organization. The groups data is read from the file `groups.txt`.

**groups.txt**
```
G00 cguedes
G01 cguedes bart
G02 lisa
G03 hommer marge maggie
# G04 foo bar             this line will be ignored
```


## GitHub (personal access) token

You can generate a GitHub (personal access) token [here](https://github.com/settings/applications).


## (current) limitations

> The batch assumes that the repositories/teams does not exists in the organization, and that the github users provided also exists in the system.

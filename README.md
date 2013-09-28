# GitHub batch

This tool batches the creation and removal of github repositories, and teams, in the context of an organization.

## Usage (creation)

```
  Usage: app.js [options] <file ...>

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -o, --organization <value>  The GitHub organization
    -p, --prefix <value>        The team/repository prefix (e.g. 1314i-LI31D_LI51D)
    -a, --authToken <value>     A authorization token to use GitHub API
``` 

## Usage (removal)

```
  Usage: remove-repositories.js [options] 

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -o, --organization <value>  The GitHub organization
    -p, --prefix <value>        The team/repository prefix (e.g. 1314i-LI31D_LI51D)
    -a, --authToken <value>     A authorization token to use GitHub API
 `` 


## Samples

### Creation 

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

### Removal

If you execute the command

```
node remove-repositories.js -o isel-leic-cg -p 1314i -a <GITHUB_TOKEN>
```

you will remove all repositories, and teams, that begins with `1314i` in the `isel-leic-cg` organization. 

**NOTES** 

* You will be presented with a list of repositories that will be removed and a confirm question (that defaults to cancel the operation)
* Your token needs to have the scope `delete_repo` to execute this operation. By default the tokens does not have this scope. To add the scope execute`the following commands:

	```
	curl -u <YOUR_USERNAME> https://api.github.com/authorizations
	```

	to retrieve a list of authorizations. Search for the `id` of the authorization related to you token (should the last). 
	After that update (PATCH) the autorization with `delete_repo` scope.

	```
	curl -X PATCH -u <YOUR_USERNAME> --header "Content-Type:application/json" https://api.github.com/authorizations/<AUTHORIZATION_ID> -d @req.txt
	```

	where the file `req.txt` contains the following content:

	```
	{"add_scopes": ["delete_repo"]} 
	```


## GitHub (personal access) token

You can generate a GitHub (personal access) token [here](https://github.com/settings/applications).


## (current) limitations

> The batch assumes that the repositories/teams does not exists in the organization, and that the github users provided also exists in the system.

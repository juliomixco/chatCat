# chatCatNodejs
## config
create `app\config\development.json` file containing the following structure.
```
{
  "dbURI": "<Mongo db URI>",
  "host": "http://localhost:3000",
  "sessionSecret": "<secret-word>",
  "fb": {
    "clientID": "",
    "clientSecret": "",
    "callbackURL": "//localhost:3000/auth/facebook/callback",
    "profileFields": [ "id", "displayName", "photos" ]

  },
  "tw": {
    "consumerKey": "",
    "consumerSecret": "",
    "callbackURL": "//localhost:3000/auth/twitter/callback",
    "profileFields": [ "id", "displayName", "photos" ]
  },
  "redis": {
    "host": "127.0.0.1",
    "port": 6379,
    "password": ""
  }
}
```
you will need to get developer keys for [Facebook](https://developers.facebook.com/ "Facebook Dev portal") and [Twitter](https://dev.twitter.com/ "twitter Dev portal")
## Run this project
```
npm start
```


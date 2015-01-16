if (Meteor.isClient) {
 //  Meteor.startup(function(){
	// 	// initializes all typeahead instances
	// 	Meteor.typeahead.inject();
	// });
  // counter starts at 0
  Session.setDefault("musicStuff", "");
  Session.setDefault("tvStuff", "");
  Session.setDefault("movieStuff", "");

  Template.music.helpers({
    stuff: function () {
      return Session.get("musicStuff"); 
    }
  });

  Template.music.events({
    'click button, keyup #artist': function () {
     console.log(artist.value);
      Meteor.call("searchArtist", artist.value, function(error, results) {
        console.log(results.results.artistmatches.artist);        
        //console.log(results.artists); //results.data should be a JSON object
        
        //artist class
        function Artist(name,image,id) {
          this.name = name;
          this.image = image;
          this.id = id;
        }
        
        artists = [];
        
        results.results.artistmatches.artist.forEach(function (item) {
        //results.artists.forEach(function (item) {
          if(item.mbid)
            artists.push(new Artist(item.name,item.image[3]["#text"],item.mbid))
        });
        
        
        Session.set("musicStuff", artists);
    });
    },
    'click div': function(){
      console.log(this.name);
       Meteor.call("searchAlbums", this.name, function(error, results) {
         console.log(results);
         Session.set("albums",results);
       });
    }
  });

  Template.albums.created = function() {
    Session.setDefault("albums", "");
  }
  
  Template.albums.helpers({
    albums: function() {
      return Session.get('albums');
    }
  });


Template.movie.helpers({
    stuff: function () {
      return Session.get("movieStuff");
    }
  });

  Template.movie.events({
    'click button': function () {
     console.log(movie.value);
      Meteor.call("searchMovie", movie.value, function(error, results) {
        console.log(results); //results.data should be a JSON object
        
        //artist class
        function Movie(name,image) {
          this.name = name;
          this.image = "http://image.tmdb.org/t/p/w92" + image;
        }
        
        movies = [];

        results.results.forEach(function (item) {
          movies.push(new Movie(item.original_title,item.poster_path))
        });
        
        Session.set("movieStuff", movies);
    });
    }
  });

  Template.tv2.helpers({
    stuff: function () {
      return Session.get("tv2Stuff");
    }
  });

  Template.tv2.events({
    'click button, keyup #tv2': function () {
     console.log(tv2.value);
      Meteor.call("searchTV2", tv2.value, function(error, results) {
        console.log(results); //results.data should be a JSON object
        
        //artist class
        function Show(name,image,id) {
          this.id = id;
          this.name = name;
          this.image = (image === "null") ? "":"http://image.tmdb.org/t/p/w92" + image;
        }
        
        shows = [];
        var count = 0;
        len = (results.results.length < 3) ? results.results.length: 3;
        for (var i = 0; i < len; i++) {
          item = results.results[i];
          if(item.poster_path !== null) {
            
            shows.push(new Show(item.name,item.poster_path,item.id));
          }
        }
        // results.results.forEach(function (item) {
        //   if(count > 2)
        //     return false;
        //   if(item.poster_path !== null) {
        //     shows.push(new Show(item.name,item.poster_path,item.id,item.seasons))
        //     count++;
        //   }
        // });
        
        Session.set("tv2Stuff", shows);
    });
    },
    'click div': function () {
      console.log(this.id);
      
      Meteor.call("searchSeason2", this.id, function(error, results) {
        console.log(results);
        Session.set('seasons',results);
        
      });
    }
  });
  
  Template.seasons.created = function() {
    Session.setDefault("seasons", "");
  }
  
  Template.seasons.helpers({
    seasons: function() {
      return Session.get('seasons');
    }
  });
}

if (Meteor.isServer) {
  //   Meteor.startup(function(){
  //   Future = Npm.require('fibers/future');
  // });
    Meteor.methods({
        searchArtist: function (artist) {
            this.unblock();
            //use lastfm for artist lookup because their search is good
            result = Meteor.http.call("GET", "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=" + artist.replace(" ","+") + "&api_key=" + process.env.LASTFM_KEY + "&limit=3&format=json"); //"https://itunes.apple.com/search?term=" + artist.replace(" ","+") + "&entity=musicArtist&limit=3");
            //result = Meteor.http.call("GET", "http://musicbrainz.org/ws/2/artist?query=" + artist.replace(" ","+") + "&fmt=json&limit=3");
            return JSON.parse(result.content);
        },
        searchAlbums: function (artist) {
            this.unblock();
            // getting album data from last.fm is no good because the only method is gettopalbums which is wonky and doesn't always return data

            // result = Meteor.http.call("GET", "http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=" + artist.replace(" ","+") + "&api_key=" + process.env.LASTFM_KEY + "&format=json"); //"https://itunes.apple.com/search?term=" + artist.replace(" ","+") + "&entity=musicArtist&limit=3");
            
            // json_albums = JSON.parse(result.content).topalbums.album;
            
            // album_details = [];
            
            // json_albums.forEach(function(item){
            //   result = Meteor.http.call("GET", "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=" + artist.replace(" ","+") + "&album=" + item.name.replace(" ","+") + "&api_key=" + process.env.LASTFM_KEY + "&format=json");
            //   album = JSON.parse(result.content).album;
            //   releasedate = new Date(album.releasedate);
            //   if(releasedate.getFullYear() === 2014)
            //     album_details.push(album);
            // });
            
            //getting data from musicbrainz is no good because the coverart is not always through coverartarchive(sometimes it's amazon) and it's a pain to work around
            //plus sometimes the mbid is mismatched between lastfm and musicbrainz(ex PHOX)
            // result = Meteor.http.call("GET", "https://musicbrainz.org/ws/2/release-group?artist=" + mbid + "&type=album&fmt=json");

            // albums = JSON.parse(result.content)["release-groups"];

            // albums.forEach(function (item) {
            //   // body...http://coverartarchive.org/release/{{id}}/front-250
            //   url = "http://coverartarchive.org/release/" + item.id + "/front-250";
            //   console.dir(url);
            //   result = Meteor.http.call("GET", url);
            //   item.image = result.content;
            // });

            //itunes release dates are no good but their collection and images are good.
            result = Meteor.http.call("GET", "https://itunes.apple.com/search?term=" + artist.replace(" ","+") + "&entity=album");

            albums = JSON.parse(result.content).results;

            //really dirty but since the release dates are sometimes wrong in the api but (mostly) correct on the site 
            //look up the album and get the real date :(
          //   var futures = _.map(albums, function(item) {
              
          //     var url = "https://itunes.apple.com/album/id" + item.collectionId;
          //     var future = new Future();
          //     var onComplete = future.resolver();
          //     if (item.artistId === artistId) {
          //       /// Make async http call
          //       Meteor.http.get(url, function(error, result) {
          //         if(!error){
          //           console.dir(url);
          //           result = Meteor.http.call("GET", url);
          //           $ = cheerio.load(result.content);
          //           var releasedate = $('#left-stack > div.lockup.product.album.music > ul > li.release-date').text();
          //           item.releaseDate = releasedate;
          //         }
          //         onComplete(error, releasedate);
          //       });
          //     }
          //     else {
          //       onComplete('','');
          //     }
          //     return future;

          // });
          // Future.wait(futures);

          //assume the first artist id is the person you want lol
          artistId = albums[0].artistId;

          //filter based on that artist and sort by album name for sanity
          filteredAlbums = albums.filter(function(item){ 
                                            return item.artistId === artistId && item.trackCount > 4; //no EPs!
                                          }).sort(function(a, b){
                                                      if(a.collectionName < b.collectionName) return -1;
                                                      if(a.collectionName > b.collectionName) return 1;
                                                      return 0;
                                                  });
            
          return filteredAlbums;
        },
        searchTVShow: function (show) {
            this.unblock();
            result = Meteor.http.call("GET", "http://thetvdb.com/api/GetSeries.php?seriesname=" + show.replace(" ","+"));
            //console.dir(result.content);

            json_result = "";
            
            xml2js.parseString(result.content, function (err, results) {
                json_result = JSON.stringify(results);
            });

            return JSON.parse(json_result);
        },
        searchMovie: function (movie) {
            this.unblock();
            result = Meteor.http.call("GET", "http://api.themoviedb.org/3/search/movie?year=2014&api_key=" + process.env.MOVIEDB_KEY + "&query=" + movie.replace(" ","+"));
            //console.dir(result.content);

            return JSON.parse(result.content);
        },
        searchTV2: function (show) {
            this.unblock();
            result = Meteor.http.call("GET", "http://api.themoviedb.org/3/search/tv?api_key=" + process.env.MOVIEDB_KEY + "&query=" + show.replace(" ","+"));
            //console.dir(result.content);

            return JSON.parse(result.content);
        },
        searchSeason2: function (show) {
            this.unblock();
            
            result = Meteor.http.call("GET", "http://api.themoviedb.org/3/tv/" + show + "?api_key=" + process.env.MOVIEDB_KEY);
            //console.dir(result.content);

            return JSON.parse(result.content).seasons.filter(function(item){ 
                                            return item.season_number > 0; //exclude season 0 cause that's usually extra features or whatever
                                          });
        }
    });
}

//------------

Nba = new Meteor.Collection("nba");
Movies = new Meteor.Collection("movies");

if (Meteor.isServer){
    if (Nba.find().count() === 0) {
      Nba.insert({name:'Boston Celtics'});
      Nba.insert({name:'Houston Rockets'});
      Nba.insert({name:'Los Angeles Lakers'});
      Nba.insert({name:'Sacramento Kings'});
      // fill Nba collection
    }
}

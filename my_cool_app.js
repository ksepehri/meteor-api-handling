if (Meteor.isClient) {
  Meteor.startup(function(){
		// initializes all typeahead instances
		Meteor.typeahead.inject();
	});
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
    'click button': function () {
     console.log(artist.value);
      Meteor.call("searchArtist", artist.value, function(error, results) {
        //console.log(results.results.artistmatches.artist);        
   //results.results.artistmatches.artist.forEach(function (item) {
        console.log(results.artists); //results.data should be a JSON object
        
        //artist class
        function Artist(name,image,id) {
          this.name = name;
          this.image = image;
          this.id = id;
        }
        
        artists = [];
        
        results.artists.forEach(function (item) {
          artists.push(new Artist(item.name,null,item.id))
        });
        
        
        Session.set("musicStuff", artists);
    });
    },
    'click div': function(){
      console.log(this.name);
       Meteor.call("searchAlbums", this.name, function(error, results) {
         console.log(results);
       });
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
        console.log(results.seasons);
        Session.set('seasons',results.seasons);
        
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
    Meteor.methods({
        searchArtist: function (artist) {
            this.unblock();
            //result = Meteor.http.call("GET", "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=" + artist.replace(" ","+") + "&api_key=" + process.env.LASTFM_KEY + "&limit=3&format=json"); //"https://itunes.apple.com/search?term=" + artist.replace(" ","+") + "&entity=musicArtist&limit=3");
            result = Meteor.http.call("GET", "http://musicbrainz.org/ws/2/artist?query=" + artist.replace(" ","+") + "&fmt=json&limit=3");
            return JSON.parse(result.content);
        },
        searchAlbums: function (artist) {
            this.unblock();
            result = Meteor.http.call("GET", "http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=" + artist.replace(" ","+") + "&api_key=" + process.env.LASTFM_KEY + "&format=json"); //"https://itunes.apple.com/search?term=" + artist.replace(" ","+") + "&entity=musicArtist&limit=3");
            
            json_albums = JSON.parse(result.content).topalbums.album;
            
            album_details = [];
            
            json_albums.forEach(function(item){
              result = Meteor.http.call("GET", "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=" + artist.replace(" ","+") + "&album=" + item.name.replace(" ","+") + "&api_key=" + process.env.LASTFM_KEY + "&format=json");
              album = JSON.parse(result.content).album;
              releasedate = new Date(album.releasedate);
              if(releasedate.getFullYear() === 2014)
                album_details.push(album);
            });
            
            return album_details;
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

            return JSON.parse(result.content);
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

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
        console.log(results.results.artistmatches.artist); //results.data should be a JSON object
        
        //artist class
        function Artist(name,image) {
          this.name = name;
          this.image = image;
        }
        
        artists = [];
        
        results.results.artistmatches.artist.forEach(function (item) {
          artists.push(new Artist(item.name,item.image[3]["#text"]))
        });
        
        
        Session.set("musicStuff", artists);
    });
    }
  });


Template.tv.helpers({
    stuff: function () {
      return Session.get("tvStuff");
    }
  });
  
  var getShows = function(value){
    Meteor.call("searchTVShow", value, function(error, results) {
        console.log(results); //results.data should be a JSON object
        
        //artist class
        function Show(name,image) {
          this.name = name;
          this.image = (image === "") ? "":"http://thetvdb.com/banners/" + image;
        }
        
        shows = [];
        
        if (typeof results.Data.Series !== 'undefined'){
          results.Data.Series.forEach(function (item) {
            shows.push(new Show(item.SeriesName[0],(typeof item.banner !== 'undefined') ? item.banner[0]: ""))
          });
          
          Session.set("tvStuff", shows);
        }
    });
  }

  Template.tv.events({
    'click button': function () {
     console.log(show.value);
     getShows(show.value);
    },
    'keyup .show': function () {
      if(show.value.length > 4)
      console.log(show.value);
      getShows(show.value);
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
        function Show(name,image,id,seasons) {
          this.id = id;
          this.name = name;
          this.image = (image === "null") ? "":"http://image.tmdb.org/t/p/w92" + image;
          this.seasons = seasons;
        }
        
        shows = [];

        results.results.forEach(function (item) {
          if(item.poster_path !== null)
            shows.push(new Show(item.name,item.poster_path,item.id,item.seasons))
        });
        
        Session.set("tv2Stuff", shows);
    });
    },
    'click div': function () {
      console.log(this.id);
    }
  });
  
  
  var nba = function(){
		return Nba.find().fetch().map(function(it){ return it.name; });
	};

	// simple example
	Template.basic.helpers({
		nba: function(){
      Meteor.call("searchTV2", "sherlock", function(error, results) {
        console.log(results.results); //results.data should be a JSON object
        
        //artist class
        function Movie(name,image) {
          this.name = name;
          this.image = "http://image.tmdb.org/t/p/w92" + image;
        }
        
        //movies = [];
        if (Movies.find().count() === 0) {
          results.results.forEach(function (item) {
            Movies.insert(item);
          });
        }
        return Movies.find().fetch();
    });
		}
	});
}

if (Meteor.isServer) {
    Meteor.methods({
        searchArtist: function (artist) {
            this.unblock();
            result = Meteor.http.call("GET", "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=" + artist.replace(" ","+") + "&api_key=" + process.env.LASTFM_KEY + "&limit=3&format=json"); //"https://itunes.apple.com/search?term=" + artist.replace(" ","+") + "&entity=musicArtist&limit=3");
            
            return JSON.parse(result.content);
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

if (Meteor.isClient) {
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
      return Session.get("musicStuff");
    }
  });

  Template.tv.events({
    'click button': function () {
     console.log(artist.value);
      Meteor.call("searchTVShow", show.value, function(error, results) {
        console.log(results); //results.data should be a JSON object
        
        //artist class
        function Show(name,image) {
          this.name = name;
          this.image = image;
        }
        
        
        Session.set("tvStuff", results);
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
            //console.dir(result);
            
            xml2js.parseString(result, function (err, results) {
                console.dir(results);
            });
        }
    });
}
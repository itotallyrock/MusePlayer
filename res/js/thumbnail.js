var thumbnail = {
    getByName: function(options, callback) {
        if (options.name !== undefined) {
            console.log("GET VIDEO FROM " + options.name);
            var KEY = "AIzaSyAJUi1eIhJB-f-nagbVEbDxEyovoqw3yjA";
            var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=" + encodeURI(options.name) + "&key=" + KEY;

            if (options.channelid !== undefined) {
                url += "&channelId=" + options.channelid;
            }

            $.getJSON(url).success(function(data, err) {
                console.log(data.items[0].snippet.thumbnails.high.url);
                callback(data.items[0].snippet.thumbnails.high.url, err);
            }).fail(function(err) {
                console.log("Error Retrieving YouTube Data.");
                callback("res/img/noimage240x180.png", err);
            });
        } else {
            throw new Exception("Undefined Name");
        }
    }
}
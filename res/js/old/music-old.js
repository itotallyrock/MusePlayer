var activeSong = new Audio(""),
    timer,
    queue = [],
    formatTime;

var settings = (localStorage.getItem("settings") == undefined ? {
    songIndex: 0,
    volume: 0.5
} : JSON.parse(localStorage.getItem("settings")));

activeSong.onended = function() {
    activeSong.src = "res/music/" + encodeURI(queue[0]);
    settings.songIndex++;

    $.getJSON("/musiclist.json?limit=1&index=" + settings.songIndex).success(function(data, err) {
        queue.push(data[0]);
    });
};

activeSong.oncanplay = function() {
    $('.currentSong .details .name').text(queue[0].replace(".mp3", "").replace("_", " "));


    thumbnail.getByName({
        name: queue[0].replace(".mp3", "").trim(),
        channelid: "UCJ6td3C9QlPO9O_J5dF4ZzA"
    }, function(data, err) { //Monstercat name
        if (data.items[0].snippet.thumbnails.high.url !== undefined) {
            $(".currentSong .image .thumbnail").css("background-image", "url('" + data.items[0].snippet.thumbnails.high.url + "')");
            notification.create(settings.songIndex, {
                title: queue[0].replace(".mp3", "").replace("_", " "),
                body: queue[0].replace(".mp3", "").replace("_", " ") + "\nhas started playing.",
                icon: data.items[0].snippet.thumbnails.high.url,
                close: 3000
            });
        } else {
            $(".currentSong .image .thumbnail").attr("src", "http://placehold.it/120x90");
        }

        if (queue[0]) {
            activeSong.play();
        }

        queue.splice(0, 1);

        $('.nextSong .details .name').text("QUEUE");
        $('.nextSong .details .name').text(queue[0].replace(".mp3", "").replace("_", " "));

        thumbnail.getByName({
            name: queue[0].replace(".mp3", "").trim(),
            channelid: "UCJ6td3C9QlPO9O_J5dF4ZzA"
        }, function(data, err) { //Monstercat name
            if (data.items[0].snippet.thumbnails.high.url !== undefined) {
                $(".nextSong .image .thumbnail").css("background-image", "url('" + data.items[0].snippet.thumbnails.high.url + "')");
            } else {
                $(".nextSong .image .thumbnail").attr("src", "http://placehold.it/120x90");
            }
        });
    });
};

activeSong.togglepause = function() {
    (activeSong.paused ? activeSong.play() : activeSong.pause());
    $(".pause i").attr("class", (activeSong.paused ? 'fa fa-pause' : 'fa fa-play'));
};

$(document).ready(function() {
    $.getJSON("/musiclist.json").success(function(data) {
        if (settings.songIndex >= data.length) {
            settings.songIndex = parseInt(Math.random() * data.length);
        }
        $.getJSON("/musiclist.json?limit=1&index=" + settings.songIndex).success(function(data) {
            queue.push(data[0]);
            activeSong.onended();
        });
    });

    settings.songIndex--;
    activeSong.preload = false;
    activeSong.volume = settings.volume;
    $('.volume').val(settings.volume);
});

window.onbeforeunload = function() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

window.onerror = function(errorMsg, url, line) {
    console.error("Handle: " + errorMsg + " @" + url + ":" + line);
};

timer = setInterval(function() {
    var startTime = new Date().getTime()
    if (!activeSong.paused) {
        $('.remainingTime').text(utils.formatTime(activeSong.duration - activeSong.currentTime));
        $('.progressBar .progress').css("width", (activeSong.currentTime / activeSong.duration) * 100 + "%");
    }
}, 100);

$(document).on("keypress", function(event) {
    if (event.charCode == 32) {
        activeSong.togglepause();
    }
});
$(".pause").on("click", function() {
    activeSong.togglepause();
});
$(".skip").on("click", function() {
    activeSong.onended();
});
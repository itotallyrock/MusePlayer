var settings = {
    volume: 0.2,
    latestSong: 7,
};
var queue = [],
    songIndex = 0,
    loop,
    defaultList = [];

$(document).ready(function() {
    getSettings();

    $.getJSON("/musiclist.json").success(function(data, err) {
        console.log("defaultList = " + data);
        console.log(data);
        defaultList = data;

        getNextSong(function() {
            queue[songIndex].play();
        });

        loop = setInterval(function() {
            if (queue[songIndex - 1].playing()) {
                $('.progressBar .progress').css("width", (queue[songIndex - 1].seek() / queue[songIndex - 1]._duration) * 100 + "%");
            }
        }, 100);
    });
});

var getSettings = function() {
    settings = JSON.parse(localStorage.getItem('settings'));
}

var createSong = function(src) {
    return new Howl({
        src: ["res/music/" + encodeURI(src)],
        //src: ["res/music/%5BDrumstep%5D%20-%20Varien%20-%20Valkyrie%20(feat.%20Laura%20Brehm)%20%5BMonstercat%20Release%5D.mp3"],
        autoplay: false,
        preload: true,
        html5: true,
        volume: settings.volume,
        onload: function(event) {
            console.log("onload" + this);
            songIndex++;

            thumbnail.getByName({
                name: defaultList[songIndex + settings.latestSong - 1].replace(".mp3", "").trim(),
                channelid: "UCJ6td3C9QlPO9O_J5dF4ZzA"
            }, function(data, err) { //Monstercat name
                if (data.items[0].snippet.thumbnails.high.url !== undefined) {
                    $(".currentSong .image .thumbnail").css("background-image", "url('" + data.items[0].snippet.thumbnails.high.url + "')");
                    notification.create(songIndex, {
                        title: defaultList[songIndex + settings.latestSong - 1].replace(".mp3", "").replace("_", " "),
                        body: defaultList[songIndex + settings.latestSong - 1].replace(".mp3", "").replace("_", " ") + "\nhas started playing.",
                        icon: data.items[0].snippet.thumbnails.high.url,
                        close: 3000
                    });
                } else {
                    $(".currentSong .image .thumbnail").attr("src", "http://placehold.it/120x90");
                }

                $('.nextSong .details .name').text(defaultList[songIndex + settings.latestSong].replace(".mp3", "").replace("_", " "));

                thumbnail.getByName({
                    name: defaultList[songIndex + settings.latestSong].replace(".mp3", "").trim(),
                    channelid: "UCJ6td3C9QlPO9O_J5dF4ZzA"
                }, function(data, err) { //Monstercat name
                    if (data.items[0].snippet.thumbnails.high.url !== undefined) {
                        $(".nextSong .image .thumbnail").css("background-image", "url('" + data.items[0].snippet.thumbnails.high.url + "')");
                    } else {
                        $(".nextSong .image .thumbnail").attr("src", "http://placehold.it/120x90");
                    }
                });
            });
        },
        onend: function(event) {
            console.log("onend" + this);
            getNextSong(function() {
                queue[songIndex].play();
            });
        },
        onplay: function(event) {
            $('.pause > i').attr("class", "fa fa-play");
        },
        onpause: function(event) {
            $('.pause > i').attr("class", "fa fa-pause");
        },
        onstop: function(event) {
            console.log("stopped" + this);
        },
    });
};

var getNextSong = function(callback) {
    // $.getJSON("/musiclist.json?limit=1&index="+(settings.latestSong+index)).success(function(data,err){
    //     console.log("queue["+index+"] = "+data[0]);
    //     queue.push(createSong(data[0]));
    //     callback();
    // });
    console.log("defaultList[" + (settings.latestSong + songIndex) + "] = " + defaultList[(settings.latestSong + songIndex)]);
    queue.push(createSong(defaultList[(settings.latestSong + songIndex)]));
    callback();
};

var skipSong = function() {
    queue[songIndex - 1].seek(queue[songIndex - 1]._duration - 0.1);
};

window.onunload = function(event) {
    console.log("unload");
    settings.latestSong += songIndex;
    localStorage.setItem('settings', JSON.stringify(settings));
}

$(".skip").on('click', skipSong);
$(".pause").on('click', function(event) {
    if (queue[songIndex - 1].playing()) {
        queue[songIndex - 1].pause();
    } else {
        var lastPos = queue[songIndex - 1].seek();
        console.log(lastPos);
        var id = queue[songIndex - 1].play();
        console.log("id " + id);
        queue[songIndex - 1].seek(lastPos);
    }
});
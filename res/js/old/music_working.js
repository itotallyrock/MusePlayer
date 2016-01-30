var musicPlayer = {
    AUTHOR: "R0CK",
    NAME: "Muse",
    VERSION: "0.3.8",
    settings: {
        volume: 0.2,
        shuffle: false,
        verbose: 4
    },
    songIndex: 0,
    started: false,
    rawList: [],
    queue: [],
    tick: {
        tickInterval: undefined,
        ticks: 0,
        tickRate: 10, //Ticks Per Second
        tick: function() {
            var tickTime = Date.now();
            musicPlayer.tick.ticks++;

            if (!musicPlayer.player.paused) {
                $(".progressBar .progress").css("width", (musicPlayer.player.currentTime / musicPlayer.player.duration) * 100 + "%");
            }

            musicPlayer.logging.info("Tick #" + musicPlayer.tick.ticks + " (" + (Date.now() - tickTime == 0 ? 0 : Date.now() - tickTime) + ")", {
                verbose: 5
            });
            if (Date.now() - tickTime > (1 / musicPlayer.tick.tickRate) * 1000) {
                //Handle Tick Taking Longer than Tick Rate
                musicPlayer.logging.error("Tick #" + musicPlayer.tick.ticks + " took longer than tickrate (" + musicPlayer.tick.tickRate + ") at " + Date.now() - tickTime + "ms", {
                    verbose: 5
                });
                clearInterval(musicPlayer.tick.tick);
            }
        }
    },
    player: new Audio(),
    logging: {
        prefix: "[Muse]",
        log: function(message, options) {
            if (options.verbose !== undefined) {
                if (musicPlayer.settings.verbose >= options.verbose) {
                    console.log(this.prefix, message);
                }
            } else {
                console.log(this.prefix, message);
            }
        },
        error: function(message, options) {
            if (options.verbose !== undefined) {
                if (musicPlayer.settings.verbose >= options.verbose) {
                    console.error(this.prefix, message);
                }
            } else {
                console.error(this.prefix, message);
            }
        },
        warn: function(message, options) {
            if (options.verbose !== undefined) {
                if (musicPlayer.settings.verbose >= options.verbose) {
                    console.warn(this.prefix, message);
                }
            } else {
                console.warn(this.prefix, message);
            }
        },
        info: function(message, options) {
            if (options.verbose !== undefined) {
                if (musicPlayer.settings.verbose >= options.verbose) {
                    console.info(this.prefix, message);
                }
            } else {
                console.info(this.prefix, message);
            }
        }
    },
    init: function() {
        musicPlayer.logging.prefix = "[" + musicPlayer.NAME + " " + musicPlayer.VERSION + "]"

        musicPlayer.tick.tickInterval = setInterval(function() {
            musicPlayer.tick.tick();
        }, (1 / musicPlayer.tick.tickRate) * 1000);

        musicPlayer.queue.push(musicPlayer.rawList[musicPlayer.songIndex]);
        musicPlayer.player.src = musicPlayer.createURL(musicPlayer.queue[musicPlayer.songIndex]);

        musicPlayer.songIndex++
            musicPlayer.queue.push(musicPlayer.rawList[musicPlayer.songIndex]);

        $(".button.pause").on("click", function(e) {
            musicPlayer.togglepause();
        });
        $('.button.skip').on("click", function(e) {
            musicPlayer.skip();
        });
    },
    createURL: function(url) {
        return "res/music/" + encodeURI(url);
    },
    getSettings: function() {
        if (localStorage.getItem("settings-" + musicPlayer.VERSION) !== undefined && localStorage.getItem("settings-" + musicPlayer.VERSION) !== null) {
            try {
                musicPlayer.settings = JSON.parse(localStorage.getItem("settings-" + musicPlayer.VERSION));
                musicPlayer.logging.info("Retrieved Settings", {
                    verbose: 3
                });
            } catch (error) {
                musicPlayer.logging.error("Invalid Settings Saved, removing old settings", {
                    verbose: 3
                });
                localStorage.removeItem("settings-" + musicPlayer.VERSION);
            }
        }
        musicPlayer.logging.warn("localStorage.getItem(settings-" + musicPlayer.VERSION + ") = " + localStorage.getItem("settings-" + musicPlayer.VERSION), {
            verbose: 1
        });
    },
    saveSettings: function() {
        musicPlayer.logging.info("Saved Settings", {
            verbose: 2
        });
        console.log("localStorage[settings-" + musicPlayer.VERISON + "] = " + JSON.stringify(musicPlayer.settings));
        localStorage.setItem("settings-" + musicPlayer.VERSION, JSON.stringify(musicPlayer.settings));
    },
    onended: function() {
        musicPlayer.logging.info(musicPlayer.rawList[musicPlayer.songIndex] + " has finished.", {
            verbose: 3
        });
        musicPlayer.queue.splice(0, 1);
        musicPlayer.songIndex++;

        musicPlayer.queue.push(musicPlayer.rawList[musicPlayer.songIndex]);
        musicPlayer.player.src = musicPlayer.createURL(musicPlayer.queue[0]);
    },
    oncanplay: function() {
        musicPlayer.logging.info(musicPlayer.rawList[musicPlayer.songIndex] + " can play.", {
            verbose: 3
        });

        $(".currentSong .details .name").text(musicPlayer.queue[0].replace(".mp3", "").replace("_", " ").trim());

        thumbnail.getByName({
            name: musicPlayer.queue[0].replace(".mp3", "").replace("_", " ").trim()
        }, function(data, err) {
            $(".currentSong .image .thumbnail").css("background-image", "url(" + data + ")");
        });

        if (musicPlayer.started) {
            musicPlayer.player.play();
        }
        musicPlayer.songIndex++;

        musicPlayer.drawSongs();
    },
    togglepause: function() {
        if (!musicPlayer.started) {
            musicPlayer.started = true;
        }
        (musicPlayer.player.paused ? musicPlayer.player.play() : musicPlayer.player.pause());
        $(".pause i").attr("class", (musicPlayer.player.paused ? 'fa fa-pause' : 'fa fa-play'));
    },
    toggleshuffle: function() {
        if (!musicPlayer.started) {
            musicPlayer.started = true;
        }

        $(".shuffle").attr("class", (musicPlayer.settings.shuffle ? 'button shuffle active' : 'button shuffle'));
    },
    changevolume: function(volume) {
        musicPlayer.player.volume = volume;
        musicPlayer.settings.volume = volume;
        this.saveSettings();
        $(".volumeControl").val(volume);
    },
    skip: function() {
        musicPlayer.player.pause();
        musicPlayer.player.ended = true;
        musicPlayer.player.onended();
    },
    getMusicList: function() {
        $.getJSON("/musiclist.json").done(function(data) {
            musicPlayer.rawList = (musicPlayer.settings.shuffle ? utils.shuffle(data) : data);
            musicPlayer.init();
        }).fail(function(error) {
            //Handle Error
            musicPlayer.logging.error(["Error Occuring While Fetching Music List", error], {
                verbose: 0
            });
        });
    },
    drawSongs: function() {
        var template = ('<div class="song" song-id="$SONG_ID">' +
            '<div class="image">' +
            '<div class="thumbnail"></div>' +
            '</div>' +
            '<div class="details">' +
            '<div class="addtrack"><i class="fa fa-plus"></i></div>' +
            '<div class="name">$SONG_NAME</div>' +
            '</div>' +
            '</div>');
        $('.songList .song').remove();
        musicPlayer.rawList.forEach(function(o, i) {
            $('.songList').append(template.replace('$SONG_ID', i).replace('$SONG_NAME', o.replace('_', ' ').replace('.mp3', '').replace(/\[Monstercat .*\]/g, '')));
        });

        $('.addtrack').on('click', function(event) {
            var songid = $(this).parent().parent().attr('song-id');
            musicPlayer.moveSong(songid, 0);
            // console.log(event);
            // musicPlayer.rawList.move(songid, 0);

            //musicPlayer.queue.splice(1, 1);
            //musicPlayer.queue.push(musicPlayer.rawList[songid]);
        });
    },
    moveSong: function(songid, position) {
        musicPlayer.rawList.move(songid, position);
        musicPlayer.drawSongs();
    }
};

//Window Defaults
window.onerror = function(errorMsg, file, lineNumber, column, errorObj) {
    musicPlayer.logging.error(["HandleError: " + errorMsg, file + ":" + lineNumber + ":" + column, errorObj], {
        verbose: 0
    });
    alert("ERROR " + file + "@" + lineNumber + ":" + column);
};

window.onbeforeunload = function() {
    clearInterval(musicPlayer.tick.tickInterval);
    musicPlayer.saveSettings();
};

$(document).ready(function() {
    musicPlayer.player.oncanplay = musicPlayer.oncanplay;
    musicPlayer.player.onended = musicPlayer.onended;

    musicPlayer.getSettings();
    musicPlayer.player.volume = musicPlayer.settings.volume;

    $(".volumeControl").on('change', function(event) {
        musicPlayer.changevolume(this.value);
    });

    musicPlayer.getMusicList();
});
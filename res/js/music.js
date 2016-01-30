var musicPlayer = {
    AUTHOR: "R0CK",
    NAME: "Muse",
    VERSION: "0.6.0",
    settings: {
        volume: (utils.mobilecheck() ? 1 : 0.2),
        shuffle: true,
        verbose: 4
    },
    started: false,
    rawList: [],
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
            if (options.alert !== undefined) {
                $("body").children().each(function(i, o) {
                    $(o).hide();
                });
                $('.modal').css('display', 'block');
                if (message !== undefined) {
                    $('.modal .body .error h1').text(message);
                }
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

        if (!utils.mobilecheck()) {
            $(".search .searchBox").attr("disabled", "disabled");

            $(document).on("keydown", function(event) {
                musicPlayer.logging.info("Keypress (" + event.keyCode + ")", {
                    verbose: 4
                });
                if ($('.search .searchBox').is(":focus")) {
                    setTimeout(function() {
                        if ($('.searchBox').val() !== undefined) {
                            musicPlayer.drawSongs($('.search .searchBox').val().toLowerCase().trim());
                        }
                    }, 50);
                } else {
                    if (event.keyCode == 45 || event.keyCode == 189) { //Minus
                        musicPlayer.changeVolume((musicPlayer.settings.volume - 0.02 < 0 ? 0 : musicPlayer.settings.volume - 0.02));
                    } else if (event.keyCode == 61 || event.keyCode == 187) { //Plus
                        musicPlayer.changeVolume((musicPlayer.settings.volume + 0.02 > 1 ? 1 : musicPlayer.settings.volume + 0.02));
                    } else {
                        if (event.keyCode == 8) { //Backspace
                            $(".search .searchBox").val($(".search .searchBox").val().substring(0, $(".search .searchBox").val().length - 1));
                            event.preventDefault();
                        } else {
                            if (typeof event.which == "number" && (event.which > 48 || event.which == 32) && event.which < 222) {
                                if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                                    $(".search .searchBox").val($(".search .searchBox").val() + (event.shiftKey ? String.fromCharCode(event.keyCode) : String.fromCharCode(event.keyCode).toLowerCase()));
                                }
                            }
                        }
                        setTimeout(function() {
                            $(".search .searchBox").trigger('change')
                        }, 50);
                    }
                }
                if (event.keyCode == 27) { //Escape
                    $('.search .searchBox').val("");
                    setTimeout(function() {
                        $(".search .searchBox").trigger('change')
                    }, 50);
                }
            });
        }
        // ENABLE TICK
        // musicPlayer.tick.tickInterval = setInterval(function() {
        //     musicPlayer.tick.tick();
        // }, (1 / musicPlayer.tick.tickRate) * 1000);

        if (musicPlayer.settings.shuffle) {
            $('.button.shuffle').addClass('active')
        }
        musicPlayer.getSettings();
        this.changeVolume(musicPlayer.settings.volume);

        $(".volumeControl").on('change', function(event) {
            musicPlayer.changeVolume(this.value);
        });
        $(".search .searchBox").on('change', function(event) {
            if (this.value !== undefined) {
                musicPlayer.drawSongs(this.value.toLowerCase().trim());
            }
        });
        $('.search .searchClear').on('click', function(e) {
            $(".search .searchBox").val("");
            musicPlayer.drawSongs();
        });
        $('.button.rewind').on('click', function(e) {
            musicPlayer.resetSong();
        });
        $(".button.pause").on("click", function(e) {
            musicPlayer.togglepause();
        });
        $('.button.skip').on("click", function(e) {
            musicPlayer.skip();
        });
        $('.button.shuffle').on('click', function(e) {
            musicPlayer.toggleshuffle();
        });
        $('.button.refresh').on('click', function(e) {
            musicPlayer.getMusicList(false);
            musicPlayer.resetSong();
            musicPlayer.drawSongs();
        });

        musicPlayer.player.src = musicPlayer.createURL(musicPlayer.rawList[0]);
        musicPlayer.drawSongs();
    },
    createURL: function(url) {
        return "res/music/" + encodeURI(url);
    },
    generateName: function(url) {
        return url.replace('_', ' ').replace('.mp3', '').replace(/\[Monstercat.*\]/g, '')
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
        musicPlayer.logging.info(musicPlayer.rawList[0] + " has finished.", {
            verbose: 3
        });

        musicPlayer.moveSong(0, musicPlayer.rawList.length - 1);
        musicPlayer.player.src = musicPlayer.createURL(musicPlayer.rawList[0]);
    },
    oncanplay: function() {
        musicPlayer.logging.info(musicPlayer.rawList[0] + " can play.", {
            verbose: 3
        });

        $(".currentSong .details .name").text(musicPlayer.rawList[0].replace(".mp3", "").replace("_", " ").trim());

        thumbnail.getByName({
            name: musicPlayer.rawList[0].replace(".mp3", "").replace("_", " ").trim()
        }, function(data, err) {
            $(".currentSong .image .thumbnail").css("background-image", "url(" + data + ")");
        });

        if (musicPlayer.started) {
            musicPlayer.player.play();
        }
    },
    onstalled: function() {
        musicPlayer.logging.error("Player failed to recieve music.", {
            verbose: 0,
            alert: true
        });
    },
    onerror: function(err) {
        musicPlayer.logging.error("Player failed to recieve music.", {
            verbose: 0,
            alert: true
        });
    },
    ontimeupdate: function() {
        if (!musicPlayer.player.paused) {
            $(".progressBar .progress").css("width", (musicPlayer.player.currentTime / musicPlayer.player.duration) * 100 + "%");
        }
    },
    // TODO Fix Broken
    // onpause: function() {
    //     if (!musicPlayer.started) {
    //         musicPlayer.started = true;
    //     }
    //     (musicPlayer.player.paused ? musicPlayer.player.play() : musicPlayer.player.pause());
    //     $(".pause i").attr("class", (musicPlayer.player.paused ? 'fa fa-pause' : 'fa fa-play'));
    // },
    togglepause: function() {
        if (!musicPlayer.started) {
            musicPlayer.started = true;
        }
        (musicPlayer.player.paused ? musicPlayer.player.play() : musicPlayer.player.pause());
        $(".pause i").attr("class", (musicPlayer.player.paused ? 'fa fa-pause' : 'fa fa-play'));
    },
    toggleshuffle: function() {
        console.log("toggle shuffle");
        musicPlayer.settings.shuffle = !musicPlayer.settings.shuffle;

        $(".button.shuffle").toggleClass('active');
    },
    changeVolume: function(volume) {
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
    resetSong: function() {
        var paused = musicPlayer.player.paused;
        musicPlayer.player.pause();
        musicPlayer.player.src = musicPlayer.createURL(musicPlayer.rawList[0]);
        musicPlayer.player.positon = 0;
        console.log(paused);
        if (paused) {
            musicPlayer.player.pause();
        }
    },
    getMusicList: function(init) {
        $.getJSON("/musiclist.json").done(function(data) {
            musicPlayer.rawList = (musicPlayer.settings.shuffle ? utils.shuffle(data) : data);
            if (init) {
                musicPlayer.init();
            }
        }).fail(function(error) {
            //Handle Error
            musicPlayer.logging.error(["Error Occuring While Fetching Music List", error], {
                verbose: 0
            });
        });
    },
    drawSongs: function(search) {
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
        musicPlayer.logging.info("Drawing Song List with search (" + search + ")", {
            verbose: 4
        });
        musicPlayer.rawList.forEach(function(o, i) {
            if (o == undefined) {
                musicPlayer.logging.warn("Undefined Error: musicPlayer.rawList[" + i + "] = " + o);
                musicPlayer.getMusicList(false);
            }
            if (search !== undefined) {
                if (o.toLowerCase().trim().indexOf(search) > -1) {
                    musicPlayer.logging.log("Drawing song" + o, {
                        verbose: 5
                    });
                    $('.songList').append(template.replace('$SONG_ID', i).replace('$SONG_NAME', musicPlayer.generateName(o)));
                }
            } else {
                $('.songList').append(template.replace('$SONG_ID', i).replace('$SONG_NAME', o.replace('_', ' ').replace('.mp3', '').replace(/\[Monstercat.*\]/g, '')));
            }
        });

        $('.addtrack').on('click', function(event) {
            var songid = $(this).parent().parent().attr('song-id');
            musicPlayer.moveSong(songid, 1);
        });
    },
    moveSong: function(songid, position) {
        musicPlayer.rawList.move(songid, position);
        musicPlayer.drawSongs($('.searchBox').val().trim().toLowerCase());
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
    musicPlayer.player.onpause = musicPlayer.onpause;
    musicPlayer.player.onplay = musicPlayer.onplay;
    musicPlayer.player.ontimeupdate = musicPlayer.ontimeupdate;
    musicPlayer.player.onerror = musicPlayer.onerror;
    musicPlayer.player.onstalled = musicPlayer.onstalled;

    musicPlayer.getMusicList(true);
});
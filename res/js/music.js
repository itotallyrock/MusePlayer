var musicPlayer = {
    AUTHOR: "R0CK",
    NAME: "Muse",
    VERSION: "0.6.4",
    settings: {
        volume: (utils.mobilecheck() ? 1 : 0.2),
        shuffle: true,
        verbose: 1
    },
    started: false,
    rawList: [],
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
            $('.controls').append('<div class="volume"><input type="range" name="name" value="" step="0.001" min="0" max="1" class="volumeControl"></div>');

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
                    if (event.keyCode == 45 || event.keyCode == 189 || event.keyCode == 173 || event.keyCode == 109) { //Minus
                        musicPlayer.changeVolume((musicPlayer.settings.volume - 0.02 < 0 ? 0 : musicPlayer.settings.volume - 0.02));
                    } else if (event.keyCode == 61 || event.keyCode == 187 || event.keyCode == 107) { //Plus
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
        return url.replace(".mp3", "").replace(".ogg", "").replace(".wav").replace("_", " ").replace(/\[Monstercat.*\]/g, '').trim()
    },
    getSettings: function() {
        if (localStorage.getItem("settings-" + musicPlayer.VERSION) !== undefined && localStorage.getItem("settings-" + musicPlayer.VERSION) !== null) {
            try {
                musicPlayer.settings = JSON.parse(localStorage.getItem("settings-" + musicPlayer.VERSION));
                musicPlayer.logging.info(["Retrieved Settings", "localStorage[settings-" + musicPlayer.VERSION + "] = " + JSON.stringify(musicPlayer.settings)], {
                    verbose: 2
                });
            } catch (error) {
                musicPlayer.logging.error("Invalid Settings Saved, removing old settings", {
                    verbose: 3
                });
                localStorage.removeItem("settings-" + musicPlayer.VERSION);
            }
        }
    },
    saveSettings: function() {
        musicPlayer.logging.info(["Saved Settings", "localStorage[settings-" + musicPlayer.VERSION + "] = " + JSON.stringify(musicPlayer.settings)], {
            verbose: 2
        });
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

        $(".currentSong .details .name").text(musicPlayer.generateName(musicPlayer.rawList[0]));

        thumbnail.getByName({
            name: musicPlayer.generateName(musicPlayer.rawList[0])
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
        // if (!musicPlayer.player.paused) {
        //     musicPlayer.started = false;
        // }
        $(".pause i").attr("class", (musicPlayer.player.paused ? 'fa fa-play' : 'fa fa-pause'));
    },
    togglepause: function() {
        if (!musicPlayer.started) {
            musicPlayer.started = true;
        }
        (musicPlayer.player.paused ? musicPlayer.player.play() : musicPlayer.player.pause());
        // $(".pause i").attr("class", (musicPlayer.player.paused ? 'fa fa-play' : 'fa fa-pause'));
    },
    toggleshuffle: function() {
        console.log("toggle shuffle");
        musicPlayer.settings.shuffle = !musicPlayer.settings.shuffle;
        if (musicPlayer.settings.shuffle) {
            $(".button.shuffle").addClass('active');
        } else {
            $(".button.shuffle").removeClass('active');
        }
    },
    changeVolume: function(volume) {
        var perfectVolume = (volume > 1 : 1 ? (volume < 0 ? 0 : parseFloat(volume)));
        musicPlayer.player.volume = perfectVolume;
        musicPlayer.settings.volume = perfectVolume;
        this.saveSettings();
        $(".volumeControl").val(perfectVolume);
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
        $.getJSON("/api/musiclist.json").done(function(data) {
            musicPlayer.rawList = (musicPlayer.settings.shuffle ? utils.shuffle(data) : data);
            if (init) {
                musicPlayer.init();
            }
        }).fail(function(error) {
            musicPlayer.logging.error(["Error Occuring While Fetching Music List", error], {
                verbose: 0,
                alert: true
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
                if (o.toLowerCase().trim().replace("-", "").indexOf(search) > -1) {
                    musicPlayer.logging.log("Drawing song" + o, {
                        verbose: 5
                    });
                    $('.songList').append(template.replace('$SONG_ID', i).replace('$SONG_NAME', musicPlayer.generateName(o)));
                }
            } else {
                $('.songList').append(template.replace('$SONG_ID', i).replace('$SONG_NAME', musicPlayer.generateName(o).replace(/\[Monstercat.*\]/g, '')));
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
##Place Songs Here
This directory is scanned by the application.  When a request is made, the music list is generated based on all the .mp3s in this folder and will be displayed.

Song names can contain special characters, but **Windows may cause issues if this is done.**

Subfolders are also included, to disclude sub folders modify `app/index.js`

You can also add more filetypes in `app/index.js` if you have a lot of other formats, just be careful because some formats cannot play in certain browsers.  Another idea to keep in mind when using other formats is that the `api/musiclist.json` request includes file types and when printing all songs it removes file types of only `.mp3` and it will show all others that are allowed through.

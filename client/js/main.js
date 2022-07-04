import MoviePlaylistApp from "./playlist-app";
import Alpine from "alpinejs";

window.Alpine = Alpine;
Alpine.data("moviePlaylistApp", MoviePlaylistApp);
Alpine.start();

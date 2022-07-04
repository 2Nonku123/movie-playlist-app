import Axios from "axios";

export default function MoviePlaylistApp() {
  return {
    accountVisible: false,
    loginVisible: true,
    user: { user_name: "", password: "", first_name: "", surname: "" },
    loginMessage: "",
    accountToken: "",
    favoriteMovies: [],
    movieSelectList: [],
    favoriteVisible: true,
    menuBarSearchText: "",
    movieSearchText: "",
    popupMessage: "",
    popupVisible: false,

    init() {
      this.checkUserToken();
    },

    openSignIn() {
      this.loginVisible = true;
      this.user.first_name = "";
      this.user.surname = "";
      this.user.password = "";
      this.user.user_name = "";
    },
    openSignUp() {
      this.loginVisible = false;
      this.user.first_name = "";
      this.user.surname = "";
      this.user.password = "";
      this.user.user_name = "";
    },
    openFavoriteMovie() {
      this.favoriteVisible = true;
      this.movieSelectList = [];
      this.favoriteMovies = [];

      this.getPlaylist();
    },

    openMovieSearch() {
      this.movieSearchText = this.menuBarSearchText;

      this.favoriteVisible = false;
      this.movieSelectList = [];
      this.favoriteMovies = [];

      // this.menuBarSearchText = "";
      if (this.movieSearchText.trim().length > 0) {
        this.searchMovie();
      }
    },

    signIn() {
      Axios.post("http://localhost:4017/api/login", this.user)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.saveToken();
            this.accountVisible = true;
            this.getPlaylist();
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    signUp() {
      Axios.post("http://localhost:4017/api/signup", this.user)
        .then((result) => result.data)
        .then((result) => {
          if (result.status === "success") {
            this.accountToken = result.token;
            this.accountVisible = true;
            this.saveToken();
          } else {
            this.handleMessage(result.message);
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    signout() {
      this.removeToken();
    },

    searchMovie() {
      this.movieSelectList = [];

      Axios.get(`http://localhost:4017/search/${this.movieSearchText}`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => result.results)
        .then((result) => {
          if (result && result.length > 0) {
            this.movieSelectList = result;
          } else {
          }
        })
        .catch((error) => {
          this.handleError(error);
        });
    },

    getPlaylist() {
      this.favoriteMovies = [];

      Axios.get("http://localhost:4017/playlist", {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          if (result && result.length > 0) {
            this.favoriteMovies = result;
          }
        })
        .catch((error) => this.handleError(error));
    },

    displayMovieSearch() {
      this.favoriteMovies = [];
      this.movieSelectList = [];
      this.searchMovieText = "";
      this.favoriteVisible = false;
    },

    hideMovieSearch() {
      this.favoriteMovies = [];
      this.movieSelectList = [];
      this.searchMovieText = "";
      this.favoriteVisible = true;
    },

    addMovie(movie_select_id) {
      Axios.post(
        "http://localhost:4017/playlist",
        { movie_id: movie_select_id },
        {
          headers: { authorization: `${this.accountToken}` },
        }
      )
        .then((result) => result.data)
        .then((result) => {
          this.handleMessage(result.message);
          if (result.status == "success") {
            this.getPlaylist();
            this.favoriteVisible = true;
          }
        })
        .catch((error) => this.handleError(error));
    },
    removeMovie(playlistid) {
      Axios.delete(`http://localhost:4017/playlist/${playlistid}/`, {
        headers: { authorization: `${this.accountToken}` },
      })
        .then((result) => result.data)
        .then((result) => {
          this.handleMessage(result.message);
          if (result.status == "success") {
            this.getPlaylist();
          }
        })
        .catch((error) => this.handleError(error));
    },

    removeToken() {
      localStorage.removeItem("token");
      this.accountToken = "";
      this.favoriteMovies = [];
      this.movieSelect = [];
      this.accountVisible = false;
      this.loginVisible = true;
      this.favoriteVisible = true;
      this.movieSearchText = "";
      this.menuBarSearchText = "";
    },

    checkUserToken() {
      this.accountToken = localStorage.getItem("token");
      if (this.accountToken != null) {
        this.accountVisible = true;
        this.getPlaylist();
      }
    },

    handleError(error) {
      if (
        error.response.status &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        this.removeToken();
        this.popupMessage = "Login expired";
      } else {
        this.popupMessage = "Could not process request";
      }

      this.popupVisible = true;
    },

    handleMessage(message) {
      this.popupMessage = message;
      this.popupVisible = true;
    },

    saveToken() {
      localStorage.setItem("token", this.accountToken);
    },
  };
}

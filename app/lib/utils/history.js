let historyWatcher = {
  onPopstate: function (cb) {
    this.supportHistoryAPI() && window.addEventListener('popstate', cb);
  },
  addHistory: function (state, url) {
    this.supportHistoryAPI() ?
      window.history.pushState(state, 'search', url) :
      window.location.search = url;
  },
  supportHistoryAPI: function () {
    return window.history.pushState ? true : false;
  }
};

module.exports = {historyWatcher: historyWatcher};

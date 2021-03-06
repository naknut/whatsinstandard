var apiURL = '/api/v5/sets.json'
var code = Vue.component('set-image', {
  props: ['code'],
  template: `
    <span v-tippy="{ position: 'left' }" class="icon tip" :title="code">
      <i class="ss" :class="imsym"></i>
    </span>
  `,
  data: function() {
    return {
      imsym: 'ss-' + this.code.toLowerCase()
    }
  },
})

var app = new Vue({
  el: '#vue',

  data: {
    sets: [],
    showRecentlyDropped: false,
    showBanSource: false
  },

  created: function() {
    let self = this;

    fetch(apiURL).then(function(response) {
      response.json().then(function(data) {
        self.sets = data.sets;
      });
    });
  },

  filters: {
    moment: function(date) {
      return moment(date).format('MMMM Do, YYYY');
    }
  },

  methods: {
    dropped: function(sets) {
      return sets.filter(function(set) {
        return (Date.parse(set.exit_date) || Infinity) <= Date.now();
      });
    },

    unreleased: function(sets) {
      return sets.filter(function(set) {
        return (Date.parse(set.enter_date) || Infinity) > Date.now();
      });
    },

    standard: function(sets) {
      return _.difference(sets, this.unreleased(sets), this.dropped(sets));
    },

    // rounds takes an array of sets and returns a two-dimensional array of sets, with each sub-array being a group of
    // the input sets that drop on the same rough_exit_date. The order of the outer array is by date-increasing. The
    // order of the inner arrays is preserved from the input.
    rounds: function(sets) {
      return Object.values(sets.reduce(function(rounds, set) {
        return _.extend(rounds, {[set.rough_exit_date]: (rounds[set.rough_exit_date] || []).concat(set)});
      }, {})).sort(function(a, b) {
        return (a[0].rough_exit_date < b[0].rough_exit_date) ? -1 : 1;
      });
    },

    // pad takes a two-dimensional array of rounds of drops (as returned from rounds) and returns the same
    // two-dimensional array with the last round of drops padded with placeholder ("...") sets to four sets total.
    pad: function(rounds) {
      if (rounds.length === 0) {
        return rounds
      }
      while (rounds[rounds.length - 1].length < 4) {
        rounds[rounds.length - 1].push({
          "name": "...",
          "block": null,
          "code": null,
          "enter_date": null,
          "exit_date": null,
          "rough_exit_date": rounds[rounds.length - 1][0].rough_exit_date
        })
      }
      return rounds
    },

    isReleased: function(set) {
      return Date.parse(set.enter_date) <= Date.now();
    },

    firstUnreleasedSet: function(block) {
      return block.find(function(set) {
        return Date.parse(set.enter_date) > Date.now();
      });
    },

    toggleRecentlyDropped: function() {
      this.showRecentlyDropped = !(this.showRecentlyDropped);
      var msg = (this.showRecentlyDropped) ? 'show recently dropped sets' : 'hide recently dropped sets';
      ga('send', 'event', 'link', 'click', msg);
    },
      
    toggleBanSource: function() {
      this.showBanSource = !(this.showBanSource);
      var msg = (this.showBanSource) ? 'show ban sources' : 'hide ban sources';
      ga('send', 'event', 'link', 'click', msg);
    }
  }
});

var baseHref = document.getElementsByTagName('base')[0].href;
var yai = new YouAndI('joker-poker');
var app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data : {
    sessionIdInput : '',
    dialog : false,
    sessionId : null,
    session : { name : 'Joker Poker', time : 0},
    connected : false,
    lastMessage : '',
    clusterState : {"leader" : "?", "nodes" : []},
    isLeader : false,
    messageInput : '',
    yaiID : yai.createdAt,
    pages : [
      ['Team' , 'fas fa-user-friends'] ,
      ['Me' , 'fas fa-user'],
      ['Settings' , 'fas fa-cog'],
    ],
    page : "Team",
    pageIcon : 'fas fa-user-friends',
  },
  methods: {
    join: function (create) {
      this.sessionId = yai.setSessionId(create ? yai.uuid() : this.sessionIdInput);
      yai.connect();
    },
    sessionChange: function () {
      this.session.time = new Date().getTime();
      yai.send({session : this.session});
    },
    navigate: function (p,i) {
      this.page = p || this.page;
      this.pageIcon = i || this.pageIcon;
      window.history.pushState({page : this.page, sessionId: this.sessionId  }, null, baseHref+this.sessionId +"/"+ this.page);
    },
    syncState: function (create) {
      this.clusterState = yai.clusterState;
      this.isLeader = yai.isLeader;
    },
    send: function () {
      yai.send(this.messageInput);
    },
  }
});

function loadLocalData(){
  var data = JSON.parse(localStorage.getItem(app.sessionId));
	if(data && data.session) app.session = data.session;
}

window.onunload  = function(){
  if(!app.sessionId) return;
	localStorage.setItem(app.sessionId, JSON.stringify({session : app.session}));
};

(function(){
  var path = document.URL.replace(baseHref, "");
  if (path) {
    var tokens =  path.split("/");
    app.sessionId = tokens[0];
    app.page = tokens[1] || "Team";
    app.pageIcon = app.pages.find(e => e[0] == app.page)[1]
  }
  if(!app.sessionId){
    app.dialog = true;
  }  else {
    loadLocalData();
    app.navigate();
  }
})();


yai.getSessionId = function() {return app.sessionId;};
yai.setSessionId = function (id) {
    app.sessionId = id;
    loadLocalData();
    app.navigate();
		return id;
};

yai .addListener("clusterChange" , app.syncState)
    .addListener("onboard" , function(yai) {
      yai.send({session : app.session});
    })
    .addListener("connect" , function() {
      app.connected = true;
      yai.send({session : app.session});
    })
    .addListener("message" , function(data) {
      if(data.session && data.session.time > app.session.time) {
        app.session = data.session;
      } else {
        app.lastMessage = data;
      }
    })
    .addListener("disconnect" , function(yai) {
      app.connected = false;
    })
    .connect();

var baseHref = document.getElementsByTagName('base')[0].href;
var yai = new YouAndI('joker-poker');
var app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data : {
    sessionIdInput : '',
    dialog : false,
    sessionId : null,
    connected : false,
    lastMessage : '',
    clusterState : null,
    isLeader : false,
    messageInput : '',
    yaiID : yai.createdAt,
    pages : ['Home' , 'Cluster'],
    page : "Home",
  },
  methods: {
    join: function (create) {
      this.sessionId = yai.setSessionId(create ? yai.uuid() : this.sessionIdInput);
      yai.connect();
    },
    navigate: function (e) {
      this.page = e ? e.target.innerText : this.page;
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


(function(){
  var path = document.URL.replace(baseHref, "");
  if (path) {
    var tokens =  path.split("/");
    app.sessionId = tokens[0];
    app.page = tokens[1] || "Home";
  }
  if(!app.sessionId)
    app.dialog = true;
  else
    app.navigate();
})();


yai.getSessionId = function() {return app.sessionId;};
yai.setSessionId = function (id) {
    app.sessionId = id;
    app.navigate();
		return id;
};

yai .addListener("clusterChange" , app.syncState)
    .addListener("onboard" , function(yai) {
      yai.send(app.lastMessage);
    })
    .addListener("connect" , function() {
      app.connected = true;
    })
    .addListener("message" , function(data) {
      app.lastMessage = data;
    })
    .addListener("disconnect" , function(yai) {
      app.connected = false;
    })
    .connect();

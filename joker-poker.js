var baseHref = document.getElementsByTagName('base')[0].href;
var yai = new YouAndI('joker-poker');
var app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data : {
	disableWatch : 0,
    myestimate : '',
    sessionIdInput : '',
    dialog : false,
    sessionId : null,
    session : {
      name : 'Joker Poker',
      time : 0,
      values : ["☕","1","2","3","5","13","20","40","?"]
    },
    me : {
      id: null,
      name : "",
      image : "",
      observer : false,
      autoConnectInterval : 5,
    },
    estimates : {
    },
    connection : {
      status : "disconnected",
      auto : false,
      autoText : '',
      autoCountDown : -1,
    },
    lastMessage : '',
    clusterState : {"leader" : "?", "nodes" : []},
    isLeader : false,
    yaiID : yai.createdAt,
    pages : [
      ['Team' , 'mdi-account-multiple'] ,
      ['Me' , 'mdi-account'],
      ['Settings' , 'mdi-settings'],
    ],
    page : "Team",
    pageIcon : 'mdi-account-multiple',
  },
  computed: {
    estimateCount: function () {
      var count = 0;
      for (var mate in this.estimates) {
        if(this.estimates[mate].estimate != '') {
          count++;
        }
      }
      return count;
    },
    estimateMin: function () {
        var min = 9999;
        for (var mate in this.estimates) {
        	const v = this.order[this.estimates[mate].estimate];
        	if(v) min = Math.min(v, min);
        }
        return min;
    },
    estimateMax: function () {
    	var max = -1;
    	for (var mate in this.estimates) {
    		const v = this.order[this.estimates[mate].estimate];
    		if(v) max = Math.max(v, max)
    	}
    	return max;
    },
    connected: function () {
      return this.connection.status == "connected";
    },
    estimateProgress: function () {
      return 100 * this.estimateCount / Object.keys(this.estimates).length;
    },
    estimateDone: function () {
      return 100 == this.estimateProgress;
    },
    order: function () {
      const o = {}
      app.session.values.forEach((v,i) => o[v] = v=="?"?1.3:(i+1));
      return o;
    }
  },
  watch: {
    myestimate: {
       handler(){
    	   if(this.disableWatch) {
      		  this.disableWatch--;
       	  } else {
	    	 if(this.myestimate!="") {
	           this.navigate('Team');
	           this.setEstimate(this.me.id, this.myestimate);
	           yai.send({estimate : {id : this.me.id,  estimate : this.myestimate }});
	         } else {
	           this.navigate('Me');
	         }
       	  }
       }
   },
	 me: {
      deep: true,
      handler(){
    	  if(this.disableWatch) {
   		   	this.disableWatch--
    	  } else {
          const imgUrl = "https://robohash.org/" + this.me.name;
          if(this.me.image != imgUrl){
            this.disableWatch++
    	    	this.me.image = imgUrl;
          }
  	    	this.sendMate();
    	  }
      }
    },
    session: {
    	deep: true,
    	handler(){
    	   if(this.disableWatch) {
    		   this.disableWatch--
    	   } else {
           this.disableWatch++
    		   this.session.time = new Date().getTime();
    		   yai.send({session : this.session});
    	   }
    	}
    },
  },
  methods: {
	getColor: function (estimate, fallback) {
		 if(!this.estimateDone) return fallback;
		 if(this.estimateMin == this.estimateMax) return "light-green";
		 const v = this.order[estimate];
		 return (v == this.estimateMin || v == this.estimateMax) ? "orange" : "";
	},
    join: function (create) {
      this.sessionId = yai.setSessionId(create ? yai.uuid() : this.sessionIdInput);
      this.connect();
    },
    sendRestart: function () {
    	yai.send({restart : true});
    },
    restart: function () {
		this.myestimate = "";
		for (var mate in this.estimates) {
	       this.estimates[mate].estimate = '';
	    }
    },
    sendReveal: function () {
    	yai.send({reveal : true});
    },
    reveal: function () {
    	if(this.myestimate == "") {
    		this.disableWatch++;
    		this.myestimate = "?";
    	}
    	for (var mate in this.estimates) {
    		if(this.estimates[mate].estimate == '')
    			this.estimates[mate].estimate = '?';
    	}
    	this.navigate("Team");
    },
    connect: function (create) {
      this.connection.status = "connecting";
      yai.connect();
    },
    autoConnect: function () {
      const con = this.connection;
      if(!con.auto){
        con.autoText = '';
        return;
      }
      con.autoCountDown = con.autoCountDown < 0 ? this.me.autoConnectInterval : con.autoCountDown -1;
      if(con.autoCountDown == 0) {
        con.autoText = "";
        con.autoCountDown--;
        this.connect();
      } else {
        con.autoText = "Automatic reconnect in "+con.autoCountDown+" seconds.";
        window.setTimeout(this.autoConnect, 1000);
      }
    },
    disconnect: function (create) {
      this.connection.auto = false;
      yai.disconnect();
    },
    navigate: function (page,icon) {
      if(page == this.page) return;
      this.page = page || this.page;
      this.pageIcon = icon || this.pageIcon;
      window.history.pushState({page : this.page, sessionId: this.sessionId  }, null, baseHref+this.sessionId +"/"+ this.page);
    },
    syncState: function (create) {
      this.clusterState = yai.clusterState;
      this.isLeader = yai.isLeader;
    },
    sendMate : function() {
      yai.send({mate : Object.assign(this.me, {estimate : this.myestimate, yaiID : this.yaiID})})
    },
    removeMate : function(yaiID) {
      for (var mate in this.estimates) {
        const m = this.estimates[mate];
        if(m.yaiID == yaiID) {
          Vue.delete(this.estimates, m.id);
        }
      }
    },
    setEstimate: function (id, estimate) {
      this.estimates[id].estimate = estimate;
    },
  }
});



function loadLocalData(){
  var data = JSON.parse(localStorage.getItem(app.sessionId));
	if(data && data.session) app.session = data.session;
  if(data && data.me) {
    app.me = data.me;
  } else {
    axios.get('https://randomuser.me/api/?inc=name&noinfo&nat=us,fr,gb,de,ch')
      .then(function (response) {
        app.me.name = response.data.results[0].name.first;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        app.me.name = new Date().getTime()
      })
     .then(function () {
    	 app.navigate("Settings");
     });

  }
  app.me.id = app.me.id || "m"+yai.uuid("");
  if(!app.me.observer) Vue.set(app.estimates, app.me.id, app.me);
}

window.onunload  = function(){
  if(!app.sessionId) return;
	localStorage.setItem(app.sessionId, JSON.stringify({
    session : app.session,
    me : app.me
  }));
};

yai.getSessionId = function() {return app.sessionId;};
yai.setSessionId = function (id) {
    app.sessionId = id;
    loadLocalData();
    app.navigate();
	  return id;
};

yai .addListener("clusterChange" , app.syncState)
    .addListener("onboard" , function() {
      this.send({session : app.session});
      this.send({estimates : app.estimates});
    })
    .addListener("connect" , function() {
      app.connection.status = "connected";
      app.connection.auto = true;
      this.send({session : app.session});
      app.sendMate();
    })
    .addListener("message" , function(data) {
      //console.log(data);
      if(data.session) {
    	  if(data.session.time > app.session.time) {
    		  app.disableWatch++
    		  app.session = data.session;
    	  }
      } else if(data.mate) {
    	  if(data.mate.observer) {
    		  app.removeMate(data.mate.yaiID);
    	  } else {
    		  Vue.set(app.estimates, data.mate.id, data.mate);
    	  }
      } else if(data.estimates) {
		      app.estimates = data.estimates;
      } else if(data.estimate) {
          app.setEstimate(data.estimate.id, data.estimate.estimate)
      } else if(data.restart) {
    	  app.restart();
      } else if(data.reveal) {
    	  app.reveal();
      } else {
        app.lastMessage = data;
      }
    })
    .addListener("disconnect" , function() {
      app.connection.status = "disconnected";
      app.autoConnect();
    })
    .addListener("bye" , function(yaiID) {
      app.removeMate(yaiID);
    });

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
    app.connect();
    app.navigate();
  }
})();

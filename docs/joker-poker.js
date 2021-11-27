var baseHref = document.getElementsByTagName('base')[0].href;
var gravatarTimer;
var gravatarLoading;
var yai = new YouAndI('joker-poker');
var app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data : {
	drawer : false,
	disableWatch : 0,
    my: {
		estimate : '',
		missedRounds : 0
	},
    dialog : false,
    sessionId : null,
    settings : {detailed : false},
    session : {
      name : 'Joker Poker',
      time : 0,
      values : ["☕","1","2","3","5","8","13","20","40","?"],
	  selected: ""
    },
    me : {
      id: null,
      name : "",
      useMonsterID : true,
      gravatar : '',
      useGravatar : false,
      image : "",
      observer : false,
      autoConnectInterval : 3,
      navSrc : "",
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
    teamIcon: 'mdi-account-multiple',
    qrIcon: 'mdi-qrcode',
    pages : [
      ['Team' , 'mdi-account-multiple'] ,
      ['Me' , 'mdi-account'],
      ['Settings' , 'mdi-settings'],
      ['QR' , 'mdi-qrcode'],
    ],
    page : "Team",
    pageIcon : 'mdi-account-multiple',
  },
  computed: {
	idleDialog : function() {
		return this.my.missedRounds >1;
	},
    estimateCount: function () {
      var count = 0;
      for (var mate in this.estimates) {
        if(this.estimates[mate].estimate != '') {
          count++;
        }
      }
      return count;
    },
    mateCount: function () {
      var count = 0;
      for (var mate in this.estimates) {
		if(this.me.id != mate) {
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
    sessionURL: function () {
    	return baseHref+this.sessionId +"/";
    },
    order: function () {
      const o = {}
      app.session.values.forEach((v,i) => o[v] = app.isJoker(v)?1.3:(i+1));
      return o;
    },
	large: function () { 
        return this.$vuetify.breakpoint.name.includes('l');
	}
  },
  watch: {
    'my.estimate': {
       handler(){
    	   if(this.disableWatch) {
      		  this.watchDec();
       	  } else {
	    	 if(this.my.estimate!="") {
	           this.setEstimate(this.me.id, this.my.estimate);
	           yai.send({estimate : {id : this.me.id,  estimate : this.my.estimate }});
	         } else {
	           if(!this.me.observer) this.navigate("Me");
	         }
       	  }
       }
   },
   'me.useGravatar'(useGravatar){
	   clearTimeout(gravatarTimer);
	   if(useGravatar) {
		   this.loadGravatar();
       }
   },
   'me.gravatar'(newVal){
	   clearTimeout(gravatarTimer);
	   gravatarTimer = setTimeout(this.loadGravatar, 500);
   },
   me: {
      deep: true,
      handler(){
    	  if(this.disableWatch) {
   		   	this.watchDec();
    	  } else {
    		if(this.me.useGravatar && this.me.useMonsterID){
    			this.watchInc();
    			this.me.useMonsterID = false;
    		}
    		if(this.me.useMonsterID){
				// alternative service URL: https://sebsauvage.net/monsterid/?seed=
    			const imgUrl = "https://www.splitbrain.org/_static/monsterid/monsterid.php?seed=" + this.me.name;
    			if(this.me.image != imgUrl){
    				this.watchInc()
    				this.me.image = imgUrl;
    			}
    		}
  	    	this.sendMate();
    	  }
      }
    },
	'session.name'(sessionName){
	   document.title = sessionName;
   	},
    session: {
    	deep: true,
    	handler(){
    	   if(this.disableWatch) {
    		   this.watchDec()
    	   } else {
    		   this.watchInc()
    		   this.session.time = new Date().getTime();
    		   yai.send({session : this.session});
    	   }
    	}
    },
  },
  methods: {
	removeStale(){
		for (var mate in this.estimates) {
	        const m = this.estimates[mate];
	        if(!this.clusterState.nodes.includes(m.yaiID)) {
	          	Vue.delete(this.estimates, m.id);
	        }
      	}
	},
	isJoker(c){
		return c == "?" || c == "🃏";
	},  
	watchInc: function () {
		this.disableWatch++;
	},
	watchDec: function () {
		this.disableWatch = Math.max(this.disableWatch-1,0);
	},
	loadGravatar: function () {
		if(!app.me.useGravatar || app.me.gravatar=='') return;
		clearTimeout(gravatarTimer);
		if(gravatarLoading) return;
		gravatarLoading = true;
		axios.get('https://en.gravatar.com/'+app.me.gravatar+'.json')
	      .then(function (response) {
  	    	if(!app.me.useGravatar) return;
  	    	app.disableWatch = 10;
  	    	app.me.image = response.data.entry[0].thumbnailUrl;
  	    	try {
  	    		app.me.name = response.data.entry[0].name.givenName;
  	    	} catch(e) {
  	    		app.me.name = app.me.gravatar;
  	    	}
             try {
  	    		app.me.navSrc = response.data.entry[0].profileBackground.url;
  	    	} catch(e) {
  	    	}
	      })
	      .catch(function (error) {
	    	 if(!app.me.useGravatar) return;
	         console.log(error);
	      })
	      .then(function () {
	    	  gravatarLoading = false;
	    	  app.disableWatch = 0;
	    	  app.sendMate();
	    });
		
	},
	getColor: function (estimate, fallback) {
		 if(!this.estimateDone || this.isJoker(estimate)) return fallback;
		 if(this.estimateMin == this.estimateMax) return "light-green";
		 const v = this.order[estimate];
		 return (v == this.estimateMin || v == this.estimateMax) ? "orange" : "";
	},
    join: function (create) {
	  this.drawer = this.large;
      this.sessionId = yai.setSessionId(create ? yai.uuid(): this.sessionId);
      this.connect();
	  this.my.missedRounds = 0;
    },
    sendRestart: function () {
    	yai.send({restart : true});
    },
    restart: function () {
		this.my.estimate = "";
		for (var mate in this.estimates) {
	       this.estimates[mate].estimate = '';
	    }
		this.navigate('Me');
    },
	sendGoOffline: function () {
    	yai.send({goOffline : true});
    },
    goOffline: function () {
	    const disconnect = (this.session.selected == this.me.id);
		if(this.isLeader) this.session.selected = "";
		if(disconnect) this.disconnect();
	},
    sendReveal: function () {
    	yai.send({reveal : true});
    },
    reveal: function () {
    	if (this.my.estimate == "" && (!this.me.observer || this.idleDialog)) {
	        this.watchInc();
	        this.my.estimate = "?";
	        this.my.missedRounds++;
	        this.me.observer = this.idleDialog;
        }
    	for (var mate in this.estimates) {
    		if(this.estimates[mate].estimate == '')
    			this.estimates[mate].estimate = '?';
    	}
    	this.navigate("Team");
    },
    toggleConnection: function (create) {
        if(this.connected){
        	this.disconnect();
        } else {
        	this.connect();
        }
    },
    deleteLocal: function () {
    	localStorage.removeItem(this.sessionId);
    	window.onunload = null;
    	location.reload();
    },
    estimateClicked : function(v){
		this.my.estimate = v;
		this.my.missedRounds = 0;
		this.navigate('Team');
	},
    connect: function (create) {
	  if(this.connected) return;
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
	  if(!this.connected) return;
      this.connection.auto = false;
      yai.disconnect();
    },
    navigate: function (page,icon) {
      if(page == this.page) return;
      this.page = page || this.page;
      this.pageIcon = icon || this.pages.find(e => e[0] == this.page)[1]
      window.history.pushState({page : this.page, sessionId: this.sessionId  }, null, this.sessionURL+ this.page);
    },
    syncState: function (create) {
      this.clusterState = yai.clusterState;
      this.isLeader = yai.isLeader;
    },
    sendMate : function() {
      yai.send({mate : Object.assign(this.me, {estimate : this.my.estimate, yaiID : this.yaiID})})
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


function loadRandomuserMe(){
  axios.get('https://randomuser.me/api/?inc=name&noinfo&nat=us,fr,gb,de,ch')
    .then(function (response) {
    	app.watchInc()
    	app.me.name = response.data.results[0].name.first;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
		app.watchInc()
    	app.me.name = "NoBody_"+ new Date().getTime();;
    })
}

function loadLocalData(){
  var data = JSON.parse(localStorage.getItem(app.sessionId));
  if(data && data.settings) {
	  app.settings = data.settings;
  }
  if(data && data.session) {
		app.watchInc()
		app.session = data.session;
  }
  if(data && data.drawer && app.large) {
	app.drawer = true;
  }
  if(data && data.me) {
	app.watchInc()
	app.me = data.me;
  } else if(app.me.name == ""){
    loadRandomuserMe();
  }
  app.me.id = app.me.id || "m"+yai.uuid("");
  if(!app.me.observer) Vue.set(app.estimates, app.me.id, app.me);
  return data && data.me;
}

window.onunload  = function(){
  if(!app.sessionId) return;
	localStorage.setItem(app.sessionId, JSON.stringify({
    session : app.session,
    me : app.me,
    settings : app.settings,
    drawer : app.drawer
  }));
};

yai.getSessionId = function() {return app.sessionId;};
yai.setSessionId = function (id) {
	console.log("setSessionId", id)    
	app.sessionId = id;
    loadLocalData();
    app.navigate.bind(app)();
	return id;
};

yai .addListener("clusterChange" , app.syncState)
    .addListener("onboard" , function() {
      this.send({session : app.session});
	  app.removeStale();
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
    		  app.watchInc()
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
      } else if(data.goOffline) {
    	  app.goOffline();
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
	app.dialog = !loadLocalData();
	app.connect.bind(app)();
    app.navigate.bind(app)(tokens[1] || "Team");
  } else {
	  app.dialog = true;
	  loadLocalData();
  }
})();

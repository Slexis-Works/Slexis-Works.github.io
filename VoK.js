var VoK=(function(){
	var self={};
	
	self.audios={
		"a":[150,150],
		"à":[0,150],//an
		"ê":[50,150],
		"é":[200,150],
		"è":[50,300],
		"i":[0,200],
		"î":[30,150],//in
		"o":[20,200],
		"ô":[50,200],//on
		"u":[130,150],
		"w":[0,200],//ou
		
		"p":[230,100],
		"b":[150,50],
		"g":[50,50],//gue
		"j":[50,200],
		"m":[50,100],
		"n":[100,100],
		"k":[20,100],
		"l":[200,200],
		"d":[100,100],
		"f":[180,70],
		"v":[130,150],
		"t":[200,100],//pas fait plus loin
		"r":[50,200],
		"z":[50,50],
		"s":[50,200], //ss
		"x":[50,50],
		"ç":[200,150] //ch
	};
	
	self.phonems={
		"0":"zéro",
		"1":"un",
		"2":"deu",
		"3":"troi",
		"4":"katr",
		"5":"cink",
		"6":"sisse",
		"7":"sète",
		"8":"uite",
		"9":"neuf",
		"%":"pourcen",
		"ô":"o ",
		"î":"i ",
		"s'":"s",
		"t'":"t",
		"d'":"d",
		";":" ",
		".":" ",
		",":" ",
		"'":" ",
		":":" ",
		" est ":"è",
		"tt ":"tte ",
		
		"ce":"se",
		"cé":"sé",
		"cè":"sè",
		"ci":"si",
		"cî":"sî",
		"cê":"sê",
		
		"ge":"je",
		"gé":"jé",
		"gè":"jè",
		"gi":"ji",
		"gî":"jî",
		"gê":"jê",
		
		"à":"a",
		"â":"a ",
		"eai":"è",
		"ai":"è",
		"ê":"è",
		"ù":"u",
		"an":"à",
		"en":"à",
		"on":"ô",
		"un ":"î",
		"eau":"o",
		"au":"o",
		"oin":"ouin",
		"oi":"oua",
		"in":"î",
		"yn":"î",
		"în":"in",
		"ou":"w",
		"ez ":"é",
		"er ":"é",
		"et ":"é",
		"qu":"k",
		//"se":"z",
		"ei":"è",
		"eè":"è",
		"ph":"f",
		"g ":"",
		"x ":"",
		"p ":"",
		"d ":"",
		"s ":" ",
		"t ":"",
		"ss":"s",
		"tt":"t",
		"eu":"ê",
		"e ":"",
		"e":"è",
		//"ê":"e",
		"rr":"r",
		"mm":"m",
		"ç":"s",
		"ch":"ç",
		"c'":"s",
		"c":"k",
		"y":"i",
		"ï":"i"
	}
	
	self.phonetize=function(c) {
		c=c.toLowerCase();
		for(r in self.phonems) {
			//console.log(r);
			while(c.indexOf(r)>=0) {
				c=c.replace(r,self.phonems[r]);
			}
		}
		console.log(c);
		return c;
	}
	
	self.pronounce=function(c,i,iv) {
		console.log(c[i]+" - Iv : "+iv);
		/*if(self.audios[c[i]]) {
			var audio=document.createElement("audio");
			audio.src=VoKparams.audioBaseURL+"/"+c[i]+".wav";
			audio.play();
			interval=0;
			if(self.audios[c[i+1]])
				interval=self.audios[c[i+1]][0];
			setTimeout(function(){self.pronounce(c,i+1,interval)},1.2*(self.audios[c[i]][1]-interval+iv));
		} else if(c[i])
			self.pronounce(c,i+1,iv);*/
		if(c[i]) {
			addingTime=0
			if(self.audios[c[i]]) {
				addingTime=self.audios[c[i]][1];
				self.pronouncePhonem(iv,c[i]);
			}
			self.pronounce(c,i+1,iv+addingTime);
		}
	}
	
	self.pronouncePhonem=function(baseTime,i) {
		var p=self.audios[i];
		var audio=document.createElement("audio");
		audio.src=VoKparams.audioBaseURL+"/"+i+".wav";
		//documebt.body.appendChild(audio);
		setTimeout(function(){audio.play()},baseTime-p[0])
	}
	
	self.say=function(c) {
		self.pronounce(self.phonetize(" "+c+" "),0,400);
	}
	
	self.init=function() {
		for(i in self.audios) {
			self.audios[i][2]=document.createElement("audio");
			self.audios[i][2].src=VoKparams.audioBaseURL+"/"+i+".wav";
			//document.body.appendChild(self.audios[i][2]);
			self.audios[i][2].play();
		}
	}
	
	return self;
})();
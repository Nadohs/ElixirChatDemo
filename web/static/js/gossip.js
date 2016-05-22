//MARK: - Network Request Giphy -

var randomGif = function(query) {
	return "http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&rating=pg&tag=" + query
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function gifImgFromResponse(response) {
	var res = JSON.parse(response)
	var img = {}
	
	img["url"] = res.data.fixed_height_downsampled_url
	img["width"] = res.data.fixed_height_downsampled_width
	img["height"] = res.data.fixed_height_downsampled_height
	return img
}

//MARK: - Time Formatting -

function getFormattedTime() {
    var date = new Date();
		var minutes = date.getMinutes().toString()
		if (minutes.length <= 1) { minutes = "0"+ minutes }
	    var str = 
			  date.getHours() + ":" + minutes
    	return str
    	return str
}

//MARK: - Gossip class -
class Gossip {
	
	static init(socket) {
		var $status = $("#status")
		var $messages = $("#messages")
		var $input = $("#message-input")
		var $username = $("#username")
		var $button = $("#shrug-button")
		var $gifButton = $("#gif-button")
		
		socket.onOpen( ev => console.log("OPEN", ev))
		socket.onError( ev => console.log("ERROR", ev))
		socket.onClose( e => console.log("CLOSE", e))
		
		var chan = socket.channel("rooms:lobby", {})
		chan.join()
			.receive("ignore", () => console.log("auth error"))
			.receive("ok", () => console.log("join ok"))
			.receive("timeout", () => console.log("Connection interruption"))
		chan.onError( e => console.log("something went wrong", e))
		chan.onClose( e => console.log("channel closed", e))
		
		
		//MARK: - button actions -
		
		$gifButton.off("click").on("click", e => {
			var path = randomGif($input.val().queryFormat())
			httpGetAsync(path, function(result) {
				
				var img = gifImgFromResponse(result)
				img["input"] = $input.val()
				var url = img.url
				if (url == undefined) {
					return
				}
				var style = "width:" + img.width + "px;height:" + img.height + "px;"
				img.style = style
				chan.push("new:msg", {
						user: $username.val().appendDate(),
						body: JSON.stringify(img), 
					}, 10000)
			})
		})

		$button.off("click").on("click", e => {
				var buttonTitle = e.target.textContent
				chan.push("new:msg", {user: $username.val().appendDate(), body:buttonTitle}, 10000)
		})

		
		$input.off("keypress").on("keypress", e => {
			if(e.keyCode == 13) {
				console.log("keyperssed")
				chan.push("new:msg", {user: $username.val().appendDate(), body: $input.val()}, 10000)
				$input.val("")
			}
		})
		
		
		//MARK: - websocket recievers -
		
		chan.on("new:msg", msg => {
			if (!msg.body.isJSON()) {
				$messages.append(this.messageTemplate(msg))
			} else {
				var data = JSON.parse(msg.body)
				$messages.append(this.gifTemplate(data))
				msg.body = data.input
				$messages.append(this.messageTemplate(msg))
			}
			scrollTo(0, document.body.scrollHeight)
		})
		
		chan.on("user:entered", msg => {
			var username = this.sanitize(msg.user || "anonymous")
			$messages.append(`<br/><i>[${username} entered]</i>`)
		})
		
		//MARK: -
	}
	
	static sanitize(html) { return $("<div/>").text(html).html() }
	
	static gifTemplate(data) {
		var url = data.url
		var style = data.style
		return (`<br><img src=${url} alt='' style=${style}></img><br>`)
	}

	static messageTemplate(msg) {
		let username = this.sanitize(msg.user || "anonymous")
		let body = this.sanitize(msg.body)
		return (`<p><a href='#'>[${username}]</a>&nbsp; ${body}</p>`)
	}
}

export default Gossip


//MARK: - Prototye Extensions -

String.prototype.isJSON = function(str) {
    try {
        JSON.parse(this);
    } catch (e) {
        return false
    }
    return true
}

Number.prototype.monthStr = function () {
	switch (this) {
		case 1: return "Jan"
		case 2: return "Feb"
		case 3: return "Mar"
		case 4: return "Apr"
		case 5: return "May"
		case 6: return "Jun"
		case 7: return "Jul"
		case 8: return "Aug"
		case 9: return "Sep"
		case 10: return "Oct"
		case 11: return "Nov"
		case 12: return "Dec"		
		default:
			break;
	}
}

String.prototype.appendDate = function () {
	if (this == "" || this == null) {
		return "Guest•" + getFormattedTime()
	}
	return this + "•" + getFormattedTime()
}

String.prototype.queryFormat = function () {
	var chars = this.split(" ")
	while (chars.length > 0 && chars[0] == "") {
		chars.shift()
	}

	while (chars.length > 0 && (chars.reverse()[0] == "")) {
		chars.pop()
	}
	return chars.join("+")
}

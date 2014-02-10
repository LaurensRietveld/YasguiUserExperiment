var timer = new Date();
var loggerUrl = "http://localhost/code/yasguiUserExperiment/logger.php";
var yasguiUrl = "http://doc.metalex.eu:8080/yasgui/";
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

function getUid() {
	var uid = $.cookie("experimentUid");
	if (!uid) {
		uid = guid();
		$.cookie("experimentUid", uid, { expires: 100 });
	}
	return uid;
	
}

function questionIdCookiePlusOne() {
	$.cookie("questionId", getQuestionIdCookie() + 1, { expires: 100 });
}

function questionIdCookieMinusOne() {
	
	$.cookie("questionId", getQuestionIdCookie() - 1, { expires: 100 });

}

function getQuestionIdCookie() {
	return parseInt($.cookie("questionId") || 0);

}




function updateButtons(questionId) {
	if (questionId < questions.length -1) {
		$("#nextButton").show();
	} else {
		$("#nextButton").hide();
	}
	
	
	if (questionId > 0) {
		$("#prevButton").show();
	} else {
		$("#prevButton").hide();
	}
}



function displayQuestion(questionId, questionObj) {
	timer = new Date();//init timer
	updateButtons(questionId);
	console.log(questionObj);
	var question = $("<p></p>").html(questionObj.question);
	$("#question").html("").append("<h1>" + questionObj.title + "</h1>").append(question);
	if (questionObj.iframeLink != null) {
		//append question id to url
		$("#yasguiIframe").attr("src", questionObj.iframeLink + "?uid=" + getUid() +  "&questionId=" + questionId).show();
	} else {
		$("#yasguiIframe").hide();
	}
}



var questions = [
	{
		title: "Welcome!",
		question: "We will guide you through a set of exercises. Try to answer these questions properly. Don't understand anything: let us know",
		iframeLink: null
	},
	{
		title: "Welcome2!",
		question: "We will guide you through a set of exercises. Try to answer these questions properly. Don't understand anything: let us know",
		iframeLink: yasguiUrl
	},
];


function showCurrentQuestion() {
	var questionId = getQuestionIdCookie();
	displayQuestion(questionId, questions[questionId]);
}



function trackTaskTime(buttonClicked) {
	var uid = getUid();
	var questionId = getQuestionIdCookie();
	var endTime = new Date();
	var busyTime = endTime - timer;
	var sendObj = {
		"uid": uid,
		"questionId": questionId,
		"timeBusy": busyTime ,
		"btn": buttonClicked
	};
	$.ajax(loggerUrl, {
	    data : JSON.stringify(sendObj),
	    contentType : 'application/json',
	    type : 'POST',
	});
}

$( document ).ready(function() {
	$("#nextButton").on("click", function(){
		trackTaskTime("next");
		questionIdCookiePlusOne();
		showCurrentQuestion();
	});
	
	$("#prevButton").on("click", function(){
		trackTaskTime("prev");
		questionIdCookieMinusOne();
		showCurrentQuestion();
	});
	/**
	 * 
	 * TODO
	 * track task time
	 * 
	 * 
	 */
	
	showCurrentQuestion();
	
	
	
});


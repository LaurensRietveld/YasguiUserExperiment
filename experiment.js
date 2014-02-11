var loggerUrl = "logger.php";
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
	
	updateButtons(questionId);
	console.log(questionObj);
	var question = $("<p></p>").html(questionObj.question);
	$("#question").html("").append("<h1>" + questionObj.title + "</h1>").append(question);
	$("#answer").html("");
	if (questionObj.displayHook != null) {
		questionObj.displayHook();
	} 
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
		question: "We will guide you through a set of exercises. Each exercise shows a question, and SPARQL interface with which you should answer the question. " +
				"Having trouble understanding something? Let us know!",
	},
	{
		title: "Exercise 1",
		question: "Try to query this endpoint to discover what it is about, and propose an interesting application to run on top of this endpoint",
		displayHook: function() {
			$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
		},
		answerGetVal: function() {
			return $("#answer").find("textarea").val();
		},
		iframeLink: yasguiUrl
	},
	{
		title: "Exercise 2",
		question: "Find all possible information about the state of California. You can give a short textual summary of your results below.",
		displayHook: function() {
			$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
		},
		answerGetVal: function() {
			return $("#answer").find("textarea").val();
		},
		iframeLink: yasguiUrl
	},
	{
		title: "Exercise 3",
		question: "Is the following statement correct? 'The population of London is bigger than the population of Paris'",
		displayHook: function() {
			$("#answer").append("<h3>Answer</h3> <select>" +
                 "<option value='--'>--Select--</option>" +
                  "<option value='1'>yes</option>" +
                  "<option value='0'>no</option>" +
                "</select>");
		},
		answerGetVal: function() {
			return $("#answer").find("select").val();
		},
		iframeLink: yasguiUrl
	},
	{
		title: "Exercise 4",
		question: "Which movie has been the most expensive one to make?",
		displayHook: function() {
			$("#answer").append("<h3>Answer</h3><input type='text'></input>");
		},
		answerGetVal: function() {
			return $("#answer").find("textarea").val();
		},
		iframeLink: yasguiUrl
	},
	{
		title: "Finished!",
		question: "You have finished the exercises. Thank you",
	},
//	{
//		title: "",
//		question: "placeholder",
//		displayHook: function() {
//			var newQuestion = $("<p></p>").html("Please fill in the results of the previous question in );
//			$("#question").append(newQuestion);
//			//$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
//		},
//		answerGetVal: function() {
//			return $("#answer").find("textarea").val();
//		},
//		iframeLink: yasguiUrl
//	}
];


function showCurrentQuestion() {
	var questionId = getQuestionIdCookie();
	displayQuestion(questionId, questions[questionId]);
}



function trackTask(buttonClicked) {
	var uid = getUid();
	var questionId = getQuestionIdCookie();
	var sendObj = {
		"uid": uid,
		"questionId": questionId,
		"time": new Date().getTime() ,
		"btn": buttonClicked
	};
	if (questions[questionId].answerGetVal) {
		sendObj["answer"] = questions[questionId].answerGetVal();
	}
	$.ajax(loggerUrl, {
	    data : JSON.stringify(sendObj),
	    contentType : 'application/json',
	    type : 'POST',
	});
}

$( document ).ready(function() {
	$("#userIdHiddenDiv").html(getUid());
	$("#nextButton").on("click", function(){
		trackTask("next");
		questionIdCookiePlusOne();
		showCurrentQuestion();
	});
	
	$("#prevButton").on("click", function(){
		trackTask("prev");
		questionIdCookieMinusOne();
		showCurrentQuestion();
	});
	trackTask("start");
	showCurrentQuestion();
});


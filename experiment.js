var loggerUrl = "logger.php";
var yasguiUrl = "http://doc.metalex.eu:8080/yasgui/?experiment=1";
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
	var title = "Exercise";
	if (questionObj.title) {
		title = questionObj.title;
	} else {
		title += " " + questionId;
	}
	$("#question").html("").append("<h1>" + title + "</h1>").append(question);
	$("#answer").html("");
	if (questionObj.displayHook != null) {
		questionObj.displayHook();
	} 
	if (questionObj.iframeLink != null) {
		//append question id to url
		$("#yasguiIframe").attr("src", questionObj.iframeLink + "&uid=" + getUid() +  "&questionId=" + questionId).show();
	} else {
		$("#yasguiIframe").hide();
	}
}
function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
var createQuestionOrdering = function() {
	for (var i = 1; i < (questions.length - 1); i++) {
		questionOrdering.push(i);
	}
	questionOrdering = shuffle(questionOrdering);
	questionOrdering.push(question.length - 1);//final page at end!
	questionOrdering.unshift(0);//start page at beginning!
	
	/**
	 * 
	 * TODO: we don't want communication question as first question
	 * 
	 */
//	if (questions[questionOrdering[1]].)
}
var questionOrdering = [];

var questions = [
	{
		title: "Welcome!",
		question: "We will guide you through a set of exercises. Each exercise shows a question, and SPARQL interface with which you should answer the question. " +
				"Having trouble understanding something? Let us know!",
	},
	{
//		question: "Find out which domains (classes) the dataset covers, and describe how some of them might be used for the application you proposed for Assignment 1. Hint: The dataset is much broader than the domains covered in the previous exercises",
		question: "Browse a number of endpoints in the interface below, en describe which datasets are interesting for Assignment 1 and why",
		displayHook: function() {
			$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
		},
		answerGetVal: function() {
			return $("#answer").find("textarea").val();
		},
		iframeLink: yasguiUrl + '&jsonSettings=%7B%0A"enabledFeatures"%3A+%7B%0A"endpointSelection"%3A+true%0A%7D%0A%7D'
	},
	{
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
		question: "Which movie has been the most expensive one to make?",
		displayHook: function() {
			$("#answer").append("<h3>Answer</h3><input type='text'></input>");
		},
		answerGetVal: function() {
			return $("#answer").find("input").text();
		},
		iframeLink: yasguiUrl
	},
	{
		question: "Provide a list of -triples-, where you extend information about the VU University, with information about this IWA course.",
		displayHook: function() {
			$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
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

$(document).ready(function() {
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


var loggerUrl = "logger.php";
var yasguiUrl = "http://doc.metalex.eu:8080/yasgui/?experiment=1";
var yasguiMultiEndpointUrl = "http://doc.metalex.eu:8080/yasguiMulti/?experiment=1";
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
function setGroupIdCookie(groupId) {
	$.cookie("groupId", groupId, { expires: 100 });
}
function setQuestionIdCookie(questionId) {
	$.cookie("questionId", questionId, { expires: 100 });
}
function questionIdCookiePlusOne() {
	setQuestionIdCookie(getQuestionIdCookie() + 1);
}

function questionIdCookieMinusOne() {
	setQuestionIdCookie(getQuestionIdCookie() - 1);
}

function getQuestionIdCookie() {
	return parseInt($.cookie("questionId") || -1);
}
function getGroupIdCookie() {
	return parseInt($.cookie("groupId") || -1);
}
function groupIdCookiePlusOne() {
	setGroupIdCookie(getGroupIdCookie() + 1);
}

function groupIdCookieMinusOne() {
	setGroupIdCookie(getGroupIdCookie());
}


function updateButtons(groupId, questionId) {
	
	if (groupId < questionGroups.length) {
		$("#nextButton").show();
	} else {
		$("#nextButton").hide();
	}
	
	
	if (groupId >= 0 || questionId > 0) {
		$("#prevButton").show();
	} else {
		$("#prevButton").hide();
	}
}

function getQuestionHeader(groupId, questionId) {
	var realGroupNum = -1;
	var realQuestionNum = -1;
	for (var i = 0; i < questionOrdering.length; i++) {
		if (questionOrdering[i].groupId == groupId) {
			realGroupNum = (i+1);
			for (var j = 0; j < questionOrdering[i].questions.length; j++) {
				if (questionId == questionOrdering[i].questions[j]) {
					realQuestionNum = (j+1);
					break;
				}
			}
			
			
			break;
		}
	}
	var resultString = "";
	if (realGroupNum >= 0 && realQuestionNum >= 0) {
		resultString = realGroupNum + "." + realQuestionNum;
	}
	return resultString;
//	(groupId + 1) + "." + (questionId + 1);
}



function displayQuestion(groupId, questionId) {
	var questionObj;
	if (groupId < 0 || questionId < 0) {
		questionObj = intro;
	} else if (groupId >= questionGroups.length) {
		questionObj = outro;
	} else {
		questionObj = questionGroups[groupId]["questions"][questionId];
	}
	var endpoint = null
	if (questionGroups[groupId]) {
		endpoint = questionGroups[groupId]["dataset"];
	}
	updateButtons(groupId, questionId);
	var question = $("<p></p>").html(questionObj.question);
	var title = "Exercise";
	if (questionObj.title) {
		title = questionObj.title;
	} else {
		title += " " + getQuestionHeader(groupId, questionId);
	}
	$("#question").html("").append("<h1>" + title + "</h1>").append(question);
	$("#answer").html("");
	if (questionObj.displayHook != null) {
		questionObj.displayHook();
	} 
	if (questionObj.iframeLink != null) {
		var iframeLink = questionObj.iframeLink;
		
		//append info
		
		if (questionGroups[groupId] && questionGroups[groupId]["dataset"]) {
			iframeLink += "&jsonSettings=" + encodeURIComponent('{"defaults": {"endpoint": "' + questionGroups[groupId]["dataset"] + '"}}');
		}
		iframeLink += "&uid=" + getUid() +  "&questionId=" + questionId + "&groupId=" + groupId;
		
		//append question id to url
		$("#yasguiIframe").attr("src", iframeLink).show();
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

function getArrayKeys(array) {
	var groupKeys = [];
	for (var i = 0; i < array.length; i++) {
		groupKeys.push(i);
	}
	return groupKeys;
}

function getQuestionOrdering() {
	var questionOrderString = $.cookie("questionOrder");
	var questionOrderObj = null;
	if (!questionOrderString) {
		questionOrderObj = generateQuestionOrdering();
		$.cookie("questionOrder", JSON.stringify(questionOrderObj), { expires: 100 });
	} else {
		questionOrderObj = jQuery.parseJSON(questionOrderString);
	}
	return questionOrderObj;
}
function generateQuestionOrdering() {
	var groupKeys = getArrayKeys(questionGroups);
	groupKeys = shuffle(groupKeys);
	
	var orderedArray = [];
	for (var i = 0; i < groupKeys.length; i++) {
		var groupObject = {};
		groupObject.groupId = groupKeys[i];
		
		
		var questionKeys = getArrayKeys(questionGroups[groupKeys[i]].questions);
		questionKeys = shuffle(questionKeys);
		while (questionGroups[groupKeys[i]].questions[questionKeys[0]].needPreviousQuestion) {
			questionKeys = shuffle(questionKeys);
		}
		groupObject.questions = questionKeys;
		orderedArray.push(groupObject);
	}
	return orderedArray;
}
var questionOrdering = [];

var intro = {
		title: "Welcome!",
		question: "We will guide you through a set of exercises. Each exercise shows a question, and SPARQL interface with which you should answer the question. " +
				"Having trouble understanding something? Let us know!",
	};

var outro = {
		title: "Finished!",
		question: "You have finished the exercises. Thank you",
	};


var questionGroups = [
  	{
  		"questions": [
  		    {
			question: "Browse a number of endpoints in the interface below, en describe which datasets are interesting for Assignment 1 and why",
			displayHook: function() {
				$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
			},
			answerGetVal: function() {
				return $("#answer").find("textarea").val();
			},
			iframeLink: yasguiMultiEndpointUrl
  		    }
	    ]
  	},
  	{
		"dataset": "http://dbpedia.org/sparql",
		"questions": [
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
				question: "What is the relation between the movie 'E.T. The Extra-Terestrial' and Tom Green?",
				displayHook: function() {
					$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
				},
				answerGetVal: function() {
					return $("#answer").find("textarea").val();
				},
				iframeLink: yasguiUrl
			},
			{
				question: "What are some important things you can tell us (based on this endpoint) about the concept 'religion'?",
				displayHook: function() {
					$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
				},
				answerGetVal: function() {
					return $("#answer").find("textarea").val();
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
				question: "Describe how you came to the previous answer, so that someone without SPARQL experience can reproduce the results",
				displayHook: function() {
					$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
				},
				answerGetVal: function() {
					return $("#answer").find("textarea").val();
				},
				needPreviousQuestion: true,
				iframeLink: yasguiUrl
			},
        ]
	},
	{
		"dataset": "http://data.linkedmdb.org/sparql",
		"questions": [
			{
				question: "Is the following statement correct? 'Rutger Hauer played in Buffy the Vampire Slayer'",
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
				question: "What is the relation between the the actors Peter O'Toole and Denholm Elliott?",
				displayHook: function() {
					$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
				},
				answerGetVal: function() {
					return $("#answer").find("textarea").val();
				},
				iframeLink: yasguiUrl
			},
			{
				question: "What can you tell us about the movie 'Agua'?",
				displayHook: function() {
					$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
				},
				answerGetVal: function() {
					return $("#answer").find("textarea").val();
				},
				iframeLink: yasguiUrl
			},
			{
				question: "Provide a list of -triples-, where you change information about the movie 'Costa!', and add a (madeup) description of the movie.",
				displayHook: function() {
					$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
				},
				answerGetVal: function() {
					return $("#answer").find("textarea").val();
				},
				iframeLink: yasguiUrl
			},
			{
				question: "Describe how you came to the previous answer, so that someone without SPARQL experience can reproduce the results",
				displayHook: function() {
					$("#answer").append("<h3>Answer</h3><textarea style='width: 100%; height: 200px;'></textarea>");
				},
				answerGetVal: function() {
					return $("#answer").find("textarea").val();
				},
				needPreviousQuestion: true,
				iframeLink: yasguiUrl
			},
        ]
	}
];

function showCurrentQuestion() {
	var questionId = getQuestionIdCookie();
	var groupId = getGroupIdCookie();
	displayQuestion(groupId, questionId);
}



function trackTask(buttonClicked) {
	var uid = getUid();
	var questionId = getQuestionIdCookie();
	var groupId = getGroupIdCookie();
	var sendObj = {
		"uid": uid,
		"questionId": questionId,
		"groupId": groupId,
		"time": new Date().getTime() ,
		"btn": buttonClicked
	};
	if (questionId >= 0 && groupId >= 0 && groupId < questionGroups.length && questionGroups[groupId]["questions"][questionId].answerGetVal) {
		sendObj["answer"] = questionGroups[groupId]["questions"][questionId].answerGetVal();
	}
	$.ajax(loggerUrl, {
	    data : JSON.stringify(sendObj),
	    contentType : 'application/json',
	    type : 'POST',
	});
}

function trackRandomOrder() {
	var uid = getUid();
	var sendObj = {
		"uid": uid,
		"time": new Date().getTime() ,
		"questionOrdering": questionOrdering
	};
	$.ajax(loggerUrl, {
	    data : JSON.stringify(sendObj),
	    contentType : 'application/json',
	    type : 'POST',
	});
}



function moveToNext() {
	var currentQuestionId = getQuestionIdCookie();
	var currentGroupId = getGroupIdCookie();
	
	if (currentQuestionId == -1 || currentGroupId == -1) {
		//start from beginning
		setGroupIdCookie(questionOrdering[0].groupId);
		setQuestionIdCookie(questionOrdering[0].questions[0]);
		return;
	}
	
	
	for (var i = 0; i < questionOrdering.length ; i++) {
		if (questionOrdering[i].groupId == currentGroupId) {
			//found group!
			for (var j = 0; j < questionOrdering[i].questions.length; j++) {
				if (questionOrdering[i].questions[j] == currentQuestionId) {
					//found question!
					if (j >= (questionOrdering[i].questions.length - 1 )) {
						//last question. move to next group
						if (questionOrdering[i+1]) {
							setGroupIdCookie(questionOrdering[i+1].groupId);
							setQuestionIdCookie(questionOrdering[i+1]['questions'][0]);
						} else {
							setGroupIdCookie(questionOrdering.length);//end of exercises!
						}
						
						return;
					} else {
						//stay in group. move one question up.
						setQuestionIdCookie(questionOrdering[i].questions[j+1]);
						return;
					}
					
					
				}
			}
			
		}
	}
}
function moveToPrevious() {
	var currentQuestionId = getQuestionIdCookie();
	var currentGroupId = getGroupIdCookie();
	if (currentGroupId >= questionOrdering.length) {
		setGroupIdCookie(questionOrdering[questionOrdering.length - 1].groupId);
		setQuestionIdCookie(questionOrdering[questionOrdering.length - 1].questions[questionOrdering[questionOrdering.length - 1].questions.length - 1]);
	} else {
		for (var i = questionOrdering.length - 1; i >= 0 ; i--) {
			for (var j =  questionOrdering[i].questions.length; j >= 0; j--) {
				if (currentGroupId == questionOrdering[i].groupId) {
					if (questionOrdering[i].questions[j] == currentQuestionId) {
						//this is our group!
						if (j > 0) {
							//we can still go back 1 in this group
							setQuestionIdCookie(questionOrdering[i]['questions'][j-1]);
							return;
						} else {
							//we need to go back one group
							if (i > 0) {
								//there is still room to go back
								setGroupIdCookie(questionOrdering[i-1].groupId);
								//set question id to last one in that group
								setQuestionIdCookie(questionOrdering[i-1].questions[questionOrdering[i-1].questions.length - 1]);
							} else {
								setGroupIdCookie(-1);
								setQuestionIdCookie(-1);
							}
							return;
						}
					}
				}
			}
		}
	}
	
	
}

$(document).ready(function() {
	$("#userIdHiddenDiv").html(getUid());
	$("#nextButton").on("click", function(){
		trackTask("next");
		moveToNext();
		showCurrentQuestion();
	});
	
	$("#prevButton").on("click", function(){
		trackTask("prev");
		moveToPrevious();
		showCurrentQuestion();
	});
	questionOrdering = getQuestionOrdering();
	trackTask("start");
	trackRandomOrder();
	showCurrentQuestion();
});


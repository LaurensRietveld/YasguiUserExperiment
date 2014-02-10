<?php
		header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
		header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
		header('Access-Control-Max-Age: 1000');
		header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');


$logMsg = file_get_contents('php://input');
echo $logMsg;
$decodedMsg = json_decode($logMsg, true);
var_export($decodedMsg);

$logString = time()." ".$logMsg."\n";
$logFile = $decodedMsg['uid'].".log";

var_export($logFile);
var_export($logString);

file_put_contents($logFile, $logString, FILE_APPEND);
<?php

$logMsg = file_get_contents('php://input');
echo $logMsg;
$decodedMsg = json_decode($logMsg, true);
var_export($decodedMsg);

$logString = time()." ".$logMsg."\n";
$logFile = $decodedMsg['uid'].".log";

var_export($logFile);
var_export($logString);

file_put_contents($logFile, $logString, FILE_APPEND);
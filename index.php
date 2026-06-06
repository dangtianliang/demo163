<?php
require("protected/models/db.php");//m
require("protected/templates/displayIndex.php");//v

if(isset($_REQUEST['pass2'])&&$_REQUEST['pass2']=="18710262500"||(isset($_COOKIE["pass2"])&&$_COOKIE["pass2"]=="18710262500")){
  //创建cookie
  setcookie("pass2", "18710262500", time()+60*60*24*3);
}else{
	login();
	exit;
}
if(isset($_REQUEST['pass'])&&$_REQUEST['pass']=="dangtianliang"){
  //创建cookie
  setcookie("pass", "dangtianliang", time()+60*60*24*3);
}
$id = isset($_REQUEST['id'])?($_REQUEST['id']):84;
displayIndex($id);
//显式关闭数据库
mysql_close($con);
?>
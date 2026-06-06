<?php
	$timer = time();
	$str .="CACHE MANIFEST\n";
	$str .="# version ".$timer."\n";
	$str .="CACHE:\n";
	$str .="mobile_myedit.php?id=84\n";
	$str .="mobile_myedit.php?id=162\n";
	$str .="mobile_myedit.php?id=291\n";
	$str .="mobile_myedit.php?id=213\n";
	$str .="css/bootstrap.css\n";
	$str .="css/font-awesome.css\n";
	$str .="css/chili.css\n";
	$str .="css/myediter.css\n";
	$str .="js/jquery.js\n";
	$str .="js/bootstrap.js\n";
	$str .="js/render.js\n";
	$str .="js/list.js\n";
	$str .="js/jquery.js\n";
	$str .="js/bootstrap.js\n";
	$str .="js/render.js\n";
	$str .="js/list.js\n";
	$fp=fopen("edit.manifest","w");
	fputs($fp,$str);
	fclose($fp);
?>
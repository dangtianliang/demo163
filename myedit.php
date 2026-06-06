<?php
require("/protected/models/db.php");//m
require("/protected/templates/displayIndex.php");//v
//ok.94007.com:8089/php/edit/myedit.php
// echo(getOnlyArticalDataByParentId(0));//取全部文章
$id = isset($_REQUEST['id'])?($_REQUEST['id']):84;
displayIndex($id);
//显式关闭数据库
mysql_close($con);
?>
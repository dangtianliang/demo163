<?php
require("../models/db.php");//m
//临时加密
$pass = $_COOKIE["pass"];
if(isset($pass)&&$pass=="dangtianliang"){
  //重置cookie时间
  setcookie("pass", "dangtianliang", time()+60*60*24*3);
}else{
  echo('{"done":false}');
  exit;
}
//取到action。根据actine做出各种反应！
$action = isset($_REQUEST['action'])?($_REQUEST['action']):"";
if(!empty($action)){
  switch($action){
    case "addArtical":
      addArtical($_REQUEST);
    break;
    case "setArticalById":
      setArticalById($_REQUEST);
    break;
    case "delArticalById":
      delArticalById($_REQUEST);
    break;
    case "refreshMobileVersion":
      refreshMobileVersion($_REQUEST);
    break;
  }
}else{
  echo("Warning! no actine");
}
// ajax添加一篇,返回成功与否即可.
function addArtical($request){
  //http://ok.94007.com:8089/php/edit/protected/controllers/action.php?content=1234r&action=addArtical&parentid=0
  $parentid = isset($request['parentid'])?mysql_escape_string($request['parentid']):0;
  $name = isset($request['name'])?mysql_escape_string($request['name']):"标题";//文章名称
  $keyword = isset($request['keyword'])?mysql_escape_string($request['keyword']):"关键词";//关键词
  $content = isset($request['content'])?mysql_escape_string($request['content']):"新代码";
  $type = isset($request['type'])?mysql_escape_string($request['type']):1;//默认为文章，0为group
  if(!empty($content)){
      $content = mysql_escape_string($content);
      $id = DB_AddArtical($parentid,$name,$keyword,$content,$type);
      echo('{"done":true,"data":{"id":"'.$id.'"}}');
  }
}
//根据id更新一条记录(并把原来的记录追加到缓存字段);
function setArticalById($request){
  //http://ok.94007.com:8089/php/edit/protected/controllers/action.php?content=update&action=setArticalById&id=84&detail=detail&name=name
  $id = isset($request['id'])?mysql_escape_string($request['id']):"";
  $content = isset($request['content'])?mysql_escape_string($request['content']):"";
  $name = isset($request['name'])?mysql_escape_string($request['name']):"标题";
  $detail = isset($request['detail'])?mysql_escape_string($request['detail']):"描述";
  $language = isset($request['language'])?mysql_escape_string($request['language']):"js";
  $result = DB_SetArticalById($id,$content,$name,$detail,$language);
  if($result){
     echo('{"done":true}');
   }else{
    echo('{"done":false}');
   }
}
//根据id更新一条记录(并把原来的记录追加到缓存字段);
function delArticalById($request){
  //http://ok.94007.com:8089/php/edit/protected/controllers/action.php?content=update&action=setArticalById&id=84&detail=detail&name=name
  $id = isset($request['id'])?mysql_escape_string($request['id']):"";
  $content = isset($request['content'])?mysql_escape_string($request['content']):"";
  $name = isset($request['name'])?mysql_escape_string($request['name']):"";
  $detail = isset($request['detail'])?mysql_escape_string($request['detail']):"";
  $result = DB_DelArticalById($id);
  if($result){
     echo('{"done":true}');
   }else{
    echo('{"done":false}');
   }
}
function refreshMobileVersion(){
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
  $fp=fopen("../../edit.manifest","w");
  fputs($fp,$str);
  fclose($fp);
  echo("ok");
}
?>
<?php
    //显式关闭数据库
    mysql_close($con);
?>
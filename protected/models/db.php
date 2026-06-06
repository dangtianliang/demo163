<?php
//链接打开数据库
// $con = mysql_connect("rds0xf4158a4a9c2no5d.mysql.rds.aliyuncs.com:3306","r1a5cic00u","Dang810412");
$con = mysql_connect("localhost","root","810411");
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }
// mysql_select_db("r1a5cic00u", $con);
mysql_select_db("my", $con);
mysql_query("set names utf8");
//获取所有的language
function getLanguage(){
    $result = mysql_query("SELECT * FROM demo WHERE parentid = 0 AND isdel <> 1 ORDER BY createtime ASC");
    //echo("SELECT * FROM demo Where id = '$id'");
    while($row = mysql_fetch_array($result))
      {
          $tpl .='  <li class="nav-li" languageid="'.htmlToStr($row["id"]).'"><a href="?id='.htmlToStr($row["id"]).'">'.htmlToStr($row["name"]).'</a></li>';
      }
      return $tpl;
}
//获得栏目所有group数据html
function getGroupDataByParentId($parentid){
    $result = mysql_query("SELECT * FROM demo WHERE parentid = '$parentid' AND type = 1 AND isdel <> 1  ORDER BY createtime ASC");
    //echo("SELECT * FROM demo Where id = '$id'");
    while($row = mysql_fetch_array($result))
      {
          $tpl .='  <div class="mysection" id="sec_'.htmlToStr($row["id"]).'">';
          $tpl .='    <h1 class="sec-tit clearfix"><span class="sec-tit-txt">'.htmlToStr($row["name"]).'</span><i class="icon icon-lock pull-right"></i></h1>';
          $tpl .='    <p class="sec-detail"><span class="sec-tit-txt">'.htmlToStr($row["detail"]).'</span></p>';
          $tpl .=     getOnlyArticalDataByParentId($row["id"]);
          $tpl .='  </div>';
      }
      return $tpl;
}
// //获得栏目所有数据html
// function getMultiDataByParentId($parentid){
//     $result = mysql_query("SELECT * FROM demo WHERE parentid = '$parentid' AND isdel <> 1 ORDER BY createtime ASC");
//     //echo("SELECT * FROM demo Where id = '$id'");
//     while($row = mysql_fetch_array($result))
//       {
//         //循环的时候根据type来分别处理
//         if($row["type"]==0){//0文件夹， 1文件，// 如果是group数据
//           $tpl .='  <div class="mysection" id="sec_'.htmlToStr($row["id"]).'">';
//           $tpl .='    <h1 class="sec-tit clearfix">'.htmlToStr($row["name"]).'<i class="icon icon-lock pull-right"></i></h1>';
//           $tpl .='    <p class="sec-detail">'.htmlToStr($row["detail"]).'</p>';
//           $tpl .=     getOnlyArticalDataByParentId($row["id"]);
//           $tpl .='  </div>';
//         }else{// 如果是游离数据
//           $tpl .= '    <div class="clipboard" id="clip_'.htmlToStr($row["id"]).'">';
//           $tpl .= '      <h2 class="clip-tit clearfix"><span class="clip-tit-txt">'.htmlToStr($row["name"]).'</span><i class="icon icon-lock"></i><i class="icon pull-right icon-unlock"></i><i class="icon icon-remove pull-right"></i></h2>';
//           $tpl .= '      <p class="clip-detail"><textarea class="clip-detail-txt">'.htmlToStr($row["detail"]).'</textarea></p>';
//           $tpl .= '      <span class="myediter" data-lang="js">'.htmlToStr($row["content"]).'</span>';
//           $tpl .= '    </div>';
//         }
//       }
//       return $tpl;
// }
//获得栏目所有数据html
function getOnlyArticalDataByParentId($parentid){
    $result = mysql_query("SELECT * FROM demo WHERE parentid = '$parentid' AND isdel <> 1 ORDER BY createtime ASC");
    //echo("SELECT * FROM demo Where id = '$id'");
    while($row = mysql_fetch_array($result))
      {
        $content=htmlToStr($row["content"]);
        if($row["ellipsis"]==1){
          if(preg_match("/^((.*?\n){10}).*/m",$content,$execStr)) {
            $content=$execStr[1];
          } else {
            $content=htmlToStr($row["content"]);
          }
        }else{
          $content=htmlToStr($row["content"]);
        }
        $tpl .= '    <div class="clipboard" id="clip_'.htmlToStr($row["id"]).'">';
        $tpl .= '      <h2 class="clip-tit clearfix"><span class="clip-tit-txt">'.htmlToStr($row["name"]).'</span>'.makeSelect($row["language"]).'<i class="icon icon-lock pull-right"></i><i class="icon pull-right icon-unlock"></i><i class="icon icon-remove pull-right"></i></h2>';
        $tpl .= '      <p class="clip-detail"><textarea class="clip-detail-txt" readonly  spellcheck="false">'.htmlToStr($row["detail"]).'</textarea></p>';
        $tpl .= '      <span class="myediter" data-lang="'.$row["language"].'">'.$content.'</span>';
        $tpl .= '    </div>';
      }
      return $tpl;
}
function makeSelect($str){
  $issql = ($str == "sql")?"selected":"";
  $iscss = ($str == "css")?"selected":"";
  $isjs = ($str == "js")?"selected":"";
  $ishtml = ($str == "html")?"selected":"";
  $isphp = ($str == "php")?"selected":"";

  $tpl .= '  <select class="language">';
  $tpl .= '    <option '.$issql.'>sql</option>';
  $tpl .= '    <option '.$iscss.'>css</option>';
  $tpl .= '    <option '.$isjs.'>js</option>';
  $tpl .= '    <option '.$ishtml.'>html</option>';
  $tpl .= '    <option '.$isphp.'>php</option>';
  $tpl .= '  </select>';

  return $tpl;
}
function htmlToStr($html){
      $html = preg_replace('/&/','&amp;',$html);
      $html = preg_replace('/</','&lt;',$html);
      $html = preg_replace('/>/','&gt;',$html);
      $html = preg_replace('/ /','&nbsp;',$html);
      $html = preg_replace('/\xC2\xA0/','&nbsp;',$html);
      // $html = preg_replace('/\'/','&#39;',$html);
      // $html = preg_replace('/"/','&quot;',$html);
      // $html = preg_replace('/\n/','<br>',$html);
      return $html;
}
//数据库控制函数==============================================================================
// 《===增增增增增增增增增增增增增增增增增增增增===》
function DB_AddArtical($parentid = 0,$name="",$keyword="js",$content="",$type="2",$detail="描述",$language="js"){//插入数据返回id
    $now = date("Y-m-d H:i:s",time());
    //echo("INSERT INTO demo (content,parentid,createtime) VALUES ('$content','$parentid','$now')");
    $sql = "INSERT INTO demo (parentid,name,keyword,content,type,detail,language,createtime) VALUES ('$parentid','$name','$keyword','$content','$type','$detail','$language','$now')";
    $success = mysql_query($sql);
    if($success){
        return mysql_insert_id();
    }
}
// 《===删删删删删删删删删删删删删删删删删删删删===》
function delById($id){//根据id
    $result = mysql_query("DELETE FROM demo WHERE id='$id'");
}
// 《===改改改改改改改改改改改改改改改改改改改改===》
function DB_DelArticalById($id){//根据id
    $sql = "UPDATE demo SET isdel = '1' WHERE id = '$id'";
    $result = mysql_query($sql);
    return $result;
}
function setContentById($id,$content){//根据id只改内容
    $result = mysql_query("UPDATE demo SET content = '$content' WHERE id = '$id'");
}
function DB_SetArticalById($id,$content,$name,$detail,$language){//根据id，更改多项
    $sql = "UPDATE demo SET content = '$content' , name = '$name' , detail = '$detail' , language = '$language' WHERE id = '$id'";
    $result = mysql_query($sql);
    return $result;
}
// 《===查查查查查查查查查查查查查查查查查查查查===》！
function getContentById($id){//根据id
    $result = mysql_query("SELECT * FROM demo WHERE id = '$id'");
    //echo("SELECT * FROM demo Where id = '$id'");
    while($row = mysql_fetch_array($result))
      {
          $result = $row['content'];
          $result = preg_replace('/&/','&amp;',$result);
          $result = preg_replace('/</','&lt;',$result);
          $result = preg_replace('/>/','&gt;',$result);
          $result = preg_replace('/ /','&nbsp;',$result);
          $result = preg_replace('/\xC2\xA0/','&nbsp;',$result);
          // $result = preg_replace('/\'/','&#39;',$result);
          // $result = preg_replace('/"/','&quot;',$result);
          // $result = preg_replace('/\n/','<br>',$result);
          return $result;
      }
}

function getArticalById($id){//根据id
    $result = mysql_query("SELECT * FROM demo WHERE id = '$id'");
    while($row = mysql_fetch_array($result))
      {
          return $row;
      }
}
?>
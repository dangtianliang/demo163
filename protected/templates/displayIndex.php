<?php
function displayIndex($id=84){
  $attr = getArticalById($id);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>起飞</title>
    <link rel="stylesheet" href="css/bootstrap.css">
    <link rel="stylesheet" href="css/font-awesome.css">
    <link rel="stylesheet" href="css/chili.css">
    <link rel="stylesheet" href="css/myediter.css">
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
    <link rel="icon" sizes="any" mask href="favicon.png">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <script>
    var GLOBLE = new Object;
    GLOBLE.rootId = <?php echo($id)?>;
    </script>
</head>
<body>
<header>
  <div class="container">
    <nav class="head-navbar" id="navbar">
      <div class="nav-control pull-right"><i class="icon icon-plus"></i><i class="icon icon-lock"></i><i class="icon icon-unlock"></i></div>
      <ul class="list-unstyled list-inline">
      <?php echo(getLanguage()); ?>
      </ul>
    </nav>
  </div>
</header>
<div class="top-details">
  <div class="container">
    <div class="row">
      <div class="col-xs-12">
        <h1><?php echo(htmlToStr($attr["name"]))?></h1>
        <p><?php echo(htmlToStr($attr["detail"]))?></p>
      </div>
    </div>
  </div>
</div>
<div class="container">
  <div class="row">
    <div class="col-sm-9 col-xs-12 col-lg-9" id="main_left">
      <!--div class="mysection" id="sec_101">
        <h1 class="sec-tit">一个分组，比如数组，正则，或者其他<i class="icon icon-lock"></i></h1>
        <p class="sec-detail">简介</p>
        <?php //echo(getOnlyArticalDataByParentId(0)); ?>
      </div-->
      <?php echo(getGroupDataByParentId($id)); ?>
      <div class="data-entry" id="data_entry">
        <form action="/protected/controllers/action.php" class="form form-horizontal" method="post">
        <input type="hidden" name="action" value="addArtical">
        <input type="hidden" name="parentid" value="<?php echo(0);?>">
          <div class="form-group">
            <label class="col-sm-3 control-label">名称</label>
            <div class="col-sm-9">
              <input type="text" id="data_name" class="form-control" name="name">
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-3 control-label">上代码</label>
            <div class="col-sm-9">
              <textarea id="data_content" class="form-control data-content" name="content"></textarea>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-3 control-label"></label>
            <div class="col-sm-9">
              <input type="submit" class="btn btn-block btn-primary ajax-form" value="提交">
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-3 col-lg-3 col-xs-12 aside-menu" id="main_right">
      <nav class="aside" id="aside">
        <ul class="list-unstyled aside-ul">
          <div class="clearfix text-right aside-control" id="aside_control"><i class="icon icon-plus"></i><i class="icon icon-lock"></i><i class="icon icon-unlock"></i></div>
        </ul>
      </nav>
    </div>
  </div>
    <!-- <div class="menu-ctrl" id="menu_ctrl"> -->
      <a id="toggle_menu" class="toggle-menu hidden-sm" href="javascript:;"><i class="icon icon-align-left"></i></a>
      <a id="quick_top" class="quick-top hidden-sm hide" href="javascript:;"><i class="icon icon-forward"></i></a>
      <a id="quick_down" class="quick-down hidden-sm hide" href="javascript:;"><i class="icon icon-backward"></i></a>
    <!-- </div> -->
</div>
<footer>
  <script src="js/jquery.js"></script>
  <script src="js/bootstrap.js"></script>
  <script src="js/render.js"></script>
  <script src="js/list.js"></script>
</footer>
</body>
</html>
<?php }
function displayMobileIndex($id=84){
  $attr = getArticalById($id);
?>
<!DOCTYPE html>
<html lang="en" manifest="edit.manifest">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <link rel="stylesheet" href="css/bootstrap.css">
    <link rel="stylesheet" href="css/font-awesome.css">
    <link rel="stylesheet" href="css/chili.css">
    <link rel="stylesheet" href="css/myediter.css">
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
    <link rel="icon" sizes="any" mask href="favicon.png">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <script>
    var GLOBLE = new Object;
    GLOBLE.rootId = <?php echo($id)?>;
    </script>
</head>
<body>
<header>
  <div class="container">
    <nav class="head-navbar" id="navbar">
      <div class="nav-control pull-right"><i class="icon icon-refresh"></i><i class="icon icon-plus"></i><i class="icon icon-lock"></i><i class="icon icon-unlock"></i></div>
      <ul class="list-unstyled list-inline">
      <?php echo(getLanguage()); ?>
      </ul>
    </nav>
  </div>
</header>
<div class="top-details">
  <div class="container">
    <div class="row">
      <div class="col-xs-12">
        <h1><?php echo(htmlToStr($attr["name"]))?></h1>
        <p><?php echo(htmlToStr($attr["detail"]))?></p>
      </div>
    </div>
  </div>
</div>
<div class="container">
  <div class="row">
    <div class="col-sm-9 col-xs-12 col-lg-9" id="main_left">
      <!--div class="mysection" id="sec_101">
        <h1 class="sec-tit">一个分组，比如数组，正则，或者其他<i class="icon icon-lock"></i></h1>
        <p class="sec-detail">简介</p>
        <?php //echo(getOnlyArticalDataByParentId(0)); ?>
      </div-->
      <?php echo(getGroupDataByParentId($id)); ?>
      <div class="data-entry" id="data_entry">
        <form action="/protected/controllers/action.php" class="form form-horizontal" method="post">
        <input type="hidden" name="action" value="addArtical">
        <input type="hidden" name="parentid" value="<?php echo(0);?>">
          <div class="form-group">
            <label class="col-sm-3 control-label">名称</label>
            <div class="col-sm-9">
              <input type="text" id="data_name" class="form-control" name="name">
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-3 control-label">上代码</label>
            <div class="col-sm-9">
              <textarea id="data_content" class="form-control data-content" name="content"></textarea>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-3 control-label"></label>
            <div class="col-sm-9">
              <input type="submit" class="btn btn-block btn-primary ajax-form" value="提交">
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-3 col-lg-3 col-xs-12 aside-menu" id="main_right">
      <nav class="aside" id="aside">
        <ul class="list-unstyled aside-ul">
          <div class="clearfix text-right aside-control" id="aside_control"><i class="icon icon-plus"></i><i class="icon icon-lock"></i><i class="icon icon-unlock"></i></div>
        </ul>
      </nav>
    </div>
    <a id="toggle_menu" class="toggle-menu hidden-sm" href="javascript:;"><i class="icon icon-align-left"></i></a>
    <a id="quick_top" class="quick-top hidden-sm hide" href="javascript:;"><i class="icon icon-forward"></i></a>
    <a id="quick_down" class="quick-down hidden-sm hide" href="javascript:;"><i class="icon icon-backward"></i></a>
  </div>
</div>
<footer>
  <script src="js/jquery.js"></script>
  <script src="js/bootstrap.js"></script>
  <script src="js/render.js"></script>
  <script src="js/list.js"></script>
</footer>
</body>
</html>
<?php
}
function login(){
 ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <link rel="stylesheet" href="css/bootstrap.css">
    <link rel="stylesheet" href="css/font-awesome.css">
    <link rel="stylesheet" href="css/chili.css">
    <link rel="stylesheet" href="css/myediter.css">
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
    <link rel="icon" sizes="any" mask href="favicon.png">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
</head>
<body>
    <form style="width:300px;margin:0 auto;padding:50px">
      <input placeholder="密码" type="password" name="pass2"><input type="submit" value="登陆">
    </form>
</body>
</html>
<?php
}
 ?>
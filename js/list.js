$(function(){
    init();
    function init(){
    //扩展一下jquery：input与span的切换
    $.fn.changeSpan = function(){
      $(this).each(function(){
        var thisClass = $(this).attr("class");
        var txt = $(this).val();
        $(this).after($("<span>").text(txt).addClass(thisClass)).remove();
      });
      return $(this);
    }
    $.fn.changeInput = function(){
      $(this).each(function(){
          var thisClass = $(this).attr("class");
          var txt = $(this).text();
          $(this).after($("<input>").val(txt).addClass(thisClass)).remove();
      });
      return $(this);
    }
    $.fn.textareaAutoH = function(){
      $(this).each(function(){
        if($(this).val()!=""){
          $(this).height(0).height($(this).get(0).scrollHeight-10);
        }else{
          if($(this).is("[readonly]")){
            $(this).height(0);
          }else{
            $(this).height("auto");
          }
        }
      });
      return $(this);
    }
      asideMaker();//生成侧边
      renderEdit($(".myediter"));
      $(".clip-detail-txt").each(function(){
        $(this).textareaAutoH();
      });
    }
    // 移动端切换menu
    $("#toggle_menu").click(function(){
      $("#main_right").toggleClass("hidden-xs").css("top",$(document).scrollTop());
    });
    //移动端导航菜单得点击事件
    $("#main_right").on("click","a",function(e){
        $("#main_right").addClass("hidden-xs");
    });
    // 快速移动
    var doch = $(document).height();
    $("#quick_top").click(function(){
      $dom = $(document);
      if($dom.scrollTop()<doch/10){
        $dom.scrollTop(0);
        $(this).css("top",0);
      }else{
        $dom.scrollTop($dom.scrollTop()-doch/10);
        $(this).css("top",($dom.scrollTop()-doch/10)*100/doch+"%");
      }
    });
    $("#quick_down").click(function(){
      $dom = $(document);
      if($dom.scrollTop()+doch/10<doch){
        $dom.scrollTop($dom.scrollTop()+doch/10);
        $(this).css("top",($dom.scrollTop()+doch/10)*100/doch+"%");
      }else{
        $dom.scrollTop(doch);
        $(this).css("top","100%");
      }
    });
    $("#main_left").on("keyup",".clip-detail-txt",function(){
      $(this).textareaAutoH();
    });
    //导航栏的锁定与解锁
    $("#navbar .icon-lock").click(function(){
      var $root = $("#navbar");
      $root.addClass("editable");
      $root.find(".nav-li").filter(function(index){//section 控制按钮
        return $("i",this).size()==0;
      }).append("<i class=\"icon icon-remove\"></i>");
    });
    $("#navbar .icon-unlock").click(function(){
      var $root = $("#navbar").removeClass("editable");
    });
    //侧边的锁定与解锁
    $("#aside_control .icon-lock").click(function(){
      var $root = $(this).closest("ul");
    	$root.addClass("editable");
      $root.find(".section-link").filter(function(index){//section 控制按钮
        return $("i",this).size()==0;
      }).append("<i class=\"icon icon-remove\"></i><i class=\"icon icon-plus\"></i>");
      $root.find(".clip-link").filter(function(index){//clip 控制按钮
        return $("i",this).size()==0;
      }).append("<i class=\"icon icon-remove\"></i>");
    });
    $("#aside_control .icon-unlock").click(function(){
    	$(this).closest("ul").removeClass("editable");
    });
    $(".ajax-form").click(function(){//异步插入新数据
      var $form = $(this).closest("form");
      var url = $form.attr("action");
      $.post(url,$form.serialize(),function(data){
        console.log("成功："+data.data.id);
        document.location.reload();
      },"json");
      return false;
    });
    //============ nav的控制 ===============
    //refresh
    $("#navbar .icon-refresh").click(function(){
      $.post("http://demo163.com/protected/controllers/action.php?action=refreshMobileVersion",function(data){
        if(data=="ok"){
          refreshCache();
          console.log("更新缓存");
        }
      });
    });
    //+号
    $("#navbar .icon-plus").click(function(){
      $("#navbar ul").append("<li class=\"nav-addli\"><input type=\"text\" class=\"lang-name\"><i class=\"icon icon-ok\"></i></li>");
    });
    $("#navbar").on("click",".icon-ok",function(){
      var name = $(this).siblings("input").val();
      //记录parentid和name
      //自身变身为列表
      //左侧对应位置添加假数据
      //发送后台ajax，parentid，name
      addArtical({
        type:0,
        parentid:0,
        name:name
      },function(data){
        if(data.done){
          console.log("添加成功");
        }
      });
    });
    //X号
    $("#navbar").on("click touchstart",".icon-remove",function(){
      if(!confirm("确定删除吗"))return;
      $root = $(this).closest(".nav-li");
      $id = $root.attr("languageid");
      $root.remove();
      //拿到id发送ajax
      $.post("http://demo163.com/protected/controllers/action.php?action=delArticalById",{id:$id},function(data){
        if(data.done){
          console.log("删除成功");
        }else{
          alert("删除失败");
        }
      },"json");
      //干掉最外层
    });
    //============ 组的控制 ============
    //锁定样式的按钮
    $("#main_left").on("click touchstart",".sec-tit .icon-lock",function(){
      //全部变成input，可以修改
      // $(this).closest(".clipboard").addClass("editable");
      $root = $(this).closest(".mysection");
      $root.find(".sec-tit-txt,.sec-detail-txt").changeInput();
    });
    //非锁定样式的按钮
    $("#main_left").on("click touchstart",".sec-tit .icon-unlock",function(){
      //修改自身class样式
      $(this).closest(".editable").removeClass("editable");
      $root = $(this).closest(".clipboard");
      //全是变为span或者变成不可修改，
      $root.find(".clip-tit-txt").changeSpan();
      $root.find(".clip-detail-txt").prop("readonly",true).textareaAutoH();
      //并发送ajax到服务器，回调console.log提示修改完毕！
      $id = $root.attr("id").replace("clip_","");
      $name = $root.find(".clip-tit-txt").text();
      $detail = $root.find(".clip-detail-txt").val();
      $content = $root.find(".editer-model").val();
      $language = $root.find(".language").val();
      // console.log($id+"--"+$name+"--"+$detail+"--"+$content);
      $.post("http://demo163.com/protected/controllers/action.php?action=setArticalById",{id:$id,name:$name,detail:$detail,content:$content,language:$language},function(data){
        if(data.done){
          console.log("保存成功");
        }else{
          alert("保存失败");
        }
      },"json");
    });
    //============ 文章的控制 ============
    //锁定样式的按钮
    $("#main_left").on("click touchstart",".clip-tit .icon-lock",function(){
      //全部变成input，可以修改
      $(this).closest(".clipboard").addClass("editable");
      $root = $(this).closest(".clipboard");
      $root.find(".clip-tit-txt").changeInput();
      $root.find(".clip-detail-txt").prop("readonly",false).textareaAutoH();
    });
    //非锁定样式的按钮
    $("#main_left").on("click touchstart",".clip-tit .icon-unlock",function(){
      //修改自身class样式
      $(this).closest(".editable").removeClass("editable");
      $root = $(this).closest(".clipboard");
      //全是变为span或者变成不可修改，
      $root.find(".clip-tit-txt").changeSpan();
      $root.find(".clip-detail-txt").prop("readonly",true).textareaAutoH();
      //并发送ajax到服务器，回调console.log提示修改完毕！
      $id = $root.attr("id").replace("clip_","");
      $name = $root.find(".clip-tit-txt").text();
      $detail = $root.find(".clip-detail-txt").val();
      $content = $root.find(".editer-model").val();
      $language = $root.find(".language").val();
      // console.log($id+"--"+$name+"--"+$detail+"--"+$content);
      $.post("http://demo163.com/protected/controllers/action.php?action=setArticalById", {
        id: $id,
        name: $name,
        detail: $detail,
        content: $content,
        language: $language
      }, function (data) {
        if (data.done) {
          console.log("保存成功");
        } else {
          console.log("保存失败");
        }
      }, "json");
    });
    //文章和组的删除按钮
    $("#main_left").on("click touchstart",".icon-remove",function(){
      if(!confirm("确定删除吗"))return;
      $root = $(this).closest(".clipboard");
      $id = $root.attr("id").replace("clip_","");
      $root.remove();
      //拿到id发送ajax
      $.post("http://demo163.com/protected/controllers/action.php?action=delArticalById",{id:$id},function(data){
        if(data.done){
          console.log("删除成功");
          asideMaker();
        }else{
          alert("删除失败");
        }
      },"json");
      //干掉最外层
    });
    //============右侧菜单的控制============
    //通用删除按钮
    $("#aside").on("click touchstart",".icon-remove",function(){
      if(!confirm("确定删除吗"))return;
      var $href = $(this).siblings("a").attr("href");
      var $id = $href.split("_")[1];
      //删除dom
      $(this).closest("li").remove();
      //删除左边实体
      $($href).remove();
      //发送删除请求，删除，数据库删除
      $.post("http://demo163.com/protected/controllers/action.php?action=delArticalById",{id:$id},function(data){
        if(data.done){
          console.log("删除成功");
        }else{
          alert("删除失败");
        }
      },"json");
    });
    //+号
    $("#aside").on("click touchstart",".aside-addclip .icon-ok",function(){
      var parentid = $(this).closest(".section-con").find(".section-link a").attr("href").replace("#sec_","");
      var name = $(this).siblings("input").val();
      var thisAsideLi = $(this).closest(".aside-addclip");
      var wrapId = $(this).closest(".section-con").find(".section-link a").attr("href").replace("#sec_","sec_");
      var thisContentWrap = $("#"+wrapId);
      //记录parentid和name
      //自身变身为列表
      //发送后台ajax，parentid，name
      addArtical({
        type:1,
        parentid:parentid,
        name:name
      },function(data){
        if(data.done){
          //生成新的侧边链接
          thisAsideLi.replaceWith('<li class=\"clip-link\"><a href=\"#clip_'+data.data.id+'\">'+name+'</a><i class=\"icon icon-remove\"></i></li>');
          //生成新的正文内容
          var content = "";
          content += '<div id=\"clip_'+data.data.id+'\" class=\"clipboard editable\">';
          content += '  <h2 class=\"clip-tit clearfix\">';
          content += '    <input class=\"clip-tit-txt\" value=\"'+name+'\">';
          content += '    <select class=\"language\">';
          content += '      <option>sql</option>';
          content += '      <option>css</option>';
          content += '      <option selected=\"\">js</option>';
          content += '      <option>html</option>';
          content += '      <option>php</option>';
          content += '    </select>';
          content += '    <i class=\"icon icon-lock pull-right\"></i>';
          content += '    <i class=\"icon pull-right icon-unlock\"></i>';
          content += '    <i class=\"icon icon-remove pull-right\"></i>';
          content += '  </h2>';
          content += '  <p class=\"clip-detail\">';
          content += '    <textarea class=\"clip-detail-txt\" spellcheck=\"false\"></textarea>';
          content += '  </p>';
          content += '  <span class=\"myediter\" data-lang=\"js\">新数据</span>';
          content += '</div>';
          $content = $(content);
          thisContentWrap.append(content);
          thisContentWrap.find(".clip-detail-txt").focus();
          renderEdit(thisContentWrap.find(".myediter"));
        }
      });
    });
    //右侧添加group,
    $("#aside").on("click",".aside-addmodule .icon-ok",function(){
      var parentid = GLOBLE.rootId;
      var name = $(this).siblings("input").val();
      var thisAsideLi = $(this).closest(".aside-addmodule");
      //记录parentid和name
      //自身变身为列表，
      //发送后台ajax，
      addArtical({
        type:1,
        parentid:parentid,
        name:name
      },function(data){
        if(data.done){
          //生成新的侧边链接
          thisAsideLi.replaceWith('<li class=\"section-con\"><div class=\"section-link\"><a href=\"#sec_'+data.data.id+'\">'+name+'</a><i class=\"icon icon-remove\"></i><i class=\"icon icon-plus\"></i></div><ul class=\"list-unstyled clip-con\"></ul></li>');
          //生成新的正文内容
          var content = "";
          content += '<div id=\"sec_'+data.data.id+'\" class=\"mysection\">';
          content += '  <h1 class=\"sec-tit clearfix\">'+name+'<i class=\"icon icon-lock pull-right\"></i></h1>';
          content += '  <p class=\"sec-detail\">描述</p>';
          content += '</div>';
          $("#data_entry").before(content);
        }
      });
    });
    //右侧展示添加新group的入口开关
    $("#aside").on("click",".aside-control .icon-plus",function(e){
      $(this).closest("ul").append("<li class=\"aside-addmodule\"><input type=\"text\" class=\"group-name\"><i class=\"icon icon-ok\"></i></li>");
    });
    //右侧展示添加新文章的入口开关
    $("#aside").on("click",".section-con .icon-plus",function(){
      var $dom = $("<li class=\"aside-addclip\"><input type=\"text\" class=\"arc-name\"><i class=\"icon icon-ok\"></i></li>").appendTo($(this).closest(".section-con").find(".clip-con"));
      $dom.find("input").keyup(function(event){
      if(event.keyCode == 13){
          //这里写你要执行的事件;
          $(this).siblings(".icon-ok").click();
        }
      }).focus();
    });
});
function asideMaker(){
  $("#aside .section-con").remove();
  var mysections= "";
  $("#main_left .mysection").each(function(){//1级
    var clipboards= "";
    $(this).find(".clipboard").each(function(){//2级
      clipboards+="<li class=\"clip-link\"><a href=\"#"+$(this).attr("id")+"\">"+$(this).find(".clip-tit-txt").text()+"</a></li>";
    });
    mysections +="<li class=\"section-con\"><div class=\"section-link\"><a href=\"#"+$(this).attr("id")+"\">"+$(this).find(".sec-tit").text()+"</a></div><ul class=\"list-unstyled clip-con\">"+clipboards+"</ul></li>";
  });
  $("#aside_control").after(mysections);
}
function addArtical(obj,fn){//异步插入新数据
  $.post("http://demo163.com/protected/controllers/action.php?action=addArtical",obj,function(data){
    fn(data);
  },"json");
}
//编辑器渲染函数
function renderEdit($dom){
  $dom.each(function(){
    var txt = $(this).text();
    var thislang = $(this).attr("data-lang");
    var tpl = "";
    tpl += "<div data-lang=\""+thislang+"\" class=\"myediter\">";
    tpl += "  <textarea spellcheck=\"false\" name=\"content\" class=\"editer-model\"></textarea>";
    tpl += "  <pre class=\"editer-view\"></pre>";
    tpl += "  <textarea spellcheck=\"false\" class=\"editer-mask\"></textarea>";
    tpl += "</div>";
    $tpl = $(tpl);
    $tpl.find(".editer-model").val(txt);
    $tpl.find(".editer-mask").val(txt);
    // console.log($(this).find(".editer-model").val());
    var $view = $tpl.find(".editer-view");
    var thislang = $tpl.attr("data-lang");
    var $model = $tpl.find(".editer-model");
    var $mask = $tpl.find(".editer-mask");
    $model.on("keyup keydown",function(){
      var val = $model.val().replace(/\t/g,"    ");
      $model.val(val);
      $mask.val(val);
      $view.html(brush(val,thislang));
      $model.scroll();
    });
    $mask.scroll(function(){
      $view.scrollTop($mask.scrollTop());
      $model.scrollTop($mask.scrollTop());
    });
    $mask.mouseup(function(){//google防抖！
      $model.focus();
      $model.get(0).setSelectionRange(this.selectionStart,this.selectionEnd);
      $model.blur();
      $model.focus();
      $model.get(0).setSelectionRange(this.selectionStart,this.selectionEnd);
    });
    $model.keyup();//默认触发一次渲染
    $(this).replaceWith($tpl);
  });
}
// 刷新离线数据
function refreshCache(){
  try {
    window.applicationCache.update();
    console.log("拉取离线数据完毕！");
  } catch (e) {
    console.log(e.name + ": " + e.message);
  }
}
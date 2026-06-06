$(function(){
  $(".ajax-form").click(function(){
    var $form = $(this).closest("form");
    var url = $form.attr("action");
    $.post(url,$form.serialize(),function(data){
      console.log("成功："+data.data.id);
      document.location.reload();
    },"json");
    return false;
  });
});
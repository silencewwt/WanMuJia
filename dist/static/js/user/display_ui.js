$(function(){$(".filter-more").click(function(){var e=$(this),t=e.prevAll(".filter-items");return t.toggleClass("expanded"),e.html(t.hasClass("expanded")?'收起 <span class="caret-up"></span>':'更多 <span class="caret"></span>'),e.trigger("blur"),!1}),$(".filter").delegate(".filter-item a","click",function(){return $(this).parent().toggleClass("active"),!1}),$(".sortbar .sort").delegate(".sort-index","click",function(){var e=$(this);return e.siblings().removeClass("active"),e.hasClass("active")&&"hot"!=e.attr("data-sort")&&e.children(".darr").toggleClass("reverse"),e.addClass("active"),!1})});
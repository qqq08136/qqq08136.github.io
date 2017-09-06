layui.config({
	base: './js/modules/'
}).use(['element', 'form', 'layer', 'jquery', 'm_bodyTab'], function() {
	var form = layui.form,
		layer = layui.layer,
		element = layui.element;
		$ = layui.jquery;
		
	var _objs = {
		doc:$(document),
		left_sidebar : $("#left_sidebar"),
		right_box : $("#right_box"),
		site_tree_mobile : $('.site-tree-mobile'),
		site_mobile_shade : $('.site-mobile-shade')
	}

	tab = layui.m_bodyTab({
		openTabNum: "50", //最大可打开窗口数量
		url: "json/navs.json" //获取菜单json地址
	});

	//渲染左侧菜单
	tab.render();
	
	// 收缩 菜单栏
	$("#closeLeftNav").on('click',function(){
		console.log(typeof _objs.doc.width())
		if(_objs.doc.width() >= 970){
			_objs.left_sidebar.toggleClass("lefr-sidebar-active");
			_objs.right_box.toggleClass("right-box-active");
		}
		
	});
	
	// 展开菜单栏
	_objs.site_tree_mobile.on('click', function(){
		$('body').addClass('site-mobile');
	});

	_objs.site_mobile_shade.on('click', function(){
		$('body').removeClass('site-mobile');
	});

	//锁屏
	function lockPage() {
		layer.open({
			title: false,
			type: 1,
			content: '	<div class="admin-header-lock" id="lock-box">' +
				'<div class="admin-header-lock-img"><img src="images/face.jpg"/></div>' +
				'<div class="admin-header-lock-name" id="lockUserName">请叫我马哥</div>' +
				'<div class="input_btn">' +
				'<input type="password" class="admin-header-lock-input layui-input" autocomplete="off" placeholder="请输入密码解锁.." name="lockPwd" id="lockPwd" />' +
				'<button class="layui-btn" id="unlock">解锁</button>' +
				'</div>' +
				'<p>请输入“123456”，否则不会解锁成功哦！！！</p>' +
				'</div>',
			closeBtn: 0,
			shade: 0.9
		})
		$(".admin-header-lock-input").focus();
	}
	$(".lockcms").on("click", function() {
		window.sessionStorage.setItem("lockcms", true);
		lockPage();
	})
	// 判断是否显示锁屏
	if(window.sessionStorage.getItem("lockcms") == "true") {
		lockPage();
	}
	
	// 解锁
	$("body").on("click", "#unlock", function() {
		if($(this).siblings(".admin-header-lock-input").val() == '') {
			layer.msg("请输入解锁密码！");
			$(this).siblings(".admin-header-lock-input").focus();
		} else {
			if($(this).siblings(".admin-header-lock-input").val() == "123456") {
				window.sessionStorage.setItem("lockcms", false);
				$(this).siblings(".admin-header-lock-input").val('');
				layer.closeAll("page");
			} else {
				layer.msg("密码错误，请重新输入！");
				$(this).siblings(".admin-header-lock-input").val('').focus();
			}
		}
	});
	$(document).on('keydown', function() {
		if(event.keyCode == 13) {
			$("#unlock").click();
		}
	});

	// 添加新窗口
	$("body").on("click", ".layui-nav .layui-nav-item a", function() {
		//如果不存在子级
		if($(this).siblings().length == 0) {
			addTab($(this));
			$('body').removeClass('site-mobile'); //移动端点击菜单关闭菜单层
		}
		$(this).parent("li").siblings().removeClass("layui-nav-itemed");
	})

	//刷新后还原打开的窗口
	if(window.sessionStorage.getItem("menu") != null) {
		menu = JSON.parse(window.sessionStorage.getItem("menu"));
		curmenu = window.sessionStorage.getItem("curmenu");
		var openTitle = '';
		for(var i = 0; i < menu.length; i++) {
			openTitle = '';
			if(menu[i].icon) {
				if(menu[i].icon.split("-")[0] == 'icon') {
					openTitle += '<i class="iconfont ' + menu[i].icon + '"></i>';
				} else {
					openTitle += '<i class="layui-icon">' + menu[i].icon + '</i>';
				}
			}
			openTitle += '<cite>' + menu[i].title + '</cite>';
			openTitle += '<i class="layui-icon layui-unselect layui-tab-close" data-id="' + menu[i].layId + '">&#x1006;</i>';
			element.tabAdd("bodyTab", {
				title: openTitle,
				content: "<iframe src='" + menu[i].href + "' data-id='" + menu[i].layId + "'></frame>",
				id: menu[i].layId
			})
			//定位到刷新前的窗口
			if(curmenu != "undefined") {
				if(curmenu == '' || curmenu == "null") { //定位到后台首页
					element.tabChange("bodyTab", '');
				} else if(JSON.parse(curmenu).title == menu[i].title) { //定位到刷新前的页面
					element.tabChange("bodyTab", menu[i].layId);
				}
			} else {
				element.tabChange("bodyTab", menu[menu.length - 1].layId);
			}
		}
		//渲染顶部窗口
		tab.tabMove();
	}

	//刷新当前
	$(".refresh").on("click", function() { //此处添加禁止连续点击刷新一是为了降低服务器压力，另外一个就是为了防止超快点击造成chrome本身的一些js文件的报错(不过貌似这个问题还是存在，不过概率小了很多)
		if($(this).hasClass("refreshThis")) {
			$(this).removeClass("refreshThis");
			$(".clildFrame .layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload(true);
		} else {
			layer.msg("您点击的速度超过了服务器的响应速度，还是等两秒再刷新吧！");
			setTimeout(function() {
				$(".refresh").addClass("refreshThis");
			}, 2000)
		}
	})

	//关闭其他
	$(".closePageOther").on("click", function() {
		if($("#top_tabs li").length > 2 && $("#top_tabs li.layui-this cite").text() != "后台首页") {
			var menu = JSON.parse(window.sessionStorage.getItem("menu"));
			$("#top_tabs li").each(function() {
				if($(this).attr("lay-id") != '' && !$(this).hasClass("layui-this")) {
					element.tabDelete("bodyTab", $(this).attr("lay-id")).init();
					//此处将当前窗口重新获取放入session，避免一个个删除来回循环造成的不必要工作量
					for(var i = 0; i < menu.length; i++) {
						if($("#top_tabs li.layui-this cite").text() == menu[i].title) {
							menu.splice(0, menu.length, menu[i]);
							window.sessionStorage.setItem("menu", JSON.stringify(menu));
						}
					}
				}
			})
		} else if($("#top_tabs li.layui-this cite").text() == "后台首页" && $("#top_tabs li").length > 1) {
			$("#top_tabs li").each(function() {
				if($(this).attr("lay-id") != '' && !$(this).hasClass("layui-this")) {
					element.tabDelete("bodyTab", $(this).attr("lay-id")).init();
					window.sessionStorage.removeItem("menu");
					menu = [];
					window.sessionStorage.removeItem("curmenu");
				}
			})
		} else {
			layer.msg("没有可以关闭的窗口了@_@");
		}
		//渲染顶部窗口
		tab.tabMove();
	})
	//关闭全部
	$(".closePageAll").on("click", function() {
		if($("#top_tabs li").length > 1) {
			$("#top_tabs li").each(function() {
				if($(this).attr("lay-id") != '') {
					element.tabDelete("bodyTab", $(this).attr("lay-id")).init();
					window.sessionStorage.removeItem("menu");
					menu = [];
					window.sessionStorage.removeItem("curmenu");
				}
			})
		} else {
			layer.msg("没有可以关闭的窗口了@_@");
		}
		//渲染顶部窗口
		tab.tabMove();
	})

});

//打开新窗口
function addTab(_this) {
	tab.tabAdd(_this);
}
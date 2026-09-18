var PC_SLIDE_MENU = {
	slideNavToggle: function() {
		var backdropToggle = '.slide-nav-backdrop';
		var pagewrapper = 'body';
		var navigationwrapper = '.navbar-header';
		var menuwidth = '100%';
		var slidewidth = '80%';
		var menuneg = '-100%';
		var slideneg = '-80%';

		if($('body').hasClass('slide-active')){
			$('.slide-nav-backdrop').remove();
		} else{
			$('#pc_slide_menu').before('<div class="slide-nav-backdrop"></div>');
		}

		var selected = $('body').hasClass('slide-active');
		// We want to toggle the state
		var isOpening = !selected;

		$('#pc_slide_menu').stop().animate({
			right: isOpening ? '0px' : menuneg
		});

		$('#navbar-height-col').stop().animate({
			right: isOpening ? '0px' : slideneg
		});
		$(pagewrapper).stop().animate({
			right: isOpening ? slidewidth : '0px'
		});

		$(navigationwrapper).stop().animate({
			right: isOpening ? slidewidth : '0px'
		});

		$('body').toggleClass('slide-active');
		$('#pc_slide_menu').toggleClass('slide-active');

		$('#page-content, .navbar, body, html, .navbar-header').toggleClass('slide-active');
	}
};

$(document).ready(function () {
	 $('#slide-nav.navbar-inverse').after($('<div class="inverse" id="navbar-height-col"></div>'));
	 $('#slide-nav.navbar-default').after($('<div id="navbar-height-col"></div>'));

	 $(".pc-navbar-toggle, .icon_type_menu a").on("click",  function (e) {
	 PC_SLIDE_MENU.slideNavToggle();
	 });

	 $("body").on("click", '.slide-nav-backdrop', function (e) {
	 PC_SLIDE_MENU.slideNavToggle();
	 });
});

var PC_SLIDE_MENU = {
	slideNavToggle: function() {
		var toggler = '.navbar-toggle';
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

		var selected = $('.navbar-main').hasClass('slide-active');

		$('#pc_slide_menu').stop().animate({
			right: selected ? menuneg : '0px'
		});

		$('#navbar-height-col').stop().animate({
			right: selected ? slideneg : '0px'
		});
		$(pagewrapper).stop().animate({
			right: selected ? '0px' : slidewidth
		});

		$(navigationwrapper).stop().animate({
			right: selected ? '0px' : slidewidth
		});

		$(this).toggleClass('slide-active', !selected);
		$('#pc_slide_menu').toggleClass('slide-active');

		$('#page-content, .navbar, body, html, .navbar-header').toggleClass('slide-active');
	}
};

$(document).ready(function () {
	 $('#slide-nav.navbar-inverse').after($('<div class="inverse" id="navbar-height-col"></div>'));
	 $('#slide-nav.navbar-default').after($('<div id="navbar-height-col"></div>'));

	 $("#slide-nav-btn").on("click",  function (e) {
	 PC_SLIDE_MENU.slideNavToggle.call(this);
	 });

	 $("body").on("click", '.slide-nav-backdrop', function (e) {
	 PC_SLIDE_MENU.slideNavToggle.call(this);
	 });
});

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('.page-scroll a').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();

        //document.getElementById("page-top").style.overflowY = "visible";
    });
});

$(window).on('beforeunload', function() {
    $(window).scrollTop(-1);
});
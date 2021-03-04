$(function() {//作用与window.onload=fuction(){}相同
    animateText();
});

$('.congrats').click(function() {//jquery 单击事件绑定
    // reset();
    animateText();
});

function animateText() {
    TweenMax.from($('h1'), 0.8, {//h1在0.8秒中完成以下动效
        scale: 0.4,
        opacity: 0,
        rotation: 15,
        ease: Back.easeOut.config(4),
    });
}

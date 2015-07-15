/*!
    Cox CSS

    @package cox.style
    @author cox.ascript
*/
cox.css = cox.css || function(css) {

    var head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.setAttribute('type', 'text/css');

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);

};
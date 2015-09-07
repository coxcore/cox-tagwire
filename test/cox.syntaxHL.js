/*!
	SyntaxHL Prototype - coxcore.com

    @package cox.syntaxHL
	@author cox.ascript
*/
cox.syntaxHL = function(html) {
    var tag = html.replace(/&(lt|gt);/gi, '&amp;$1;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/\n/g, '<br />');

    tag = tag.replace(/(&lt;!--(?!\s*?\[)[\s\S]*?--&gt;|&lt;!(?:(?!--)|--\s*?\[)[\s\S]*?&gt;|(?:[^:\\]|^)\/\/[^\n]*|\/\*[\s\S]*?\*\/)/gi, function(node, temp) {
            temp = temp.replace(/&lt;/g, '&[lt];').
                    replace(/&gt;/g, '&[gt];');
            return '<span class="c-temp">' + temp + '</span>';
        }).
        replace(/(&lt;script[\s\S]*?&gt;)([\s\S]*?)(&lt;\/script&gt;)/gi, function(node, st, script, et) {
            script = script.replace(/&lt;/g, '&[lt];').
                    replace(/&gt;/g, '&[gt];');
            return st + '<span class="c-script">' + script + '</span>' + et;
        }).
        replace(/(?!&lt;[!?%\/\s]|&lt;[\S]+&gt;)&lt;([^\s]+)([\s\S]*?)&gt;/g, function(node, tag, value) {
            value = value.replace(/([^\s]*?)(\=)("|'|)(.*?)\3/g, '<span class="c-param">$1</span>$2$3<span class="c-value">$4</span>$3');
            return '&lt;<span class="c-tag">' + tag + '</span>' + value + '&gt;';
        }).
        replace(/\r\n/g, '\n').
        replace(/(&lt;\/)([\s\S]*?)(&gt;)/g, '$1<span class="c-tag">$2</span>$3').
        replace(/&lt;([^!?%\/\s]+)&gt;/g, '&lt;<span class="c-tag">$1</span>&gt;').
        replace(/&\[lt\];/g, '&lt;').
        replace(/&\[gt\];/g, '&gt;');

    return tag;
};
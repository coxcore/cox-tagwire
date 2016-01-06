/*!
    Test TagWire 1.0.3 - coxcore.com

    @author cox.ascript
*/
window.testResult = {
    errors: []
};

window.testUtils = {

    checkAttribute: function(name, $target, data, message) {

        var regWrap = /radio|checkbox/

        TagWire.oeach(data, function(val, attr) {

            var type = $target.attr('type'),
                attrValue;
            

            if (typeof val === 'boolean') {
                attrValue = $target.prop(attr);
            } else if ( attr === 'value' ) {
                attrValue = $target[0].value;
            } else {
                attrValue = TagWire.plugin('jQuery') && /^data-/.test(attr) ?
                    $target.data(attr.replace(/^data-/, '')):
                    $target.attr(attr);
            }

            if (attrValue !== val) {
                if (message === undefined) {
                    message = [
                        '<strong>',
                        $target[0].nodeName,
                        '</strong>의 <strong>',
                        attr,
                        '</strong> 속성값이 <strong>',
                        String(attrValue),
                        '</strong> 입니다.<br />&gt;&gt;&gt; <strong>',
                        String(val),
                        '</strong>'
                    ].join('');
                }

                testResult.errors.push('[' + name + '] : ' + message);

                if (regWrap.test(type)) {
                    $target.wrap($('<div></div>', { 'class': 'errorElement' }));
                } else {
                    $target.addClass('errorElement');
                }

            }

        });

    },

    checkText: function(name, $target, data, message) {

        var val = $target.html().toLowerCase().
            replace(/&lt;/g, '<').
            replace(/&gt;/g, '>').
            replace(/&amp;/g, '&').
            replace(/<br[^>]*>/gi, '').
            replace(/\n/g, '');
        data = data.toLowerCase().
            replace(/<br[^>]*>/gi, '').
            replace(/\n/g, '');

        if (val !== data) {
            if (message === undefined) {
                message = [
                    '<strong>',
                    $target[0].nodeName,
                    '</strong>의 ',
                    '텍스트 값이 <strong>',
                    val,
                    '</strong> 입니다.<br />&gt;&gt;&gt; <strong>',
                    data,
                    '</strong>'
                ].join('');
            }

            testResult.errors.push('[' + name + '] : ' + message);
            $target.addClass('errorElement');
        }

    },

    checkHtml: function(name, $target, data, message) {

        var val = $target.html().toLowerCase().
            replace(/&lt;/g, '<').
            replace(/&gt;/g, '>').
            replace(/&amp;/g, '&').
            replace(/<br[^>]*>/gi, '').
            //replace(/<[^>]*$/, '').
            replace(/\n|\r/g, '');
        data = data.toLowerCase().
            replace(/<br[^>]*>/gi, '').
            //replace(/<[^>]*$/, '').
            replace(/\n|\r/g, '');

        if (val !== data) {
            if (message === undefined) {
                message = [
                    '<strong>',
                    $target[0].nodeName,
                    '</strong>의 ',
                    'html 값이 <strong>',
                    val,
                    '</strong> 입니다.<br />&gt;&gt;&gt; <strong>',
                    data,
                    '</strong>'
                ].join('');
            }

            testResult.errors.push('[' + name + '] : ' + message);
            $target.addClass('errorElement');
        }

    },

    checkShow: function(name, $target, data, message) {

        var val = $target.css('display') !== 'none';
        
        if (val !== data) {
            if (message === undefined) {
                message = [
                    '<strong>',
                    $target[0].nodeName,
                    '</strong>의 ',
                    'display 값이 <strong>',
                    val,
                    '</strong> 입니다.<br />&gt;&gt;&gt; <strong>',
                    data,
                    '</strong>'
                ].join('');
            }

            testResult.errors.push('[' + name + '] : ' + message);
            $target.addClass('errorElement');
        }

    },

    checkClass: function(name, $target, data, message) {

        var val,
            check;

        for (check in data) {

            val = $target.hasClass(check);

            if (val !== data[check]) {
                if (message === undefined) {
                    message = [
                        '<strong>',
                        $target[0].nodeName,
                        '</strong> 태그의 hasClass("<strong>',
                        check,
                        '</strong>") 값이 <strong>',
                        val,
                        '</strong> 입니다.<br />&gt;&gt;&gt; <strong>',
                        data[check],
                        '</strong>'
                    ].join('');
                }

                testResult.errors.push('[' + name + '] : ' + message);
                $target.addClass('errorElement');
            }

        }

    }

};

window.testData = {

    "_variable-attribute": {

        test: function(section) {

            var options = section.options;
            var $child = $(options.tag).children();
            var dt = json.package;
            var arr = [
                { title : dt.project, href : dt.website },
                { custom: undefined },
                { custom: dt.project },
                { href: dt.website, title: dt.website, custom: dt.website },
                { 'data-website': dt.website },
                { 'data-homepage': dt.website },
                { value: dt.project },
                { value: dt.project },
                { checked: true },
                { checked: true }
            ];

            TagWire.each(arr, function(o, i) {
                testUtils.checkAttribute(options.titleValue, $child.eq(i), o);
            });
        }

    },


    "_variable-text": {

        test: function(section) {

            var options = section.options;
            var $pre = $(options.tag);
            var dt = json.package;
            var arr = [
                'description',
                'spacialChar',
                'htmlStr',
                'project'
            ];

            TagWire.each(arr, function(s, i) {
                var $tar = $pre.find('._' + s + '-text');
                var val = String(dt[s]);
                testUtils.checkText(options.titleValue, $tar, val);
            });

        }

    },


    "_variable-html": {

        test: function(section) {
            var options = section.options;
            var $pre = $(options.tag);
            var dt = json.package;
            var arr = [
                'htmlStr',
                'spacialChar'
            ];

            TagWire.each(arr, function(s, i) {
                var $tar = $pre.find('._' + s + '-html');
                var val = String(dt[s]);
                testUtils.checkHtml(options.titleValue, $tar, val);
            });
        }

    },


    "_variable-attr": {

        test: function(section) {

            var options = section.options;
            var $child = $(options.tag).children();
            var dt = json.package;
            var arr = [
                { id : dt.group },
                { title : dt.group + ' ' + dt.project }
            ];

            TagWire.each(arr, function(o, i) {
                testUtils.checkAttribute(options.titleValue, $child.eq(i), o);
            });
        }

    },


    "_variable-replace": {

        test: function(section) {
            var options = section.options;
            var $child = $(options.tag).children();
            var dt = json.package;
            var str = [
                'group 값 \'' + dt.group + '\' 출력 <span>#group#</span> 자식 엘리먼트는 미적용',
                'group 값 \'' + dt.group + '\' 출력 <span>' + dt.group + '</span> 자식 엘리먼트도 적용'
            ];

            TagWire.each(str, function(s, i) {
                testUtils.checkHtml(options.titleValue, $child.eq(i), s);
            });
        }

    },


    "_variable-show": {

        test: function(section) {
            var options = section.options;
            var $child = $(options.tag).children();
            var dt = json.package;

            TagWire.each($child, function(el, i) {
                var $tar = $(el);
                var val = $tar.attr('class').replace(/^.*_([^\-]+)-show.*$/, '$1');
                testUtils.checkShow(options.titleValue, $tar, TagWire.checkBoolean(dt[val]));
            });
        }

    },


    "_variable-class": {

        test: function(section) {
            var options = section.options;
            var $child = $('[class*="-setClass"]', options.tag);
            var dt = json.package;
            var o;

            TagWire.each($child, function(el, i) {
                var $tar = $(el);
                var val = $tar.attr('class').replace(/^.*_([^\-]+)-setClass.*$/, '$1');
                
                o = {};
                o[val] = TagWire.checkBoolean(dt[val]);
                testUtils.checkClass(options.titleValue, $tar, o);
            });

            $child = $('[class*="-addClass"]', options.tag);
            o = {};
            o[dt.project] = true;
            testUtils.checkClass(options.titleValue, $child, o);

            $child = $('[class*="-removeClass"]', options.tag);
            o[dt.project] = false;
            testUtils.checkClass(options.titleValue, $child, o);
        }

    }

};
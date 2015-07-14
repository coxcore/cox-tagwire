/*!
    TagWire jQuery Plugin - coxcore.com

    @package jquery.TagWire
    @author cox.ascript
*/
(function($, TagWire) {

    if (!$ || !TagWire) {
        return;
    }


    // override tagwire tail
    TagWire.setTail('data', function(t, v, c) {
        $(t).data(c, v);
    });


    // tagwire plugin
    $.fn.tagwire = function(v, o) {
        TagWire.render(this, v, o);
        return this;
    };


    // extra plugins
    addPlugin('render', $.fn.tagwire);

    addPlugin('callTail', function(fn, v, c) {
        TagWire.callTail(this, fn, v, c);
        return this;
    });

    addPlugin('initTemplate', function() {
        TagWire.initTemplate(this);
        return this;
    });

    addPlugin('copyNode', function() {
        return $(TagWire.cloneNode(this));
    });

    addPlugin('loadAndRender', function(u, o) {
        var $this = this,
            ax,
            fn,
            efn;

        ax = {
            dataType : 'json',
            success : function(v) {
                if (typeof fn === 'function') {
                    fn(v);
                }

                TagWire.render($this, v, o);
            },
            error : function(e) {
                if (typeof efn === 'function') {
                    efn(e);
                }

                TagWire.error(
                    '[TagWire:loadAndRender]  JSON Parse Error : "' + ax.url + '"\n\n',
                    e.responseText
                );
            }
        };

        if (typeof u === 'string') {
            ax.url = u;
        } else {
            fn = u.success;
            efn = u.error;
            ax = $.extend({}, u, ax);
        }

        $.ajax(ax);

        return this;
    });


    function addPlugin(name, fnc) {
        var jfn = $.fn;

        if (jfn[name] === undefined) {
            jfn[name] = fnc;
        }
    }

})(window.jQuery, window.TagWire);
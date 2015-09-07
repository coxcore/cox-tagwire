/*!
    Test TagWire 1.0.3 - coxcore.com

    @author cox.ascript
*/
(function(TagWire, testData) {

    var container = document.getElementById('testcode');

    var regLt = /</g,
        regGt = />/g,
        regClb = /@@$/gm,
        regLb = /\n/g,
        regCmt = /^\s*\/\*\s*|\s*\*\/\s*$/g,
        regTrim = /^\s*|\s*$/g;


    // set reference
    TagWire.each(container.children, function(section) {

        var options = {};

        section.options = options;

        TagWire.each(section.children, function(element) {
            var type = element.getAttribute('data-ref');
            if (type) {
                options[type] = element;
            }
        });

        if (options.title) {
            options.titleValue = options.title.innerHTML;
        }

    });


    TagWire.tail.showTag = function(target, value, name) {

        var isReady = name === 'render-ready';
        var div = isReady ? 'before' : 'after';

        TagWire.each(target.children, function(section) {

            var options = section.options,
                sectionData,
                fnc;

            options[div].innerHTML = cox.syntaxHL(options.tag.innerHTML.replace(regTrim, ''));

            if (!isReady && header) {
                sectionData = testData[options.title.innerHTML];
                fnc = sectionData.test;
                if (typeof fnc === 'function') {
                    fnc(section);
                }
            }

        });

    };

})(window.TagWire, window.testData);
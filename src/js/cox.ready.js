/*!
    Cox ready - coxcore.com

    @package cox.ready
    @author cox.ascript
*/
cox.ready = cox.ready || function(fnc) {

    var eventType,
        listener;

    if (typeof fnc !== 'function') {
        return;
    }

    eventType = 'readystatechange';

    if (document.readyState === 'complete') {
        fnc();
        return;
    }
    
    if (document.addEventListener) {
        listener = function() {
            document.removeEventListener(eventType, listener, false);
            fnc();
        };

        document.addEventListener(eventType, listener, false);
    } else if (document.attachEvent) {
        eventType = 'on' + eventType;

        listener = function() {
            document.detachEvent(eventType, listener);
            fnc();
        };

        document.attachEvent(eventType, listener);
    }

};
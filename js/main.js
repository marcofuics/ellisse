(function(root, MathJax, JXG) {

    MathJax.Hub.Config({
        // ***** Estensioni in TeX-AMS_HTML-full ******
        /*extensions: [
            "tex2jax.js","MathEvents.js","MathZoom.js","MathMenu.js","toMathML.js","TeX/noErrors.js","TeX/noUndefined.js",
            "TeX/AMSmath.js","TeX/AMSsymbols.js","fast-preview.js","AssistiveMML.js","[a11y]/accessibility-menu.js"],
        jax: ["input/TeX","output/HTML-CSS","output/PreviewHTML"],*/

        showMathMenu : false,
        "HTML-CSS": {
            //http://docs.mathjax.org/en/latest/options/output-processors/HTML-CSS.html
            scale: 100,
            minScaleAdjust: 60,
            availableFonts: ['TeX'],
            preferredFont: 'TeX'
        },
        tex2jax: {
            inlineMath: [["$","$"],["\\(","\\)"]],
            displayMath: [ ['$$','$$'], ['\[','\]'] ],
            preview: "none"
        },
        "fast-preview": {
            //disabled: true
        }
    });
    MathJax.Hub.processSectionDelay = 0;

    // configurazione per fare la il segnetto diagonale sopra i numeri (quando bisogna semplificarli)
    MathJax.Hub.Register.StartupHook("TeX Jax Ready",function () {
        var TEX = MathJax.InputJax.TeX;
        var MML = MathJax.ElementJax.mml;
        TEX.Definitions.macros.cancel  = ["myCancel",MML.NOTATION.UPDIAGONALSTRIKE];
        TEX.Definitions.macros.bcancel = ["myCancel",MML.NOTATION.DOWNDIAGONALSTRIKE];
        TEX.Parse.Augment({
            myCancel: function (name,notation) {
                var mml = this.ParseArg(name);
                this.Push(MML.menclose(mml).With({notation:notation}));
            }
        });


    });

    JXG.Options.text.useMathJax = true;
    JXG.Options.elements.highlightStrokeColor = "#000000";

    var freeBoardBase = JXG.JSXGraph.freeBoard;
    JXG.JSXGraph.freeBoard = function(board) {
        try {
            freeBoardBase(board);
        } catch (e) {
            //console.warn(e.message);
        }
    };


    root.getJSXBoard = function(options) {
        var newId = "board-" + (Math.round(Math.random() * 100000));
        var box = $('script').last().parent();
        box.attr('id', newId).wrap('<div class="grafico"></div>');
        return JXG.JSXGraph.initBoard(newId, options);
    };


})(window, MathJax, JXG);

(function(root, $) {


    $.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    var $window = $(root);

    function minHeightCopy(sources, destination) {
        destination.css('min-height', 'auto');
        var maxH = Math.max.apply(null, sources.map(function (){
            return $(this).outerHeight();
        }).get());
        destination.css('min-height', maxH);
    }

    $.minHeightCopy = function(sources, destination, onresize) {

        minHeightCopy(sources, destination);

        if (onresize) {
            $window.on('resize orientationchange', $.debounce(function () { minHeightCopy(sources, destination)}, 300));
        }
    }

} (window, jQuery));

(function(root, $) {

    var $window = $(root),
        $document = $(document),
        $documentWrapper = $('body, html');

    var currentTab = null;

    /*$(function() {
        var hash = window.location.hash;
        $('a.nav-link').click(function(e) {
            e.preventDefault();
            hash = $(this).attr("href");
            window.location = hash;
        });
    });*/

    $window.on( 'hashchange', function( e ) {
        //$('#mt-header').scrollTo();

        var hashsplit = window.location.hash.split(',');
        var tabHash = hashsplit[0];
        var cardHash = hashsplit[1];


        var allPanes = $('.tab-pane'),
            allNavs = $('.nav-tabs .nav-link'),
            nextPane = allPanes.filter(tabHash),
            newtNav = allNavs.filter('[href="' + tabHash + '"]');

        if (!nextPane.hasClass('tab-pane')) {
            window.location.hash = allPanes.first().attr('id');
            return;
        }

        currentTab = tabHash;

        $('.collapse').removeClass('show');
        $('.card-header').removeClass('showing');

        allPanes.removeClass('active');
        allNavs.removeClass('active');
        newtNav.addClass('active');
        nextPane.addClass('active');

        setTimeout(function() {$(window).scrollTop(0); $documentWrapper.scrollTop(0)}, 100);
    });

    $document.on('click', '.card-header', function() {
        var sibling = $(this).siblings('.collapse');
        $('html, body').stop();

        $(this).toggleClass('showing', !sibling.hasClass('show'));
        sibling.collapse('toggle');
    });

    $document.on('shown.bs.collapse', '.collapse', function () {
        $(this).parent().scrollTo();
    });


    $document.on('click', '.traccia-next', function(e) {
        var next = $(this).nextUntil('img').last().next();
        $(this).toggleClass('active');
        next.slideToggle('animated');
    });


    $.fn.scrollTo = function (  ) {
        var offset = $window.height() / 6;
        var $body = $('body');

        var distance = (this.offset().top - $documentWrapper.scrollTop()) - offset;

        if (
            distance  < 0
            || $body[0].offsetHeight + 40 < $window.height()) {
            return;
        }

        var speed = Math.min(900, Math.max(300, (distance  * 1.5)));
        var where = Math.min( this.offset().top - offset, $document.height() - $window.height() );

        if (navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
            $body.stop().animate({ scrollTop: where }, speed);
        } else {
            $documentWrapper.stop().animate({ scrollTop: where }, speed);
        }

        //$('body').animate( {scrollTop: Math.min( this.offset().top - offset, $document.height() - $window.height() ) }, speed);

        return this;
    };

    $.fn.exercise = function() {
        if (this.length === 0) { return this; }
        if (this.length > 1) { this.each(function () { $(this).exercise(); }); return this; }

        var self = $(this);
        self.on('click', 'btn-verifica', function() {
           self.trigger('verify');
        });
    };

    $.fn.dropdownExercise = function() {

        if (this.length === 0) { return this; }
        if (this.length > 1) { this.each(function () { $(this).dropdownExercise(); }); return this; }

        var dd = $(this).addClass('dropdown-exercise'),
            btn = $("<button><span class='dots'></span></button>")
                .addClass('btn btn-outline-dark dropdown-toggle es-dropdown')
                .attr('data-toggle', 'dropdown'),
            menuItems = dd.find('> div'),
            verifyBtn = dd.closest('.exercise').find('.btn-verifica');

        dd.wrapInner('<div class="dropdown-menu"></div>');
        dd.prepend(btn);

        menuItems.each(function () {
            if ($(this).find('.mfrac').length > 0) {
                dd.addClass('fract');
                return false;
            }
        });

        var currentValue = -1;
        var correctValue = $(this).data('dropdown-exercise') - 1;

        menuItems.on('click', function() {
            var self = $(this);
            if (currentValue !== self.index()) {
                btn.html(self.html()).removeClass('correct wrong');
                currentValue = self.index();
            }
        });

        verifyBtn.on('click', function() {
            if (correctValue === currentValue) {
                btn.addClass('correct')
            } else {
                btn.addClass('wrong')
            }
        });

        btn.dropdown();
    };

    var radioExerciseCounter = 0;
    $.fn.radioExercise = function() {

        if (this.length === 0) { return this; }
        if (this.length > 1) { this.each(function () { $(this).radioExercise(); }); return this; }

        var parent = $(this),
            granparent = parent.parent(),
            children = parent.find('> *'),
            verifyBtn = parent.closest('.exercise').find('.btn-verifica');

        parent.addClass('radio-exercise');

        var currentValue = -1;
        var correctValue = parent.data('radio-exercise') - 1;

        var childCounter = 0;
        children.each(function() {

            var child = $(this);
            var id = radioExerciseCounter + '-' + childCounter++;
            var input = $('<input type="radio">')
                .attr('name', 'radio-' + radioExerciseCounter)
                .attr('id', 'radio-item-' + id);
            var label = $('<label></label>').attr('for', 'radio-item-' + id);

            child.addClass('radio-btn')
                .wrapInner(label)
                .prepend(input);

            input.on('change', function() {
                currentValue = child.index();
                children.removeClass('correct wrong incomplete');
                granparent.removeClass('correct wrong incomplete');
            });
        });
        radioExerciseCounter++;

        verifyBtn.on('click', function() {
            if (currentValue === -1) {
                children.addClass('wrong');
                granparent.addClass('wrong');
            } else if (correctValue === currentValue) {
                children.eq(currentValue).addClass('correct');
                granparent.addClass('correct');
            } else {
                children.eq(currentValue).addClass('wrong');
                granparent.addClass('wrong');
            }
        });
    };

    $.fn.disableSelection = function() {
        this.each(function() {
            this.onselectstart = function() {
                return false;
            };
            this.unselectable = "on";
            $(this).css('-moz-user-select', 'none');
            $(this).css('-webkit-user-select', 'none');
        });
        return this;
    };

    function shuffleChildren(parent, children) {

        var elems = children.toArray().sort(function() { return (Math.round(Math.random())-0.5); });

        //region Controllo che shuffle non crei array ordinato
        var i, sorted = true;
        for(i = 0; i < elems.length; i++) {
            if ($(elems[i]).data('order') - 1 !== i) {
                sorted = false;
                break;
            }
        }

        if (sorted) {
            return shuffleChildren(parent, children);
        }
        //endregion

        children.detach();
        for(i = 0; i < elems.length; i++) {
            parent.append(elems[i]);
        }

        return true;
    }

    $.fn.sortExercise = function() {

        if (this.length === 0) { return this; }
        if (this.length > 1) { this.each(function () { $(this).sortExercise(); }); return this; }

        var parent = $(this),
            children = parent.find('> li').wrapInner('<div></div>'),
            exercise = parent.closest('.exercise'),
            verifyBtn = exercise.find('.btn-verifica');

        parent.addClass('sort-exercise');

        //per i sortable finti
        if (parent.data('sort-exercise') === false) {
            return;
        }

        if (parent.find('[data-order]').length === 0) {
            children.each(function(index, el) {
                var child = $(el);
                child.data('order', index + 1);
            });

            shuffleChildren(parent, children);
        }

        Sortable.create(parent[0], {
            forceFallback: true,
            //animation: 0,
            onStart : function() {
                parent.removeClass('correct wrong')
            }
        });

        parent.find('> li').disableSelection();

        var allSiblingSorts = exercise.find('.sort-exercise');
        if (allSiblingSorts.length > 1) {
            var allSiblingSortsLis = allSiblingSorts.find('> li');
            $.minHeightCopy(allSiblingSortsLis, allSiblingSortsLis, true);
        }


        verifyBtn.on('click', function() {
            var isCorrect = true;
            children = parent.find('> li'); //refresh per l'ordine
            children.each(function(index, el) {
                var child = $(el);
                if (child.data('order') !== index + 1) {
                    isCorrect = false;
                    return false;
                }
            });

            if (isCorrect) {
                parent.addClass('correct')
            } else {
                parent.addClass('wrong')
            }

        });

    };

    $.fn.stepSlider = function() {
        //current visible next

        if (this.length === 0) { return this; }
        if (this.length > 1) { this.each(function () { $(this).stepSlider(); }); return this; }


        var boardContainer = $(this),
            steps = boardContainer.find('.steps li').wrapInner('<div></div>'),
            board = boardContainer.find('.jxgbox'),
            boardParent = board.parent(),
            boardNumber = $('<div class="step-number">10</div>').appendTo(boardParent);

        var toggle = boardContainer.data("step-slider") === "toggle";
        var toggleSlides = boardContainer.find('.toggle-slides .toggle-slide');
        var toggleOffset = boardContainer.data('toggle-slide-offset') === undefined ? 0 : 1;

        if (boardNumber.length == 0) {
            boardNumber = boardContainer.find('.step-number').addClass('manual');
        }
        if (boardContainer.find('.steps-inline').length > 0) {
            boardNumber.hide();
        }

        if (toggle) {
            var toggleSlidesContainer = boardContainer.find('.toggle-slides');
            $.minHeightCopy(toggleSlides, toggleSlidesContainer, true);

            if (toggleOffset === 1) {
                $(toggleSlides.get(0)).addClass('visible');
            }
        }


        steps.append("<button class='btn btn-outline-dark btn-next'>AVANTI</button>");

        var currentStep = -1;
        var lastVisibleStep = -1;
        var totalSteps = steps.length;

        function showStep(index) {
            currentStep = index;

            steps.removeClass('current-step').removeClass('next-step');

            if (currentStep > -1) {
                steps.eq(currentStep).addClass('current-step').addClass('visible-step');
                board.trigger('S' + (currentStep + 1));
                boardNumber.html(currentStep + 1).addClass('show');

                if (toggle) {
                    toggleSlides.removeClass('visible');
                    $(toggleSlides.get(currentStep + toggleOffset)).addClass('visible');
                }
            }

            lastVisibleStep = Math.max(currentStep + 1, lastVisibleStep);
            if (lastVisibleStep < totalSteps) {
                steps.eq(lastVisibleStep).addClass('next-step');
            }
        }
        showStep(-1);

        steps.on('click', function() {
            var step = $(this);
            if (!step.hasClass('visible-step') && !step.hasClass('active-step') && !step.hasClass('next-step')) {
                return;
            }
            showStep(step.index());
        });

        var dataStep = boardContainer.data("step-initial");
        if (dataStep) {
            $(steps.get(dataStep - 1)).trigger("click");
        }
    };

    $.fn.stepCarousel = function() {
        //current visible next

        if (this.length === 0) { return this; }
        if (this.length > 1) { this.each(function () { $(this).stepCarousel(); }); return this; }

        var carousel = $(this);
        carousel.addClass('steps-carousel');

        var adaptiveHeight = carousel.data('step-carousel-autoheight') == true;

        carousel.slick({
            infinite: false,
            dots: true,
            adaptiveHeight: adaptiveHeight,
            slidesToShow: 1
        });

    };

    $(function() {
        $window.trigger('hashchange');

        setTimeout(function() {
            var $w = $('.wrapper');
            if (!$w.hasClass('mathjax-ready')) {
                $w.addClass('mathjax-ready');
                $(window).scrollTop(0);
                $documentWrapper.scrollTop(0)
            }
        }, 8000);

    });

    MathJax.Hub.Register.StartupHook("End",function () {

        $('[data-dropdown-exercise]').dropdownExercise();
        $('[data-radio-exercise]').radioExercise();
        $('[data-sort-exercise]').sortExercise();
        $('[data-step-slider]').stepSlider();
        $('[data-step-carousel]').stepCarousel();
        $window.trigger('resize');

        setTimeout(function() {$('.wrapper').addClass('mathjax-ready'); $(window).scrollTop(0); $documentWrapper.scrollTop(0);}, 100);
    });


})(window, jQuery);
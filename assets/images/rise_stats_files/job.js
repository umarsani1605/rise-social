(function($) {
    "use strict";

    var __cache = [];
    $.extend($.apusThemeCore, {
        /**
         *  Initialize scripts
         */
        job_init: function() {
            var self = this;

            self.select2Init();

            self.searchAjaxInit();

            self.listingDetail();

            self.filterListingFnc();

            self.listingBtnFilter();

            self.portfolio();

            self.sendPrivateMessage();

            self.changeHeightJobsDetail();

            setTimeout(function(){
                self.changePaddingTopContent();
                $(window).trigger('resize');
            }, 100);

            $(window).resize(function(){
                setTimeout(function(){
                    self.changePaddingTopContent();
                }, 50);
            });

            self.userLoginRegister();
            
            self.dashboardChart();
            
            if ( $('.jobs-listing-wrapper.main-items-wrapper:not(.no-filter), .employers-listing-wrapper.main-items-wrapper:not(.no-filter), .candidates-listing-wrapper.main-items-wrapper:not(.no-filter)').length ) {
                $(document).on('change', 'form.filter-listing-form-wrapper input, form.filter-listing-form-wrapper select', function (e) {
                    var form = $(this).closest('form.filter-listing-form-wrapper');
                    if ( $(this).attr('name') == 'filter-salary-type' ) {
                        form.find('input[name=filter-salary-from]').val('');
                        form.find('input[name=filter-salary-to]').val('');
                    }
                    setTimeout(function(){
                        form.trigger('submit');
                    }, 200);
                });

                $(document).on('submit', 'form.filter-listing-form-wrapper', function (e) {
                    e.preventDefault();
                    var url = $(this).attr('action');

                    var formData = $(this).find(":input").filter(function(index, element) {
                            return $(element).val() != '';
                        }).serialize();

                    if( url.indexOf('?') != -1 ) {
                        url = url + '&' + formData;
                    } else{
                        url = url + '?' + formData;
                    }
                    self.jobsGetPage( url );
                    return false;
                });
            }
            // Sort Action
            $(document).on('change', 'form.jobs-ordering select.orderby', function(e) {
                e.preventDefault();
                $('form.jobs-ordering').trigger('submit');
            });
            
            $(document).on('submit', 'form.jobs-ordering', function (e) {
                var url = $(this).attr('action');

                var formData = $(this).find(":input").filter(function(index, element) {
                            return $(element).val() != '';
                        }).serialize();
                
                if( url.indexOf('?') != -1 ) {
                    url = url + '&' + formData;
                } else{
                    url = url + '?' + formData;
                }
                self.jobsGetPage( url );
                return false;
            });
            // ajax pagination
            if ( $('.ajax-pagination').length ) {
                self.ajaxPaginationLoad();
            }

            $(document).on('click', '.advance-search-btn', function(e) {
                e.preventDefault();
                $(this).closest('.filter-listing-form').find('.advance-search-wrapper').slideToggle('fast', 'swing');
            });
            


            // message notification
            $('.message-notification').on('click', function (e) {
                e.stopPropagation();
                $('.notifications-wrapper').toggleClass('active');
                $('.message-top .notifications-wrapper.active').perfectScrollbar();
            });

            $('body').on('click', function() {
                if ($('.notifications-wrapper').hasClass('active')) {
                    $('.notifications-wrapper').removeClass('active');
                }
            });
            $('.notifications-wrapper').on('click', function(e) {
                e.stopPropagation();
            });

            $('body').on('click', '.close-filter-sidebar', function(){
                var parent = $(this).closest('.inner-left');
                parent.find('.filter-sidebar').removeClass('active');
                parent.find('.over-dark').removeClass('active');
            });
        },
        dashboardChart: function(){
            var self = this;
            
            // candidate chart
            if ( $('#dashboard_chart_wrapper').length ) {
                var $this = $('#dashboard_chart_wrapper');

                var labels = $this.data('labels');
                var values = $this.data('values');
                var label = $this.data('label');
                var chart_type = $this.data('chart_type');
                var bg_color = $this.data('bg_color');
                var border_color = $this.data('border_color');

                var ctx = $this.get(0).getContext("2d");
                var data = {
                    labels: labels,
                    datasets: [
                        {
                            label: label,
                            backgroundColor: bg_color,
                            borderColor: border_color,
                            borderWidth: 1,
                            data: values
                        },
                    ]
                };

                var options = {
                    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
                    scaleBeginAtZero : true,
                    //Boolean - Whether grid lines are shown across the chart
                    scaleShowGridLines : false,
                    //String - Colour of the grid lines
                    scaleGridLineColor : "rgba(0,0,0,.05)",
                    //Number - Width of the grid lines
                    scaleGridLineWidth : 1,
                    //Boolean - Whether to show horizontal lines (except X axis)
                    scaleShowHorizontalLines: true,
                    //Boolean - Whether to show vertical lines (except Y axis)
                    scaleShowVerticalLines: true,
                    //Boolean - If there is a stroke on each bar
                    barShowStroke : false,
                    //Number - Pixel width of the bar stroke
                    barStrokeWidth : 2,
                    //Number - Spacing between each of the X value sets
                    barValueSpacing : 5,
                    //Number - Spacing between data sets within X values
                    barDatasetSpacing : 1,
                    legend: { display: false },

                    tooltips: {
                        enabled: true,
                        mode: 'x-axis',
                        cornerRadius: 4
                    },
                }

                var myBarChart = new Chart(ctx, {
                    type: chart_type,
                    data: data,
                    options: options
                });
            }
            

            // scrollbar notifications
            $('.dashboard-notifications-wrapper').perfectScrollbar();
            
            // employer chart
            var self = this;
            var $this = $('#dashboard_job_chart_wrapper');
            if( $this.length <= 0 ) {
                return;
            }

            // select2
            if ( $.isFunction( $.fn.select2 ) && typeof wp_job_board_pro_select2_opts !== 'undefined' ) {
                var select2_args = wp_job_board_pro_select2_opts;
                select2_args['allowClear']              = false;
                select2_args['minimumResultsForSearch'] = 10;
                
                select2_args['language'] = {
                    noResults: function(){
                        return wp_job_board_pro_select2_opts.language_result;
                    }
                };
                
                select2_args['width'] = '100%';

                $('.stats-graph-search-form select').select2( select2_args );
            }


            var job_id = $this.data('job_id');
            var nb_days = $this.data('nb_days');
            self.dashboardChartAjaxInit($this, job_id, nb_days);

            $('form.stats-graph-search-form select[name="job_id"]').on('change', function(){
                $('form.stats-graph-search-form').trigger('submit');
            });

            $('form.stats-graph-search-form select[name="nb_days"]').on('change', function(){
                $('form.stats-graph-search-form').trigger('submit');
            });

            $('form.stats-graph-search-form').on('submit', function(e){
                e.preventDefault();
                var job_id = $('form.stats-graph-search-form select[name="job_id"]').val();
                var nb_days = $('form.stats-graph-search-form select[name="nb_days"]').val();
                self.dashboardChartAjaxInit($this, job_id, nb_days);
                return false;
            });

        },
        dashboardChartAjaxInit: function($this, job_id, nb_days) {
            var self = this;
            if( $this.length <= 0 ) {
                return;
            }
            if ( $this.hasClass('loading') ) {
                return;
            }
            $this.addClass('loading');

            var ajaxurl = jobtex_job_opts.ajaxurl;
            if ( typeof wp_job_board_pro_opts.ajaxurl_endpoint !== 'undefined' ) {
                ajaxurl =  wp_job_board_pro_opts.ajaxurl_endpoint.toString().replace( '%%endpoint%%', 'jobtex_get_job_chart' );
            }

            $.ajax({
                url: ajaxurl,
                type:'POST',
                dataType: 'json',
                data: {
                    action: 'jobtex_get_job_chart',
                    job_id: job_id,
                    nb_days: nb_days,
                    nonce: $this.data('nonce'),
                }
            }).done(function(response) {
                if (response.status == 'error') {
                    $this.remove();
                } else {
                    var ctx = $this.get(0).getContext("2d");

                    var data = {
                        labels: response.stats_labels,
                        datasets: [
                            {
                                label: response.stats_view,
                                backgroundColor: response.bg_color,
                                borderColor: response.border_color,
                                borderWidth: 1,
                                data: response.stats_values
                            },
                        ]
                    };

                    var options = {
                        //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
                        scaleBeginAtZero : true,
                        //Boolean - Whether grid lines are shown across the chart
                        scaleShowGridLines : false,
                        //String - Colour of the grid lines
                        scaleGridLineColor : "rgba(0,0,0,.05)",
                        //Number - Width of the grid lines
                        scaleGridLineWidth : 1,
                        //Boolean - Whether to show horizontal lines (except X axis)
                        scaleShowHorizontalLines: true,
                        //Boolean - Whether to show vertical lines (except Y axis)
                        scaleShowVerticalLines: true,
                        //Boolean - If there is a stroke on each bar
                        barShowStroke : false,
                        //Number - Pixel width of the bar stroke
                        barStrokeWidth : 2,
                        //Number - Spacing between each of the X value sets
                        barValueSpacing : 5,
                        //Number - Spacing between data sets within X values
                        barDatasetSpacing : 1,
                        legend: { display: false },

                        tooltips: {
                            enabled: true,
                            mode: 'x-axis',
                            cornerRadius: 4
                        },
                    }

                    if (typeof self.myBarChart !== 'undefined') {
                        self.myBarChart.destroy();
                    }

                    self.myBarChart = new Chart(ctx, {
                        type: response.chart_type,
                        data: data,
                        options: options
                    });
                }
                $this.removeClass('loading');
            });
        },
        portfolio: function() {
            $('.portfolio').each(function(){
                var $this = $(this);
                $('.view-more-gallery', $this).on('click', function(e){
                    $('.item', $this).removeClass('hidden');
                    $('.popup-image-gallery').removeClass('view-more-image');
                    $(this).addClass('hidden');
                    $(document).trigger('resize');
                });
            });
        },
        sendPrivateMessage: function() {
            var self = this;
            $('.send-private-message-btn').magnificPopup({
                mainClass: 'apus-mfp-zoom-in login-popup',
                type:'inline',
                midClick: true
            });
        },
        select2Init: function() {
            // select2
            var self = this;
            if ( $.isFunction( $.fn.select2 ) && typeof wp_job_board_pro_select2_opts !== 'undefined' ) {
                var select2_args = wp_job_board_pro_select2_opts;
                select2_args['allowClear'] = true;
                select2_args['minimumResultsForSearch'] = 10;
                select2_args['language'] = {
                    noResults: function (params) {
                        return select2_args['language_result'];
                    }
                }

                $('.select-taxonomy-search' ).each(function(){
                    self.select2SearchInit($(this), select2_args, false);
                });

                $('.select-field-region-search' ).each(function(){
                    self.select2SearchInit( $(this), select2_args, true );
                });

                $('body').on('change', 'select.select-field-region-search', function(){
                    var val = $(this).val();
                    var next = $(this).data('next');
                    var main_select = 'select.select-field-region-search' + next;
                    if ( $(main_select).length > 0 ) {
                        $(main_select).val(null).trigger("change");
                    }
                });

                $('.filter-listing-form select:not(.select-taxonomy-search, .select-field-region-search)').select2( select2_args );
                
                select2_args['allowClear'] = false;

                $( 'select[name=jobs_ppp]' ).select2( select2_args );
                $( 'select[name=candidates_ppp]' ).select2( select2_args );
                $( 'select[name=employers_ppp]' ).select2( select2_args );

                // filter
                
                $('select[name=email_frequency]').select2( select2_args );

                $('#_candidate_register_fields_apply_apply select').select2( select2_args );
            }
        },
        select2SearchInit: function($element, select2_args, region) {
            $element.select2({
                allowClear: true,
                width: '100%',
                dir: select2_args['dir'],
                language: {
                    noResults: function (params) {
                        return select2_args['language_result'];
                    },
                    inputTooShort: function () {
                        return select2_args['formatInputTooShort_text'];
                    }
                },
                minimumInputLength: 2,
                ajax: {
                    url: wp_job_board_pro_opts.ajaxurl_endpoint.toString().replace( '%%endpoint%%', 'wpjb_search_terms' ),
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        if ( region ) {
                            var parent_id = 0;
                            var prev = $element.data('prev');
                            var prev_select = $('.select-field-region-search' + prev);
                            if ( prev_select.length ) {
                                parent_id = prev_select.val();
                                if ( !parent_id ) {
                                    parent_id = 'lost-parent';
                                }

                            }
                            var query = {
                                search: params.term,
                                page: params.page || 1,
                                taxonomy: $element.data('taxonomy'),
                                parent: parent_id,
                                prev: prev
                            }
                        } else {
                            var query = {
                                search: params.term,
                                page: params.page || 1,
                                taxonomy: $element.data('taxonomy'),
                                parent: '',
                                prev: '',
                            }
                        }


                        // Query parameters will be ?search=[term]&type=public
                        return query;
                    },
                    processResults: function (data, params) {
                        params.page = params.page || 1;

                        return {
                            results: $.map(data.results, function (item) {
                                return {
                                    text: item.name,
                                    id: item.id
                                }
                            }),
                            pagination: {
                                more: params.page < data.pages
                            }
                        };
                    },
                    transport: function(params, success, failure) {
                        //retrieve the cached key or default to _ALL_
                        var __cachekey = params.data.search + '-' + params.data.taxonomy + '-' + params.data.page + '-' + params.data.parent + params.data.prev;

                        if ('undefined' !== typeof __cache[__cachekey]) {
                            //display the cached results
                            success(__cache[__cachekey]);
                            return; /* noop */
                        }
                        var $request = $.ajax(params);
                        $request.then(function(data) {
                            //store data in cache
                            __cache[__cachekey] = data;
                            //display the results
                            success(__cache[__cachekey]);
                        });
                        $request.fail(failure);
                        return $request;
                    },
                    cache: true
                }
                
            });
        },

        changeHeightJobsDetail: function() {
            var heightdetail = 0;
            if ( $('#job-details-wrapper .top-detail-job').length ){
                var heightdetail = $('#job-details-wrapper .top-detail-job').outerHeight();
            }
            $('#job-details-wrapper .job-content-area').css({ 'height': 'calc( 100vh - ' + ( heightdetail + 20 ) + 'px' });
        },

        changePaddingTopContent: function() {
            var admin_bar_h = 0;
            if ( $('#wpadminbar').length ){
                var admin_bar_h = $('#wpadminbar').outerHeight();
            }
            if ($(window).width() >= 1200) {
                var header_h = $('#apus-header').outerHeight();
                var header_top_h = header_h + admin_bar_h;
                var header_main_content_h = header_h - admin_bar_h;
                $('body.page-template-page-dashboard #apus-main-content').css({ 'padding-top': header_h });
                if ( $('.layout-type-fullwidth .filter-sidebar').length ) {
                    $('.layout-type-fullwidth .filter-sidebar').css({ 'top': header_h + admin_bar_h, 'height': 'calc( 100vh - ' + (header_h + admin_bar_h) + 'px )' });
                    $('#apus-main-content').css({ 'padding-top': header_h });
                }
                $('body.fix-header #apus-header').css({ 'top': admin_bar_h });

                if ($('#jobs-google-maps').is('.fix-map')) {
                    $('#jobs-google-maps').css({ 'top': header_top_h, 'height': 'calc(100vh - ' + header_top_h+ 'px)' });
                    $('#apus-main-content').css({ 'padding-top': header_h });
                }

                var top = 0;
                if ( $('#wpadminbar').length ) {
                    top = $('#wpadminbar').outerHeight();
                }
                if ( $('.main-sticky-header-wrapper').length ) {
                    top = top + header_h;
                }
                
                $('.sidebar-job.sticky-top').css({
                    top: top
                });

            } else {
                var header_h = $('#apus-header-mobile').outerHeight();

                if ( $('#jobs-google-maps').is('.fix-map') ) {
                    var header_top_h = header_h + admin_bar_h;
                    var header_main_content_h = header_h - admin_bar_h;
                } else if ( $('.layout-type-fullwidth .filter-sidebar').length ) {
                    $('.layout-type-fullwidth .filter-sidebar').css({ 'padding-top': header_h , 'height': '100vh' });
                    $('#apus-main-content').css({ 'padding-top': (header_h - admin_bar_h) + 'px' });
                }
                
                $('body.page-template-page-dashboard #apus-main-content').css({ 'padding-top': header_h });
                $('body.fix-header #apus-header').css({ 'top': 0 });
                if ($('#jobs-google-maps').is('.fix-map')) {
                    $('#jobs-google-maps').css({ 'top': header_h , 'height': 'calc(100vh - ' + header_h + 'px)' });
                    $('#apus-main-content').css({ 'padding-top': header_main_content_h });
                }
            }
        },
        searchAjaxInit: function() {
            if ( $.isFunction( $.fn.typeahead ) ) {
                $('.apus-autocompleate-input').each(function(){
                    var $this = $(this);
                    $this.typeahead({
                            'hint': true,
                            'highlight': true,
                            'minLength': 2,
                            'limit': 10
                        }, {
                            name: 'search',
                            source: function (query, processSync, processAsync) {
                                processSync([jobtex_job_opts.empty_msg]);
                                $this.closest('.twitter-typeahead').addClass('loading');

                                var values = {};
                                $.each($this.closest('form').serializeArray(), function (i, field) {
                                    values[field.name] = field.value;
                                });

                                return $.ajax({
                                    url: wp_job_board_pro_opts.ajaxurl_endpoint.toString().replace( '%%endpoint%%', 'jobtex_autocomplete_search_jobs' ),
                                    type: 'GET',
                                    data: {
                                        'search': query,
                                        'data': values
                                    },
                                    dataType: 'json',
                                    success: function (json) {
                                        $this.closest('.twitter-typeahead').removeClass('loading');
                                        $this.closest('.has-suggestion').removeClass('active');
                                        return processAsync(json);
                                    }
                                });
                            },
                            templates: {
                                empty : [
                                    '<div class="empty-message">',
                                    jobtex_job_opts.empty_msg,
                                    '</div>'
                                ].join('\n'),
                                suggestion: function(data) {
                                    return '<a href="'+ data.url +'" class="d-flex align-items-center autocompleate-media">\
                                    <div class="media-left flex-shrink-0">\
                                        <img src="'+ data.image +'" class="media-object" height="50" width="50">\
                                    </div>\
                                    <div class="media-body flex-grow-1">\
                                        <h4>'+ data.title +'</h4>\
                                        '+ data.salary +'\
                                    </div></a>';
                                }
                            },
                        }
                    );
                    $this.on('typeahead:selected', function (e, data) {
                        e.preventDefault();
                        setTimeout(function(){
                            $('.apus-autocompleate-input').val(data.title);    
                        }, 5);
                        
                        return false;
                    });
                });
            }
        },
        listingDetail: function() {
            var self = this;
            
            $(document).on('click', '.add-a-review', function(e) {
                e.preventDefault();
                var $id = $(this).attr('href');
                if ( $($id).length > 0 ) {
                    $('html,body').animate({
                      scrollTop: $($id).offset().top - 100
                    }, 1000);
                }
            });
        },
        listingBtnFilter: function(){
            $('.btn-view-map').on('click', function(e){
                e.preventDefault();
                $('#jobs-google-maps').removeClass('d-none').removeClass('d-lg-block');
                $('.content-listing .jobs-listing-wrapper').addClass('d-none').addClass('d-lg-block');
                $('.content-listing .candidates-listing-wrapper, .content-listing .employers-listing-wrapper').addClass('d-none').addClass('d-lg-block');
                $('.content-listing').addClass('p-0');
                $('.btn-view-listing').removeClass('d-none');
                $(this).addClass('d-none');
                $('.jobs-pagination-wrapper').addClass('p-fix-pagination');
                $('.candidates-pagination-wrapper, .employers-pagination-wrapper').addClass('p-fix-pagination');
                setTimeout(function() {
                    $(window).trigger('pxg:refreshmap');
                });
            });
            $('.btn-view-listing').on('click', function(e){
                e.preventDefault();
                $('#jobs-google-maps').addClass('d-none').addClass('d-lg-block');
                $('.content-listing .jobs-listing-wrapper').removeClass('d-none').removeClass('d-lg-block');
                $('.content-listing .candidates-listing-wrapper, .content-listing .employers-listing-wrapper').removeClass('d-none').removeClass('d-lg-block');
                $('.content-listing').removeClass('p-0');
                $('.btn-view-map').removeClass('d-none');
                $(this).addClass('d-none');
                $('.jobs-pagination-wrapper').removeClass('p-fix-pagination');
                $('.candidates-pagination-wrapper, .employers-pagination-wrapper').removeClass('p-fix-pagination');
            });

            // $('.show-filter-jobs, .filter-in-sidebar').on('click', function(e){
            //     e.stopPropagation();
            //     $('.offcanvas-filter-sidebar').toggleClass('active');
            //     $('.offcanvas-filter-sidebar + .over-dark').toggleClass('active');
            // });
            $(document).on('click', '.show-filter-jobs, .filter-in-sidebar', function(){
                $('.offcanvas-filter-sidebar').toggleClass('active');
                $('.offcanvas-filter-sidebar + .over-dark').toggleClass('active');
            });
            $(document).on('click', '.offcanvas-filter-sidebar + .over-dark', function(){
                $('.offcanvas-filter-sidebar').removeClass('active');
                $('.offcanvas-filter-sidebar + .over-dark').removeClass('active');
            });
        },

        userLoginRegister: function(){
            var self = this;
            // login/register
            $('.user-login-form, .must-log-in').on('click', function(e){
                e.preventDefault();
                if ( $('.apus-user-login').length ) {
                    $('.apus-user-login').trigger('click');
                }
            });
            $('.apus-user-login, .apus-user-register').magnificPopup({
                mainClass: 'apus-mfp-zoom-in login-popup',
                type:'inline',
                midClick: true,
                modal: true,
                callbacks: {
                    open: function() {
                        self.layzyLoadImage();
                    }
                }
            });

            $('.meesage-meeting-wrapper').perfectScrollbar();

            $(".show_hide_password a").on('click', function(event) {
                event.preventDefault();
                if($(this).siblings('input').attr("type") == "text"){
                    $(this).attr('title', jobtex_job_opts.show);
                    $(this).siblings('input').attr('type', 'password');
                    $(this).find('span').addClass( "dashicons-hidden" );
                    $(this).find('span').removeClass( "dashicons-visibility" );
                } else if($(this).siblings('input').attr("type") == "password"){
                    $(this).attr('title', jobtex_job_opts.hide);
                    $(this).siblings('input').attr('type', 'text');
                    $(this).find('span').removeClass( "dashicons-hidden" );
                    $(this).find('span').addClass( "dashicons-visibility" );
                }
            });
        },

        filterListingFnc: function(){
            var self = this;
            $('body').on('click', '.btn-show-filter, .offcanvas-filter-sidebar + .over-dark', function(){
                $('.offcanvas-filter-sidebar, .offcanvas-filter-sidebar + .over-dark').toggleClass('active');
                $('.offcanvas-filter-sidebar').perfectScrollbar();
            });
            
            $('body').on('click', '.tax-radios-field .form-group-inner ul span.caret-wrapper, .tax-checklist-field .form-group-inner ul span.caret-wrapper', function(){
                var con = $(this).closest('.list-item');
                con.find('> ul').slideToggle();
            });


            $('form .toggle-field.hide-content .heading-label i').removeClass('fa-angle-down').addClass('fa-angle-up');
            $('body').on('click', 'form .toggle-field .heading-label', function(){
                if ( $(this).find('i').hasClass('fa-angle-down') ) {
                    $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
                } else {
                    $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
                }
                var parent_e = $(this).closest('.form-group');
                setTimeout(function(){
                    
                    if ( parent_e.hasClass('tax-viewmore-field') ) {
                        var height = parent_e.find('.terms-list').outerHeight();
                        if ( height > 238 ) {
                            parent_e.addClass('show-more');
                        }
                    }
                }, 300);
            });

            $('.tax-viewmore-field').each(function(){
                var height = $(this).find('.terms-list').outerHeight();
                if ( height > 238 ) {
                    $(this).addClass('show-more');
                }
            });

            $(document).on('click', '.toggle-filter-viewmore', function() {
                var $this = $(this);
                var container = $(this).closest('.tax-viewmore-field');

                if ( container.hasClass('show-more') ) {
                    container.addClass('show-less').removeClass('show-more');
                    $this.find('.text').text(wp_job_board_pro_opts.show_less);
                } else {
                    container.addClass('show-more').removeClass('show-less');
                    $this.find('.text').text(wp_job_board_pro_opts.show_more);
                }

            });

            if ( $( 'input.field-datetimepicker' ).length > 0 && $.isFunction( $.fn.datetimepicker ) ) {
                jQuery.datetimepicker.setLocale(jobtex_job_opts.lang_code);
                $('input.field-datetimepicker').datetimepicker({
                    timepicker:false,
                    'scrollInput': false,
                    format:'Y/m/d',
                });
            }

            if ($(window).width() > 991) {
                $(document).on('click', '.layout-type-half-job-details .item-job, .layout-type-half-job-details-v2 .item-job', function(e){
                    
                    if (self.showJobAjax) { return false; }
                    var $this = $(this);
                    self.loadJobDetail($this);
                    
                });

                $(document).on('click', '.layout-type-half-job-details .item-job .job-title a, .layout-type-half-job-details-v2 .item-job .job-title a', function(e){
                    e.preventDefault();
                    if (self.showJobAjax) { return false; }
                    var $this = $(this).closest('.item-job');
                    self.loadJobDetail($this);
                    
                });
            }

        },
        loadJobDetail($this){
            var self = this;
            $('#job-details-wrapper').addClass('loading');

            self.showJobAjax = $.ajax({
                url: wp_job_board_pro_opts.ajaxurl_endpoint.toString().replace( '%%endpoint%%', 'jobtex_show_job_details' ),
                data: {
                    job_id: $this.attr('data-job_id')
                },
                dataType: 'json',
                cache: false,
                headers: {'cache-control': 'no-cache'},
                
                method: 'POST', // Note: Using "POST" method for the Ajax request to avoid "load_type" query-string in pagination links
                
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log('Apus: AJAX error - ' + errorThrown);
                    
                    $('#job-details-wrapper').removeClass('loading');
                    
                    self.showJobAjax = false;
                },
                success: function(response) {
                    if ( response.status ) {
                        $('#job-details-wrapper').html(response.html);

                        self.changeHeightJobsDetail();
                        $this.closest('.row-items').find('.item-job').removeClass('active');
                        $this.addClass('active');

                        $('#job-details-wrapper').find('.btn-apply-job-email:not(.filled), .btn-apply-job-call:not(.filled)').magnificPopup({
                            mainClass: 'apus-mfp-zoom-in apus-mfp-zoom-call-in',
                            type:'inline',
                            midClick: true
                        });

                        $('#job-details-wrapper').find('.btn-apply-job-email:not(.filled)').magnificPopup({
                            mainClass: 'apus-mfp-zoom-in',
                            type:'inline',
                            midClick: true
                        });
                        
                        if ( wp_job_board_pro_opts.recaptcha_enable ) {
                            setTimeout(function(){
                                var recaptchas = document.getElementsByClassName("ga-recaptcha");
                                for(var i=0; i<recaptchas.length; i++) {
                                    var recaptcha = recaptchas[i];
                                    var sitekey = recaptcha.dataset.sitekey;

                                    grecaptcha.render(recaptcha, {
                                        'sitekey' : sitekey
                                    });
                                }
                            }, 1000);
                        }

                        self.initSlick($('#job-details-wrapper').find('.slick-carousel'));

                        self.select2Init();
                    }
                    
                    $('#job-details-wrapper').removeClass('loading');

                    self.showJobAjax = false;
                }
            });
        },
        jobsGetPage: function(pageUrl, isBackButton){
            var self = this;
            if (self.filterAjax) { return false; }

            self.jobsSetCurrentUrl();

            if (pageUrl) {
                // Show 'loader' overlay
                self.jobsShowLoader();
                
                // Make sure the URL has a trailing-slash before query args (301 redirect fix)
                pageUrl = pageUrl.replace(/\/?(\?|#|$)/, '/$1');
                
                if (!isBackButton) {
                    self.setPushState(pageUrl);
                }

                self.filterAjax = $.ajax({
                    url: pageUrl,
                    data: {
                        load_type: 'full'
                    },
                    dataType: 'html',
                    cache: false,
                    headers: {'cache-control': 'no-cache'},
                    
                    method: 'POST', // Note: Using "POST" method for the Ajax request to avoid "load_type" query-string in pagination links
                    
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log('Apus: AJAX error - jobsGetPage() - ' + errorThrown);
                        
                        // Hide 'loader' overlay (after scroll animation)
                        self.jobsHideLoader();
                        
                        self.filterAjax = false;
                    },
                    success: function(response) {
                        // Update jobs content
                        self.jobsUpdateContent(response);
                        
                        
                        if ( $.isFunction( $.fn.select2 ) && typeof wp_job_board_pro_select2_opts !== 'undefined' ) {
                            var select2_args = wp_job_board_pro_select2_opts;
                            select2_args['allowClear'] = true;
                            select2_args['minimumResultsForSearch'] = 10;
                            select2_args['width'] = '100%';
                            select2_args['language'] = {
                                noResults: function (params) {
                                    return select2_args['language_result'];
                                }
                            }

                            $('.filter-listing-form select:not(.select-taxonomy-search, .select-field-region-search)').select2( select2_args );
                            
                        }

                        self.filterAjax = false;
                    }
                });
                
            }
        },
        jobsHideLoader: function(){
            $('body').find('.main-items-wrapper').removeClass('loading');
        },
        jobsShowLoader: function(){
            $('body').find('.main-items-wrapper').addClass('loading');
        },
        setPushState: function(pageUrl) {
            window.history.pushState({apusShop: true}, '', pageUrl);
        },
        jobsSetCurrentUrl: function() {
            var self = this;
            
            // Set current page URL
            self.searchAndTagsResetURL = window.location.href;
        },
        /**
         *  Properties: Update jobs content with AJAX HTML
         */
        jobsUpdateContent: function(ajaxHTML) {
            var self = this,
                $ajaxHTML = $('<div>' + ajaxHTML + '</div>');

            var $jobs = $ajaxHTML.find('.main-items-wrapper'),
                $pagination = $ajaxHTML.find('.main-pagination-wrapper');

            // Replace jobs
            if ($jobs.length) {
                $('.main-items-wrapper').replaceWith($jobs);
            }
            // Replace pagination
            if ($pagination.length) {
                $('.main-pagination-wrapper').replaceWith($pagination);
            }
            // Load images (init Unveil)
            self.layzyLoadImage();
            // pagination
            if ( $('.ajax-pagination').length ) {
                self.infloadScroll = false;
                self.ajaxPaginationLoad();
            }

            if ( $.isFunction( $.fn.select2 ) && typeof wp_job_board_pro_select2_opts !== 'undefined' ) {
                var select2_args = wp_job_board_pro_select2_opts;
                select2_args['allowClear']              = false;
                select2_args['minimumResultsForSearch'] = 10;
                select2_args['language'] = {
                    noResults: function (params) {
                        return select2_args['language_result'];
                    }
                }
                select2_args['minimumResultsForSearch'] = 10;
                select2_args['width'] = 'auto';
                
                $('select.orderby').select2( select2_args );
                $( 'select[name=jobs_ppp]' ).select2( select2_args );
                $( 'select[name=candidates_ppp]' ).select2( select2_args );
                $( 'select[name=employers_ppp]' ).select2( select2_args );
            }

            if ( wp_job_board_pro_opts.recaptcha_enable ) {
                setTimeout(function(){
                    var recaptchas = document.getElementsByClassName("ga-recaptcha");
                    for(var i=0; i<recaptchas.length; i++) {
                        var recaptcha = recaptchas[i];
                        var sitekey = recaptcha.dataset.sitekey;

                        grecaptcha.render(recaptcha, {
                            'sitekey' : sitekey
                        });
                    }
                }, 1000);
            }

            $('#job-details-wrapper').find('.btn-apply-job-email:not(.filled), .btn-apply-job-call:not(.filled)').magnificPopup({
                mainClass: 'apus-mfp-zoom-in apus-mfp-zoom-call-in',
                type:'inline',
                midClick: true
            });

            $('#job-details-wrapper').find('.btn-apply-job-email:not(.filled)').magnificPopup({
                mainClass: 'apus-mfp-zoom-in',
                type:'inline',
                midClick: true
            });
            self.updateMakerCards('jobs-google-maps');
            setTimeout(function() {
                // Hide 'loader'
                self.jobsHideLoader();
            }, 100);
        },

        /**
         *  Shop: Initialize infinite load
         */
        ajaxPaginationLoad: function() {
            var self = this,
                $infloadControls = $('body').find('.ajax-pagination'),                   
                nextPageUrl;

            self.infloadScroll = ($infloadControls.hasClass('infinite-action')) ? true : false;
            
            if (self.infloadScroll) {
                self.infscrollLock = false;
                
                var pxFromWindowBottomToBottom,
                    pxFromMenuToBottom = Math.round($(document).height() - $infloadControls.offset().top);
                    //bufferPx = 0;
                
                /* Bind: Window resize event to re-calculate the 'pxFromMenuToBottom' value (so the items load at the correct scroll-position) */
                var to = null;
                $(window).resize(function() {
                    if (to) { clearTimeout(to); }
                    to = setTimeout(function() {
                        var $infloadControls = $('.ajax-pagination'); // Note: Don't cache, element is dynamic
                        pxFromMenuToBottom = Math.round($(document).height() - $infloadControls.offset().top);
                    }, 100);
                });
                
                $(window).scroll(function(){
                    if (self.infscrollLock) {
                        return;
                    }
                    
                    pxFromWindowBottomToBottom = 0 + $(document).height() - ($(window).scrollTop()) - $(window).height();
                    
                    // If distance remaining in the scroll (including buffer) is less than the pagination element to bottom:
                    if (pxFromWindowBottomToBottom < pxFromMenuToBottom) {
                        self.ajaxPaginationGet();
                    }
                });
            } else {
                var $productsWrap = $('body');
                /* Bind: "Load" button */
                $productsWrap.on('click', '.main-pagination-wrapper .apus-loadmore-btn', function(e) {
                    e.preventDefault();
                    self.ajaxPaginationGet();
                });
                
            }
            
            if (self.infloadScroll) {
                $(window).trigger('scroll'); // Trigger scroll in case the pagination element (+buffer) is above the window bottom
            }
        },
        /**
         *  Shop: AJAX load next page
         */
        ajaxPaginationGet: function() {
            var self = this;
            
            if (self.filterAjax) return false;
            
            // Get elements (these can be replaced with AJAX, don't pre-cache)
            var $nextPageLink = $('.apus-pagination-next-link').find('a'),
                $infloadControls = $('.ajax-pagination'),
                nextPageUrl = $nextPageLink.attr('href');
            
            if (nextPageUrl) {
                // Show 'loader'
                $infloadControls.addClass('apus-loader');
                
                // self.setPushState(nextPageUrl);

                self.filterAjax = $.ajax({
                    url: nextPageUrl,
                    data: {
                        load_type: 'items'
                    },
                    dataType: 'html',
                    cache: false,
                    headers: {'cache-control': 'no-cache'},
                    method: 'GET',
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log('APUS: AJAX error - ajaxPaginationGet() - ' + errorThrown);
                    },
                    complete: function() {
                        // Hide 'loader'
                        $infloadControls.removeClass('apus-loader');
                    },
                    success: function(response) {
                        var $response = $('<div>' + response + '</div>'), // Wrap the returned HTML string in a dummy 'div' element we can get the elements
                            $gridItemElement = $('.items-wrapper', $response).html(),
                            $resultCount = $('.results-count .last', $response).html(),
                            $display_mode = $('.main-items-wrapper').data('display_mode');
                        

                        // Append the new elements
                        
                        $('.main-items-wrapper .items-wrapper .row-items').append($gridItemElement);
                        
                        
                        // Append results
                        $('.main-items-wrapper .results-count .last').html($resultCount);

                        // Update Maps
                        self.updateMakerCards('jobs-google-maps');

                        // Load images (init Unveil)
                        self.layzyLoadImage();
                        
                        // Get the 'next page' URL
                        nextPageUrl = $response.find('.apus-pagination-next-link').children('a').attr('href');
                        
                        if (nextPageUrl) {
                            $nextPageLink.attr('href', nextPageUrl);
                        } else {
                            $('.main-items-wrapper').addClass('all-jobs-loaded');
                            
                            if (self.infloadScroll) {
                                self.infscrollLock = true;
                            }
                            $infloadControls.find('.apus-loadmore-btn').addClass('hidden');
                            $nextPageLink.removeAttr('href');
                        }
                        
                        self.filterAjax = false;
                        
                        if (self.infloadScroll) {
                            $(window).trigger('scroll'); // Trigger 'scroll' in case the pagination element (+buffer) is still above the window bottom
                        }
                    }
                });
            } else {
                if (self.infloadScroll) {
                    self.infscrollLock = true; // "Lock" scroll (no more products/pages)
                }
            }
        },
        addCommas: function(str) {
            var parts = (str + "").split("."),
                main = parts[0],
                len = main.length,
                output = "",
                first = main.charAt(0),
                i;
            
            if (first === '-') {
                main = main.slice(1);
                len = main.length;    
            } else {
                first = "";
            }
            i = len - 1;
            while(i >= 0) {
                output = main.charAt(i) + output;
                if ((len - i) % 3 === 0 && i > 0) {
                    output = wp_job_board_pro_opts.money_thousands_separator + output;
                }
                --i;
            }
            // put sign back
            output = first + output;
            // put decimal part back
            if (parts.length > 1) {
                output += wp_job_board_pro_opts.money_dec_point + parts[1];
            }
            return output;
        }
    });

    $.apusThemeExtensions.job = $.apusThemeCore.job_init;

    
})(jQuery);

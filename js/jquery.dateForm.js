/**
@name jquery.dateForm.js
@type jQuery
@author Sébastien Gautier

@Depends jQuery v1.7.1+

style sheet :
				dateForm.css

@description This Plugin draws a date form element and manages complete fields.
This Plugin is free software; you can redistribute it and/or
modify it under the terms of the GNU Public License.

@param Object
	settings An object literal containing key/value pairs to provide optional settings.
		@option Array order that is order of date fields. For example : ["y", "m", "d"]
		@option Int min_year is first year from list
		@option Int max_year is last year from list
		@option Int visible_year is the year that will be showed on opening list.
		@option Object placeholder containing  key/value pairs that represents placeholder of date input tags.
			@options String y that is the placeholder of year
			@options String m that is the placeholder of month
			@options String d that is the placeholder of day
		@option Object i18n containing  key/value pairs that represents translations.
			@options String invalid_date that is message that will be showed when date is invalid
		@option Object $error_cont is a Jquery object that represents error container
		@option Function onError that is callback loaded on invalid field or invalid date.
			@param Object $error_cont is a Jquery object that represents the error container
			@param String message that is the error message from i18n parameter.
			
@example 
		$('#dateForm').dateForm({
			order : ["y", "m", "d"],
			min_year : 1910,
			max_year : 2020,
			visible_year : 1940,
			$error_cont : $form.find('.birth-cont .field-error'),
			placeholder : {
				y : "YYYY",
				m : "mm",
				d : "dd"
			},
			i18n : {
				invalid_date : "The date is invalid. Try again ..."
			},
			onError : function ($cont, str) {
				$cont.append(str);
			}
		});
		
		
		alert($('#dateForm').dateForm('check_date') ); ========> true or false
		
		$('#dateForm').dateForm('set_order', "ymd"); ========> The order of fields is changed to Year - Month - Day
		
		$('#dateForm').dateForm('set_date', {d:5,m:10,y:2013});
		
		$('#dateForm').dateForm('clear'); ========> clear all input
		
**/
(function( $ ){
	
	'use strict';
	
	var defaults = {
		order : ["d", "m", "y"],
		min_year : 1900,
		max_year : 2050,
		visible_year : 2013,
		placeholder : {
			y : "YYYY",
			m : "mm",
			d : "dd"
		},
		i18n : {
			invalid_date : "Invalid date"
		},
		$error_cont : undefined,
		onError : undefined
	};
	// ========================================================
	// Privates Methods
	// ========================================================
	function checkFields ($this, opt) {
		var d = opt.$d.val();
		var m = opt.$m.val();
		var y = opt.$y.val();
		$this.find('.error').removeClass('error');
		opt.$error_cont.empty();
		if (d.length || m.length || y.length ) {
			var check_day = checkDay (opt.$d);
			var check_month = checkMonth (opt.$m);
			var check_year = true;
			
			if (y.length === 4) {
				check_year = checkYear (opt.$y);
			}
			if (check_day === false) {
				opt.$d.addClass('error');
			}
			if (check_month === false) {
				opt.$m.addClass('error');
			}
			if (check_year === false) {
				opt.$y.addClass('error');
			}
			if (check_day === false || check_month === false || check_year === false) {
				if (opt.onError) {
					opt.onError(opt.$error_cont, opt.i18n.invalid_date);
				}
			}
			else {
				if (d.length === 1) {
					opt.$d.val("0" + d);
				}
				if (m.length === 1) {
					opt.$m.val("0" + m);
				}
				if (d.length && m.length && y.length ) {
					if (checkDate(opt) === false ) {
						doErrorField ($this.find('input').eq(0), opt);
						doErrorField ($this.find('input').eq(1), opt);
						doErrorField ($this.find('input').eq(2), opt);
					}
					else {
					}
				}
			}
		}
	}
	function checkDay ($d) {
		var d = $.trim($d.val());
		if (d.length) {
			var res = false;
			if ($.isNumeric(d) === false) {
				return false;
			}
			for (var i=1; i < 32; i++) {
				if (d == i || d == "0" + i || d == "0") {
					res = true;
					break;
				}
			}
			if (res === false) {
				return false;
			}
		}
		return true;
	}
	function checkMonth ($m) {
		var m = $.trim($m.val());
		if (m.length) {
			var res = false;
			if ($.isNumeric(m) === false) {
				return false;
			}
			for (var i=1; i < 13; i++) {
				if (m == i || m == "0" + i || m == "0" ) {
					res = true;
					break;
				}
			}
			if (res === false) {
				return false;
			}
		}
		return true;
	}
	
	function checkYear ($y) {
		var y = $.trim($y.val());
		if (y.length) {
			if ($.isNumeric(y) === false) {
				return false;
			}
			else if (y.length === 4) {
					return true;
			}
			else {
				return false;
			}
		}
		return true;
	}
	
	function checkDate (opt) {
		var d = parseInt(opt.$d.val(),10);
		var m = parseInt(opt.$m.val(),10);
		var y = parseInt(opt.$y.val(),10);
		var date = new Date();
		date.setMonth((m-1));
		date.setFullYear(y);
		date.setDate(d);
		if (date.getUTCFullYear() != y || (date.getUTCMonth()+1) != m || date.getUTCDate() != d) {
			return false;
		}
		else {
			return true;
		}
	}
	
	function nextFocus ($elem, i) {
		if (i === 2) {
			$elem.find('input').eq(i).focusout();
		}
		else {
			$elem.find('input').eq(i+1).focus();
		}
	}
	
	function openList ($list, opt) {
		$list.removeClass('date-form-hidden');
		var $selected = $list.find('.selected');
		var $default = $list.find('[value="' + opt.visible_year + '"]');
		var h;
		
		if ($selected.length) {
			h = $selected.index() * $selected.height();
			$list.animate({
				scrollTop: (h - ($list.height()/2))
			}, 0);
		}
		else {
			h = $default.index() * $default.height();
			$list.animate({
				scrollTop: (h - ($list.height()/2))
			}, 0);
		}
	}
	function closeList ($list) {
		$list.animate({
			scrollTop: (0)
		}, 0);
		$list.addClass('date-form-hidden');
	}
	function selectItem ($list, index) {
		var $selected = $list.find('li').eq(index);
		$list.find('li.selected').removeClass('selected');
		if ($selected && index >= 0) {
			$selected.addClass('selected');
			$list.animate({
				scrollTop: ($list.offset().top)
			}, 0);
		}
	}
	
	function setOrder($elem, o) {
		for (var i=0; i < o.order.length; i++) {
			if (o.order[i] === "d") {
				o.$d.parent().parent().appendTo($elem);
			}
			else if (o.order[i] === "m") {
				o.$m.parent().parent().appendTo($elem);
			}
			else if (o.order[i] === "y") {
				o.$y.parent().parent().appendTo($elem);
			}
			else {
				$.error('DateForm::SetOrder - order is not "y" or not "m" or not "d"');
			}
		}
		$elem.find('input').removeClass('last');
		$elem.find('input:last').addClass('last');
	}

	function setDate($this, args) {
		var opt = $this.data('dateForm_options');
		var d, m, y, d_str, m_str, y_str;
		$this.find('.error').removeClass('error');
		opt.$error_cont.empty();
		if (args.d) {
			d = args.d;
		}
		else {
			d = opt.$d.val();
		}
		if (args.m) {
			m = args.m;
		}
		else {
			m = opt.$m.val();
		}
		if (args.y) {
			y = args.y;
		}
		else {
			y = opt.$y.val();
		}
		var clone = {
			$d : opt.$d.clone().val(d),
			$m : opt.$m.clone().val(m),
			$y : opt.$y.clone().val(y)
		};
		if (checkDay(clone.$d) && checkMonth(clone.$m) && checkYear(clone.$y) && checkDate({$d:clone.$d, $m:clone.$m,$y:clone.$y}) ) {
			d_str = "" + d;
			m_str = "" + m;
			if (d_str.length === 1) {
				d_str = "0" + d;
			}
			if (m_str.length === 1) {
				m_str = "0" + m_str;
			}
			opt.$d.attr('value' , d_str);
			opt.$m.attr('value',m_str);
			opt.$y.attr('value', y);
			selectItem(opt.$day_list, opt.$d.val()-1);
			selectItem(opt.$month_list, opt.$m.val()-1);
			selectItem(opt.$year_list, ( opt.max_year - opt.$y.val()) );
		}
		else {
			$.error('DateForm::SetDate - Invalid date or arguments');
		}
	}
	function setPlaceholder ($this, args) {
		var opt = $this.data('dateForm_options');
		for (key in args) {
			if (key === "d") {
				if (args[key].length <= 2) {
					opt.$d.attr('placeholder' , args.d);
				}
				else {
					$.error('DateForm::setPlaceholder - The value of placeholder of day must be contains two characters max.');
				}
			}
			if (key === "m") {
				if (args[key].length <= 2) {
					opt.$m.attr('placeholder' , args.m);
				}
				else {
					$.error('DateForm::setPlaceholder - The value of placeholder of month must be contains two characters max.');
				}
			}
			if (key === "y") {
				if (args[key].length <= 4) {
					opt.$y.attr('placeholder' , args.y);
				}
				else {
					$.error('DateForm::setPlaceholder - The value of placeholder of year must be contains four characters max.');
				}
			}
			else {
				$.error('DateForm::setPlaceholder - key of args must be "d" or "m" or "y"');
			}
		}
		
		opt.$m.attr('value',m_str);
		opt.$y.attr('value', y);
	}

	function clear ($this) {
		var opt = $this.data('dateForm_options');
		opt.$d.removeAttr('value');
		opt.$m.removeAttr('value');
		opt.$y.removeAttr('value');
		selectItem (opt.$day_list, -1);
		selectItem (opt.$month_list, -1);
		selectItem (opt.$year_list, -1);
	}
	function doErrorField ($field, opt) {
		opt.$error_cont.empty();
		$field.addClass('error');
		if (opt.onError) {
			opt.onError(opt.$error_cont, opt.i18n.invalid_date);
		}
	}
	function onKeyUp ($this, $list, $field, checkField) {
		var opt = $this.data('dateForm_options');
		opt.$error_cont.empty();
		$field.removeClass('error');
		if ( checkField($field) === false){
			doErrorField ($field, opt);
		}
		else {
			var val = $field.val();
			selectItem ($list, val-1);
			if (val.length === 2) {
				nextFocus($this,$field.parent().parent().index());
			}
		}
	}
	function generateList ($this, $list, $field, opt, count, css_class) {
		for (var j=0; j < count; j++) {
			$('<li class="' + css_class + '">' + (j+1) + '</li>').click(function (ev) {
				var $li = $(this);
				var val = parseInt($li.text(),10);
				if (val < 10) {
					$field.val("0" + val);
				}
				else {
					$field.val(val);
				}
				selectItem($list, $li.index());
				checkFields ($this, opt);
				closeList ($list);
				
			}).appendTo($list);
		}
	}
	// ========================================================
	// Methods declaration
	// ========================================================
	var methods = {
		/**
		@description Public method that called on Plugin initialization.
					 It draws date form and applies behaviors on it.

		@method init
		@param Object containing Plugin options extends with default values of Plugin.
		**/
		init : function(args) {
			var options = $.extend({}, defaults, args);
			if (args.placeholder) {
				options.placeholder = $.extend({}, defaults.placeholder, args.placeholder);
			}
			if (args.i18n) {
				options.i18n = $.extend({}, defaults.i18n , args.i18n);
			}
			
			return $(this).each(function() {
				var $this	= $(this);
				// -----------------------------------------------------------
				// Day HTML and behavior
				// -----------------------------------------------------------
				options.$d_cont = $(
					'<div class="date-form-day-cont">'
						+ '<div class="date-form-input-cont">'
							+ '<input maxlength="2" class="date-form-input-day" placeholder="' + options.placeholder.d + '"/>'
							+ '<span class="arrow-down"></span>'
						+ '</div>'
						+ '<div class="list-cont"><ul class="date-form-day-list date-form-hidden"></ul></div>'
					+ '</div>'
				);
				options.$d = options.$d_cont.find('input');
				options.$day_list = options.$d_cont.find('ul');
				
				generateList ($this, options.$day_list, options.$d, options, 31, "year-item");
				options.$d.on('keyup', function (e) {
					if (e.which != 9 && e.which != 16 ) {
						onKeyUp ($this, options.$day_list, $(this), checkDay);
					}
				}).on('focus', function () {
					$(this).removeClass('error');
				}).on('focusout', function (event){
					closeList (options.$day_list);
					checkFields ($this, options);
				});
				// -----------------------------------------------------------
				// Month HTML and behavior
				// -----------------------------------------------------------
				options.$m_cont = $(
					'<div class="date-form-month-cont">'
						+ '<div class="date-form-input-cont">'
							+ '<input maxlength="2" class="date-form-input-month" placeholder="' + options.placeholder.m + '"/>'
							+ '<span class="arrow-down"></span>'
						+ '</div>'
						+ '<div class="list-cont"><ul class="date-form-month-list date-form-hidden"></ul></div>'
					+ '</div>'
				);
				options.$m = options.$m_cont.find('input');
				options.$month_list = options.$m_cont.find('ul');
				
				generateList ($this, options.$month_list, options.$m, options, 12, "month-item");
				options.$m.on('keyup', function (e) {
					if (e.which != 9 && e.which != 16 ) {
						onKeyUp ($this, options.$month_list, $(this), checkMonth);
					}
					
				}).on('focus', function () {
					$(this).removeClass('error');
				}).on('focusout', function (event){
					closeList (options.$month_list);
					checkFields ($this, options);
				});
				// -----------------------------------------------------------
				// Year HTML and behavior
				// -----------------------------------------------------------
				options.$y_cont = $(
					'<div class="date-form-year-cont">'
						+ '<div class="date-form-input-cont">'
							+ '<input maxlength="4" class="date-form-input-year" placeholder="' + options.placeholder.y + '"/>'
							+ '<span class="arrow-down"></span>'
						+ '</div>'
						+ '<div class="list-cont"><ul class="date-form-year-list date-form-hidden"></ul></div>'
					+ '</div>'
				);
				options.$y = options.$y_cont.find('input');
				options.$year_list = options.$y_cont.find('ul');
				for (var j=options.min_year; j <= options.max_year; j++) {
					var selected_class = "";
					$('<li class="year-item ' + selected_class + '" value="' + j + '">' + j + '</li>').click(function (ev) {
						var $li = $(this);
						options.$y.val(parseInt($li.text(),10));
						selectItem (options.$year_list, $li.index());
						checkFields ($this, options);
						closeList (options.$year_list);
					}).prependTo(options.$year_list);
				}
				
				options.$y.on('keyup', function (e) {
					if (e.which != 9 && e.which != 16) {
						options.$error_cont.empty();
						$(this).removeClass('error');
						var y = $(this).val();
						if (y.length) {
							if ($.isNumeric(y)) {
								if (y.length === 4) {
									if (checkYear($(this) ) === false){
										doErrorField ($(this), options);
									}
									else {
										selectItem (options.$year_list, options.$year_list.find('[value="' + y + '"]').index());
										nextFocus($this,$(this).parent().parent().index());
									}
								}
							}
							else {
								doErrorField ($(this), options);
							}
						}
						else {
							selectItem (options.$year_list, -1);
						}
					}
				}).on('focus', function () {
					$(this).removeClass('error');
				}).on('focusout', function (event){
					closeList (options.$year_list);
					checkFields ($this, options);
				});
				
				// -----------------------------------------------------------
				// toggle list
				$this.delegate('.arrow-down', 'click', function () {
					var $list = $(this).parent().parent().find('ul');
					if ($list.hasClass('date-form-hidden')) {
						openList($list, options);
					}
					else {
						closeList ($list);
					}
				});
				// -----------------------------------------------------------
				// INPUT focus in
				$this.find('[class^="date-form-input-"]').on('focusin', function (event){
					closeList (options.$day_list);
					closeList (options.$month_list);
					closeList (options.$year_list);
				});
				
				$this.data('dateForm_options', options);
				setOrder($this, options);
			});
		},
		set_order : function (args) {
			return $(this).each(function () {
				var $this = $(this);
				$this.data('dateForm_options').order = args;
				setOrder($this, $this.data('dateForm_options'));
			});
		},
		check_date : function () {
			var opt = $(this).data('dateForm_options');
			var result = checkDate(opt);
			return result;
		},
		set_date : function (args) {
			var $this= $(this);
			setDate($this, args);
		},
		clear : function () {
			var $this= $(this);
			clear ($this);
		},
		set_placeholder : function (args) {
			var $this= $(this);
			setPlaceholder($this, args);
		}
	};
	/**
	@namespace $.fn.dateForm
	**/
	$.fn.dateForm = function(method) {
		var args = arguments;
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( args, 1 ));
		}
		else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, args );
		}
		else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.dateForm' );
		}
	};
})( jQuery );

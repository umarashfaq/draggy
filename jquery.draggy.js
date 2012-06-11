/**
 * Draggy does what jQuery UI's draggable can't.
 * 
 * @author Umar Ashfaq
 * @since May 30, 2012
 */
(function($){
	var Draggy;
	
	Draggy = (function(){
		
		/**
		 * target is the child element whose dimensions are greater than than it's parent element.
		 * Hence parent will be acting as a window and reveal a portion of the target.
		 * Draggy will attach scrollbars to the parent, so that user can navigate through target.
		 * It'll also make child draggable, so that you can scroll even without using scrollbars.
		 */
		function Draggy(target, options) {
			this.target = target;			
			this.jq_target = $(target)
				.draggy('kill'); // kill any previous instances attached with this target
			
			this.options = options || {};
			
			this.setupDefaults();
			this.init();
		}
		
		Draggy.prototype.setupDefaults = function() {
			this.CURSOR_DRAGGABLE = 'move';// 'url(\''+contextPath+'/images/Drag1.png\'), auto';
			this.CURSOR_DRAGGING = 'move'; // 'url(\''+contextPath+'/images/Drag2.png\'), auto';
			
			this.options.z_index = 999;
			
			this.options.scrollbar_container_color = 'transparent';
			this.options.scrollbar_container_border = '1px solid transparent';
			this.options.scrollbar_container_hover_color = '#F2F2F2';
			this.options.scrollbar_container_hover_border = '1px solid #D9D9D9';
			
			this.options.scrollbar_color = '#CBCBCB';
			this.options.scrollbar_border = '1px solid #B6B6B6';
			this.options.scrollbar_hover_color = '#909090';
			this.options.scrollbar_hover_border = '1px solid #666666';
		};
		
		Draggy.prototype.init = function (){
			var _this = this,
				scroll_width = 10,
				jq_body = $('body'),
				mousedownTargetHandler = function(e){
						_this.mousedown(e);
						return false;
					},
				jq_target = this.jq_target
					.css({
						'cursor' : this.CURSOR_DRAGGABLE,
						'position' : 'relative'
					})
					.mousedown(mousedownTargetHandler)					
					.data('draggy', this),
				scrollParentHandler = function(e){
						_this.scroll(e);
					},
				mousewheelParentHandler = function(e, d, dx, dy) {
						_this.mousewheel(e, d, dx, dy);
						// return false;
					},
				jq_parent = jq_target.parent()
					.css({
						'position' : 'relative',
						'overflow' : 'hidden', // it was auto originally						
						'overflow-x' : 'hidden',
						'overflow-y' : 'hidden'
					})					
					.bind('mousewheel', mousewheelParentHandler)
					.scroll(scrollParentHandler),
				jq_grand_parent = jq_parent.parent(),
				target_width = jq_target.width(),
				target_height = jq_target.height(),
				target_outer_width = jq_target.outerWidth(true),
				target_outer_height = jq_target.outerHeight(true),
				parent_offset = jq_parent.offset(),				
				parent_width = jq_parent.width(),
				parent_height = jq_parent.height(),
				parent_outer_width = jq_parent.outerWidth(true), // includes width + left right margin + left right padding
				parent_outer_height = jq_parent.outerHeight(true), // includes height + top bottom margin + top bottom padding
				parent_diff_width = parent_outer_width - parent_width,
				parent_diff_height = parent_outer_height - parent_height,
				is_scroll_x_applicable = parent_outer_width < target_outer_width,
				is_scroll_y_applicable = parent_outer_height < target_outer_height,
				jq_scroll_container_x,
				jq_scroll_container_y,
				jq_clear,
				container_x_offset,
				container_x_width,
				container_x_outer_width,
				scroll_x_width,
				jq_scroll_x,
				container_y_offset,
				container_y_height,
				container_y_outer_height,
				scroll_y_height,
				jq_scroll_y,
				mousemoveDocHandler = function(e){
						_this.mousemoveDoc(e);
						return false;
					},
				mouseupDocHandler = function(e){
						_this.mouseupDoc(e);
						return false;
					},
				jq_doc = $(document)
					.mousemove(mousemoveDocHandler)
					.mouseup(mouseupDocHandler),
				scroll_x_outer_width,
				scroll_x_offset,
				displacement_factor_x,
				scroll_y_outer_height,
				scroll_y_offset,
				displacement_factor_y;
	
			if (is_scroll_y_applicable) {	
				jq_parent
					.css({
						'float' : 'left'
					})
					.width(function(){
						return $(this).width() - scroll_width - 2;
					});
				
				// updating references
				target_outer_width = jq_target.outerWidth(true);
				target_outer_height = jq_target.outerHeight(true);
				parent_offset = jq_parent.offset();
				parent_width = jq_parent.width();
				parent_height = jq_parent.height();
				parent_outer_width = jq_parent.outerWidth(true); // includes width + left right margin + left right padding
				parent_outer_height = jq_parent.outerHeight(true);
				
				jq_scroll_container_y = $('<div/>')
					.addClass('__draggy')
					.addClass('__vertical')
					.addClass('__state_1')
					.height(parent_height - 2) // 2 pixels will be covered by borders
					.mouseover(function(e){
						return _this.mouseoverScrollYContainer(e);
					})
					.mouseout(function(e){
						return _this.mouseoutScrollYContainer(e);
					})
					.insertAfter(jq_parent);
				jq_clear = $('<br/>')
					.css({
						'clear' : 'both'
					})
					.insertAfter(jq_scroll_container_y);
				
				container_y_offset = jq_scroll_container_y.offset();
				container_y_height = jq_scroll_container_y.height();
				container_y_outer_height = jq_scroll_container_y.outerHeight(true);
				scroll_y_height = ( target_outer_height > parent_outer_height ? parent_outer_height / target_outer_height : 1 ) * container_y_outer_height - 2; // 2 pixels will be covered by borders
				
				// alert('scroll_y_height: '+scroll_y_height);
				
				/*
				alert('parent_height('+parent_height+') / target_height('+target_height+') = '+parent_height / target_height);
				alert('parent_outer_height('+parent_outer_height+') / target_height('+target_height+') = '+parent_outer_height / target_height);
				alert('parent_height('+parent_height+') / target_outer_height('+target_outer_height+') = '+parent_height / target_outer_height);
				alert('parent_outer_height('+parent_outer_height+') / target_outer_height('+target_outer_height+') = '+parent_outer_height / target_outer_height);
				*/
				
				jq_scroll_y = $('<div/>')
					/*
					.css({
						'position' : 'absolute',
						'background' : this.options.scrollbar_color,
						'border': this.options.scrollbar_border,
						'width' : scroll_width,
						'z-index' : this.options.z_index + 1
					})
					.offset({
						'top' : -1,
						'left': -1
					})
					*/
					.mouseover(function(e){
						return _this.mouseoverScrollY(e);
					})
					.mouseout(function(e){
						return _this.mouseoutScrollY(e);
					})				
					.mousedown(function(e){
						return _this.mousedownScrollY(e);
					})	
					.height(scroll_y_height)
					.appendTo(jq_scroll_container_y);
				scroll_y_outer_height = jq_scroll_y.outerHeight(true);
				scroll_y_offset = jq_scroll_y.offset();
				displacement_factor_y = (container_y_outer_height - scroll_y_outer_height) / (target_outer_height - parent_height) /* - 0.065 */ ;
			// 	displacement_factor_y = (container_y_height - scroll_y_outer_height) / (target_outer_height - parent_height);
				
			//	alert('parent_height('+parent_outer_height+') / target_height('+target_outer_height+') : '+parent_outer_height / target_outer_height+'; scroll_y_height: '+scroll_y_height);
				
			//	alert('target_outer_height: '+target_outer_height);
			//	alert('displacement_factor_y: '+displacement_factor_y);
			}
			
			if (is_scroll_x_applicable) {
				jq_scroll_container_x = $('<div/>')
					/*
					.css({
						'position' : 'relative',
						'background' : this.options.scrollbar_container_color,
						'border': this.options.scrollbar_container_border,
						'height' : scroll_width,
						'z-index' : this.options.z_index
					})
					*/
					.addClass('__draggy')
					.addClass('__horizontal')
					.addClass('__state_1')
//					.offset({
//						'top' : parent_offset.top + jq_parent.height() - parent_diff_height - scroll_width,
//						'left': parent_offset.left + parent_diff_width
//					})
					.width(jq_parent.width())
					.mouseover(function(e){
						return _this.mouseoverScrollContainer(e, true);
						// return false;
					})
					.mouseout(function(e){
						return _this.mouseoutScrollContainer(e);
						// return false;
					})
					.insertAfter(jq_parent);
				container_x_offset = jq_scroll_container_x.offset();
				container_x_width = jq_scroll_container_x.width();
				container_x_outer_width = jq_scroll_container_x.outerWidth(true);
				scroll_x_width = ( target_width > parent_width ? parent_width / target_width : 1 ) * container_x_width;
				jq_scroll_x = $('<div/>')
					/*
					.css({
						'position' : 'absolute',
						'background' : this.options.scrollbar_color,
						'border': this.options.scrollbar_border,
						'height' : scroll_width,
						'z-index' : this.options.z_index + 1
					})
					.offset({
						'top' : -1,
						'left': -1
					})
					*/
					.width(scroll_x_width)
					.mouseover(function(e){
						return _this.mouseoverScroll(e);
						// return false;
					})
					.mouseout(function(e){
						return _this.mouseoutScroll(e);
						// return false;
					})				
					.mousedown(function(e){
						return _this.mousedownScroll(e);
						// return false;
					})		
					.appendTo(jq_scroll_container_x);
				scroll_x_outer_width = jq_scroll_x.outerWidth(true);
				scroll_x_offset = jq_scroll_x.offset();
				displacement_factor_x = (container_x_width - scroll_x_width) / (target_width - parent_width);
			}
			
			this.jq_doc = jq_doc;
			this.jq_parent = jq_parent;
			this.jq_scroll_x = jq_scroll_x;
			this.jq_scroll_y = jq_scroll_y;
			this.jq_scroll_container_x = jq_scroll_container_x;
			this.jq_scroll_container_y = jq_scroll_container_y;
			this.displacement_factor_x = displacement_factor_x;
			this.displacement_factor_y = displacement_factor_y;
			this.scroll_x_outer_width = scroll_x_outer_width;
			this.container_x_outer_width = container_x_outer_width;
			
			this.__mousedownTargetHandler = mousedownTargetHandler;
			this.__scrollParentHandler = scrollParentHandler;
			this.__mousewheelParentHandler = mousewheelParentHandler;
			this.__mousemoveDocHandler = mousemoveDocHandler;
			this.__mouseupDocHandler = mouseupDocHandler;
		};
		
		Draggy.prototype.mousedown = function(e) {
			this.is_mouse_down = true;
			this.mouse_down_point = {x:e.pageX,y:e.pageY};
			this.scroll_left = this.jq_parent.scrollLeft();	
			this.scroll_top = this.jq_parent.scrollTop();
			
			var jq_target = this.jq_target
				.css({
					'cursor' : this.CURSOR_DRAGGING
				});
		};
		
		Draggy.prototype.mousewheel = function(e, d, dx, dy) {
			// this.scrollLeft -= (d * 30);
			var jq_parent = this.jq_parent,
				scroll_left = jq_parent
					.scrollLeft();
			
			// console.log('d: '+d+'; dx: '+dx+'; dy: '+dy);
			
			jq_parent.scrollLeft(scroll_left + (dx*30));
		};
		
		Draggy.prototype.mouseup = function(e) {
			this.is_mouse_down = false;
			
			var jq_target = this.jq_target
				.css({
					'cursor' : this.CURSOR_DRAGGABLE
				});
		};
		
		Draggy.prototype.mousemove = function(e) {
			var jq_parent = this.jq_parent,
				is_mouse_down = this.is_mouse_down,
				scroll_left = this.scroll_left,
				scroll_top = this.scroll_top,
				op = this.mouse_down_point, // op for original point
				cp, // current point
				distance, // distance between points
				current_scroll_left,
				current_scroll_top;
				
			if (is_mouse_down) {
				// move scrolls here
				cp = {x:e.pageX,y:e.pageY};
				distance = {x:op.x-cp.x,y:op.y-cp.y};
				
				current_scroll_left = scroll_left + distance.x;
				current_scroll_top = scroll_top + distance.y;
				
				jq_parent.scrollLeft(current_scroll_left);
				jq_parent.scrollTop(current_scroll_top);
			}
		};
		
		Draggy.prototype.getStateClasses = function(index, css) {
			return (css.match (/\b__state_\d{1}/g) || []).join(' ');
		};
		
		Draggy.prototype.setState = function(scroll, state) {
			state = state ? state : 1;
			
			var cls = '__state_'+state,
				jq_scroll_container = scroll === 'y' ? this.jq_scroll_container_y : this.jq_scroll_container_x;
			
			jq_scroll_container
				.removeClass(this.getStateClasses)
				.addClass(cls);
		};
		
		Draggy.prototype.mouseoverScrollContainer = function(e, is_mouse_over_scroll_x_container) {
			console.log('[mouseoverScrollContainer] mouseover scroll_container_x detected.');
			this.setState('x', 2);			
			this.is_mouse_over_scroll_x_container = true /* is_mouse_over_scroll_x_container */;
			return false;
			// console.log('[mouseoverScrollContainer] this.is_mouse_over_scroll_x_container: '+this.is_mouse_over_scroll_x_container);
		};
		
		Draggy.prototype.mouseoutScrollContainer = function(e) {
			// console.log('mouseoutScrollContainer() invoked ... ');
			console.log('[mouseoutScrollContainer] mouseout scroll_container_x detected.');
			this.setState('x');
			this.is_mouse_over_scroll_x_container = false;
			return false;
		};
		
		Draggy.prototype.mouseoverScroll = function(e) {
			console.log('[mouseoutScroll] mouseover scroll_x detected.');
			
			if (!this.is_mouse_down_on_scroll_x) {
				this.setState('x', 3);
			}
			this.is_mouse_over_scroll_x = true;
			// this.mouseoverScrollContainer(e);
			return false;
		};
		
		Draggy.prototype.mouseoutScroll = function(e) {
			console.log('[mouseoutScroll] mouseout scroll_x detected.');			
			if (!this.is_mouse_down_on_scroll_x /* && !this.is_mouse_over_scroll_x_container */ ) {
				this.setState('x');
				/*
				if (!this.is_mouse_over_scroll_x_container) {
					this.mouseoutScrollContainer(e);
				}
				*/
			}
			
			this.is_mouse_over_scroll_x = false;
			return false;
		};
		
		Draggy.prototype.mousedownScroll = function(e) {
			var jq_c = this.jq_scroll_container_x,
				jq_o = this.jq_scroll_x,
				left = jq_o.position().left + 2,
				css_left = jq_o.css('left');
			
			this.setState('x', 4);
			
			css_left = css_left.substring(0, css_left.indexOf('px'));
			
			// console.log('[mousedownScroll] saving left: '+left+'; css_left: '+css_left);
			
			this.is_mouse_down_on_scroll_x = true;
			this.scroll_left = left;
			this.mouse_down_point = {x:e.pageX,y:e.pageY};
			return false;
		};
		
		Draggy.prototype.mouseupScroll = function(e) {			
			if (this.is_mouse_over_scroll_x) {
				this.setState('x', 3);
			} else {
				this.setState('x');
			}
			
			this.is_mouse_down_on_scroll_x = false;
		};
		
		Draggy.prototype.mousemoveScroll = function(e) {
			var jq_o = this.jq_scroll_x,
				jq_parent = this.jq_parent,
				original_left = this.scroll_left,
				op = this.mouse_down_point,
				cp = {x:e.pageX,y:e.pageY},
				distance = {x:op.x-cp.x,y:op.y-cp.y},
				displacement_factor_x = this.displacement_factor_x,
				left = ( original_left - distance.x ) / displacement_factor_x,
				scroll_x_outer_width = this.scroll_x_outer_width,
				container_x_outer_width = this.container_x_outer_width;
			
			// console.log('original_left('+original_left+') - distance.x('+distance.x+') / displacement_factor_x('+displacement_factor_x+') = '+left);
			// console.log('left('+left+') + scroll_x_outer_width('+scroll_x_outer_width+') : '+(left + scroll_x_outer_width)+' < container_x_outer_width: '+container_x_outer_width);
			
			/*
			if (left < 0) {
				left = 0;
			} else if (left > ( container_x_outer_width / displacement_factor_x ) ) {
				left = container_x_outer_width / displacement_factor_x;
			}
			*/
			
			// console.log('[mousemoveScroll] setting left: '+left);
	//		jq_o.css({
	//			left : left + 'px'
	//		});
			jq_parent.scrollLeft(left);
		};
		
		Draggy.prototype.mouseoverScrollY = function(e) {
			/*
			var jq_o = this.jq_scroll_y
				.css({
					'background' : this.options.scrollbar_hover_color,
					'border' : this.options.scrollbar_hover_border
				});
				
			this.is_mouse_over_scroll_y = true;
			*/
			
			// console.log('[mouseoutScroll] mouseover scroll_x detected.');
			
			if (!this.is_mouse_down_on_scroll_y) {
				this.setState('y', 3);
			}
			this.is_mouse_over_scroll_y = true;
			// this.mouseoverScrollContainer(e);
			return false;
		};
		
		Draggy.prototype.mouseoutScrollY = function(e) {
			/*
			if (!this.is_mouse_down_on_scroll_y) {
				var jq_o = this.jq_scroll_y
				.css({
					'background' : this.options.scrollbar_color,
					'border' : this.options.scrollbar_border
				});
			}
			
			this.is_mouse_over_scroll_y = false;
			*/
			
			if (!this.is_mouse_down_on_scroll_y /* && !this.is_mouse_over_scroll_x_container */ ) {
				this.setState('y');
			}
			
			this.is_mouse_over_scroll_y = false;
			return false;
		};
		
		Draggy.prototype.mousedownScrollY = function(e) {
			var jq_o = this.jq_scroll_y,
				top = jq_o.position().top + 2;
			
			this.setState('y', 4);
			
			this.is_mouse_down_on_scroll_y = true;
			this.scroll_top = top;			
			this.mouse_down_point = {x:e.pageX,y:e.pageY};
			// console.log('[mousedownScrollY] scroll_top: '+top);
			return false;
		};
		
		Draggy.prototype.mouseupScrollY = function(e) {		
			/*
			var jq_o = this.jq_scroll_y
				.css({
					'box-shadow' : ''
				});
			if (!this.is_mouse_over_scroll_y) {
				jq_o.css({
						'background' : this.options.scrollbar_color,
						'border' : this.options.scrollbar_border
					});
			}
			this.is_mouse_down_on_scroll_y = false;
			*/
			
			if (this.is_mouse_over_scroll_y) {
				this.setState('y', 3);
			} else {
				this.setState('y');
			}
			
			this.is_mouse_down_on_scroll_y = false;
		};
		
		Draggy.prototype.mousemoveScrollY = function(e) {
			var jq_o = this.jq_scroll_y,
				jq_parent = this.jq_parent,
				original_top = this.scroll_top,
				op = this.mouse_down_point,
				cp = {x:e.pageX,y:e.pageY},
				distance = {x:op.x-cp.x,y:op.y-cp.y},
				displacement_factor_y = this.displacement_factor_y,
				top = ( original_top - distance.y ) / displacement_factor_y;
			
			console.log('[mousemoveScrollY] ( original_top('+original_top+') - distance.y('+distance.y+') ) / displacement_factor_y ('+displacement_factor_y+') = '+top);
			
			// console.log('[mousemoveScrollY] setting top: '+top);
			
			jq_parent.scrollTop(top);
		};
		
		Draggy.prototype.mouseoverScrollYContainer = function(e) {
			/*
			var jq_o = this.jq_scroll_container_y
				.css({
					'background' : this.options.scrollbar_container_hover_color,
					'border' : this.options.scrollbar_container_hover_border
				}),
				jq_scroll = jq_o.children()
					.css({
						'background' : '#C0C0C0',
						'border' : '1px solid #9A9A9A'
					});
			*/
			
			this.setState('y', 2);			
			this.is_mouse_over_scroll_y_container = true;
			return false;
		};
		
		Draggy.prototype.mouseoutScrollYContainer = function(e) {
			/*
			var jq_o = this.jq_scroll_container_y
				.css({
					'background' : this.options.scrollbar_container_color,
					'border' : this.options.scrollbar_container_border
				}),
				jq_scroll = jq_o.children()
					.css({
						'background' : this.options.scrollbar_color,
						'border' : this.options.scrollbar_border
					});
			*/
			
			this.setState('y');
			this.is_mouse_over_scroll_y_container = false;
			return false;
		};
		
		Draggy.prototype.mousemoveDoc = function(e) {
			var is_mouse_down_on_scroll_x = this.is_mouse_down_on_scroll_x,
				is_mouse_down_on_scroll_y = this.is_mouse_down_on_scroll_y,
				is_mouse_down = this.is_mouse_down;
			
			if (is_mouse_down) {
				this.mousemove(e);
			} else if (is_mouse_down_on_scroll_x) {
				this.mousemoveScroll(e);
			} else if (is_mouse_down_on_scroll_y) {
				this.mousemoveScrollY(e);
			}			
		};
		
		Draggy.prototype.mouseupDoc = function(e) {
			var is_mouse_down_on_scroll_x = this.is_mouse_down_on_scroll_x,
				is_mouse_over_scroll_x = this.is_mouse_over_scroll_x,
				is_mouse_over_scroll_x_container = this.is_mouse_over_scroll_x_container,
				is_mouse_down_on_scroll_y = this.is_mouse_down_on_scroll_y,
				is_mouse_over_scroll_y = this.is_mouse_over_scroll_y,
				is_mouse_over_scroll_y_container = this.is_mouse_over_scroll_x_container,
				is_mouse_down = this.is_mouse_down;
			
			console.log('is_mouse_over_scroll_x_container: '+is_mouse_over_scroll_x_container);
			
			if (is_mouse_down_on_scroll_x) {
				this.mouseupScroll(e);				
			}	
			
			/*
			if (!is_mouse_over_scroll_x && !is_mouse_over_scroll_x_container) {
				this.mouseoutScrollContainer(e);
			}
			*/
			
			if (is_mouse_down_on_scroll_y) {
				this.mouseupScrollY(e);
			}
			
			if (is_mouse_down) {
				this.mouseup(e);
			}
		};
		
		Draggy.prototype.scroll = function(e) {
			var jq_parent = this.jq_parent,
				scroll_left = jq_parent.scrollLeft(),
				scroll_top = jq_parent.scrollTop(),
				jq_scroll_container_x = this.jq_scroll_container_x,
				container_x_offset,
				displacement_factor_x,
				jq_scroll_x,
				jq_scroll_container_y = this.jq_scroll_container_y,
				container_y_offset,
				displacement_factor_y,
				jq_scroll_y;
			
			if (jq_scroll_container_x) {
				container_x_offset = jq_scroll_container_x.offset();
				displacement_factor_x = this.displacement_factor_x;
				jq_scroll_x = this.jq_scroll_x
					.offset({
						'left' : container_x_offset.left + ( scroll_left * displacement_factor_x ) 
					});
			}
			
			if (jq_scroll_container_y) {
				container_y_offset = jq_scroll_container_y.offset();
				displacement_factor_y = this.displacement_factor_y;				
				jq_scroll_y = this.jq_scroll_y
					.offset({
						'top' : container_y_offset.top + ( scroll_top * displacement_factor_y ) 
					});
				// console.log('scroll_top('+scroll_top+') * displacement_factor_y('+displacement_factor_y+'): '+(scroll_top * displacement_factor_y));
				console.log('container_y_offset.top('+container_y_offset.top+') + ( scroll_top('+scroll_top+') * displacement_factor_y('+displacement_factor_y+') ) = '+(container_y_offset.top + ( scroll_top * displacement_factor_y )));
			}
		};
		
		Draggy.prototype.destroy = function(e) {
			
			var jq_doc = this.jq_doc,
				jq_parent = this.jq_parent,
				jq_target = this.jq_target,
				jq_scroll_container_x = this.jq_scroll_container_x,
				jq_scroll_container_y = this.jq_scroll_container_y;
			
			// alert('destroy invoked on '+jq_target.attr('id'));
			
			if (jq_scroll_container_x) {
				jq_scroll_container_x.remove();
			}
			
			if (jq_scroll_container_y) {
				jq_scroll_container_y.remove();
			}
			
			// unbind observers from global elements
			jq_target.unbind('mousedown', this.__mousedownTargetHandler);
			jq_parent
				.unbind('scroll', this.__scrollParentHandler)
				.unbind('mousewheel', this.__mousewheelParentHandler);
			jq_doc
				.unbind('mousemove', this.__mousemoveDocHandler)
				.unbind('mouseup', this.__mouseupDocHandler);
			
			jq_target.removeData('draggy');			
		};
		
		Draggy.kill = function(target) {
			var jq_target = $(target),
				draggy = jq_target.data('draggy');
			
			if (draggy) {
				draggy.destroy();
			}
		};
		
		return Draggy;
	})();
	
	$.fn.draggy = function( props ) {
		return this.each(function() {			
			if (props==='kill') {
				Draggy.kill(this);
			} else {
				return new Draggy(this, props);
			}
		});
	};
	
	// $('#something').draggy();
	
})(jQuery);
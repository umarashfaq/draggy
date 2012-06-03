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
			this.CURSOR_DRAGGABLE = 'default'; // 'url(\''+contextPath+'/images/draggable_surface.png\'), auto';
			this.CURSOR_DRAGGING = 'default'; // 'url(\''+contextPath+'/images/drag_surface.png\'), auto';
			
			this.options.z_index = 999;
			
			// this.options.scrollbar_container_color = '#F2F2F2';
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
				jq_parent = jq_target.parent()
					.css({
						'position' : 'relative',
						'overflow' : 'hidden', // it was auto originally					
						'overflow-x' : 'hidden',
						'overflow-y' : 'hidden'
					})					
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
				jq_scroll_container_y = $('<div/>')
					.css({
						'position' : 'relative',
						'background' : this.options.scrollbar_container_hover_color,
						'border': this.options.scrollbar_container_hover_border,
						'width' : scroll_width,
						'z-index' : this.options.z_index,
						'float' : 'right'
					})
					.height(parent_height)
					.insertAfter(jq_parent);
				jq_clear = $('<br/>')
					.css({
						'clear' : 'both'
					})
					.insertAfter(jq_scroll_container_y);
				
				container_y_offset = jq_scroll_container_y.offset();
				container_y_height = jq_scroll_container_y.height();
				container_y_outer_height = jq_scroll_container_y.outerHeight(true);
				scroll_y_height = ( target_outer_height > parent_outer_height ? parent_outer_height / target_outer_height : 1 ) * container_y_height;
				jq_scroll_y = $('<div/>')
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
					.hover(function(e){
						_this.mouseoverScrollY(this, e);
						return false;
					}, function(e){
						_this.mouseoutScrollY(this, e);
						return false;
					})				
					.mousedown(function(e){
						_this.mousedownScrollY(this, e);
						return false;
					})	
					.height(scroll_y_height)
					.appendTo(jq_scroll_container_y);
				scroll_y_outer_height = jq_scroll_y.outerHeight(true);
				scroll_y_offset = jq_scroll_y.offset();
				displacement_factor_y = (container_y_outer_height - scroll_y_outer_height) / (target_outer_height - parent_outer_height);
			}
			
			if (is_scroll_x_applicable) {
				jq_scroll_container_x = $('<div/>')
					.css({
						'position' : 'relative',
						'background' : this.options.scrollbar_container_hover_color,
						'border': this.options.scrollbar_container_hover_border,
						'height' : scroll_width,
						'z-index' : this.options.z_index
					})
//					.offset({
//						'top' : parent_offset.top + jq_parent.height() - parent_diff_height - scroll_width,
//						'left': parent_offset.left + parent_diff_width
//					})
					.width(jq_parent.width()-2)
					.hover(function(e){
						_this.mouseoverScrollContainer(this, e);
					}, function(e){
						_this.mouseoutScrollContainer(this, e);
					})
					.insertAfter(jq_parent);
				container_x_offset = jq_scroll_container_x.offset();
				container_x_width = jq_scroll_container_x.width();
				container_x_outer_width = jq_scroll_container_x.outerWidth(true);
				scroll_x_width = ( target_width > parent_width ? parent_width / target_width : 1 ) * container_x_width;
				jq_scroll_x = $('<div/>')
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
					.width(scroll_x_width)
					.hover(function(e){
						_this.mouseoverScroll(this, e);
						return false;
					}, function(e){
						_this.mouseoutScroll(this, e);
						return false;
					})				
					.mousedown(function(e){
						_this.mousedownScroll(this, e);
						return false;
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
		
		Draggy.prototype.mouseoverScrollContainer = function(o, e) {
			var jq_o = $(o),
				jq_scroll = jq_o.children()
					.css({
						'background' : '#C0C0C0',
						'border' : '1px solid #9A9A9A'
					});
		};
		
		Draggy.prototype.mouseoutScrollContainer = function(o, e) {
			var jq_o = $(o),
				jq_scroll = jq_o.children()
					.css({
						'background' : this.options.scrollbar_color,
						'border' : this.options.scrollbar_border
					});
		};
		
		Draggy.prototype.mouseoverScroll = function(o, e) {
			var jq_o = $(o)
				.css({
					'background' : this.options.scrollbar_hover_color,
					'border' : this.options.scrollbar_hover_border
				});
				
			this.is_mouse_over_scroll_x = true;
		};
		
		Draggy.prototype.mouseoutScroll = function(o, e) {
			if (!this.is_mouse_down_on_scroll_x) {
				var jq_o = $(o)
				.css({
					'background' : this.options.scrollbar_color,
					'border' : this.options.scrollbar_border
				});
			}
			
			this.is_mouse_over_scroll_x = false;
		};
		
		Draggy.prototype.mousedownScroll = function(o, e) {
			var jq_o = $(o),
				left = jq_o.position().left + 2,
				css_left = jq_o.css('left');
			
			css_left = css_left.substring(0, css_left.indexOf('px'));
			
			console.log('[mousedownScroll] saving left: '+left+'; css_left: '+css_left);
			
			this.is_mouse_down_on_scroll_x = true;
			this.scroll_left = left;
			this.mouse_down_point = {x:e.pageX,y:e.pageY};
		};
		
		Draggy.prototype.mouseupScroll = function(o, e) {			
			if (!this.is_mouse_over_scroll_x) {
				var jq_o = $(o)
					.css({
						'background' : this.options.scrollbar_color,
						'border' : this.options.scrollbar_border
					});
			}
			this.is_mouse_down_on_scroll_x = false;
		};
		
		Draggy.prototype.mousemoveScroll = function(o, e) {
			var jq_o = $(o),
				jq_parent = this.jq_parent,
				original_left = this.scroll_left,
				op = this.mouse_down_point,
				cp = {x:e.pageX,y:e.pageY},
				distance = {x:op.x-cp.x,y:op.y-cp.y},
				displacement_factor_x = this.displacement_factor_x,
				left = ( original_left - distance.x ) / displacement_factor_x,
				scroll_x_outer_width = this.scroll_x_outer_width,
				container_x_outer_width = this.container_x_outer_width;
			
			console.log('original_left('+original_left+') - distance.x('+distance.x+') / displacement_factor_x('+displacement_factor_x+') = '+left);
			// console.log('left('+left+') + scroll_x_outer_width('+scroll_x_outer_width+') : '+(left + scroll_x_outer_width)+' < container_x_outer_width: '+container_x_outer_width);
			
			/*
			if (left < 0) {
				left = 0;
			} else if (left > ( container_x_outer_width / displacement_factor_x ) ) {
				left = container_x_outer_width / displacement_factor_x;
			}
			*/
			
			console.log('[mousemoveScroll] setting left: '+left);
	//		jq_o.css({
	//			left : left + 'px'
	//		});
			jq_parent.scrollLeft(left);
		};
		
		Draggy.prototype.mouseoverScrollY = function(o, e) {
			var jq_o = $(o)
				.css({
					'background' : this.options.scrollbar_hover_color,
					'border' : this.options.scrollbar_hover_border
				});
				
			this.is_mouse_over_scroll_y = true;
		};
		
		Draggy.prototype.mouseoutScrollY = function(o, e) {
			if (!this.is_mouse_down_on_scroll_y) {
				var jq_o = $(o)
				.css({
					'background' : this.options.scrollbar_color,
					'border' : this.options.scrollbar_border
				});
			}
			
			this.is_mouse_over_scroll_y = false;
		};
		
		Draggy.prototype.mousedownScrollY = function(o, e) {
			var jq_o = $(o),
				top = jq_o.position().top + 2;
			
			this.is_mouse_down_on_scroll_y = true;
			this.scroll_top = top;
			this.mouse_down_point = {x:e.pageX,y:e.pageY};
		};
		
		Draggy.prototype.mouseupScrollY = function(o, e) {			
			if (!this.is_mouse_over_scroll_y) {
				var jq_o = $(o)
					.css({
						'background' : this.options.scrollbar_color,
						'border' : this.options.scrollbar_border
					});
			}
			this.is_mouse_down_on_scroll_y = false;
		};
		
		Draggy.prototype.mousemoveScrollY = function(o, e) {
			var jq_o = $(o),
				jq_parent = this.jq_parent,
				original_top = this.scroll_top,
				op = this.mouse_down_point,
				cp = {x:e.pageX,y:e.pageY},
				distance = {x:op.x-cp.x,y:op.y-cp.y},
				displacement_factor_y = this.displacement_factor_y,
				top = ( original_top - distance.y ) / displacement_factor_y;
			
			console.log('[mousemoveScrollY] setting top: '+top);
			
			jq_parent.scrollTop(top);
		};
		
		Draggy.prototype.mousemoveDoc = function(e) {
			var is_mouse_down_on_scroll_x = this.is_mouse_down_on_scroll_x,
				is_mouse_down_on_scroll_y = this.is_mouse_down_on_scroll_y,
				jq_scroll_x = this.jq_scroll_x,
				jq_scroll_y = this.jq_scroll_y,
				is_mouse_down = this.is_mouse_down;
			
			if (is_mouse_down) {
				this.mousemove(e);
			} else if (is_mouse_down_on_scroll_x) {
				this.mousemoveScroll(jq_scroll_x, e);
			} else if (is_mouse_down_on_scroll_y) {
				this.mousemoveScrollY(jq_scroll_y, e);
			}			
		};
		
		Draggy.prototype.mouseupDoc = function(e) {
			var is_mouse_down_on_scroll_x = this.is_mouse_down_on_scroll_x,
				is_mouse_down_on_scroll_y = this.is_mouse_down_on_scroll_y,
				jq_scroll_x = this.jq_scroll_x,
				jq_scroll_y = this.jq_scroll_y,
				is_mouse_down = this.is_mouse_down;
			
			if (is_mouse_down_on_scroll_x) {
				this.mouseupScroll(jq_scroll_x, e);
			}
			
			if (is_mouse_down_on_scroll_y) {
				this.mouseupScrollY(jq_scroll_y, e);
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
			}
		};
		
		Draggy.prototype.destroy = function(e) {
			alert('destroy invoked');
			var jq_doc = this.jq_doc,
				jq_parent = this.jq_parent,
				jq_target = this.jq_target,
				jq_scroll_container_x = this.jq_scroll_container_x,
				jq_scroll_container_y = this.jq_scroll_container_y;
			
			if (jq_scroll_container_x) {
				jq_scroll_container_x.remove();
			}
			
			if (jq_scroll_container_y) {
				jq_scroll_container_y.remove();
			}
			
			// unbind observers from global elements
			jq_target.unbind('mousedown', this.__mousedownTargetHandler);
			jq_parent.unbind('scroll', this.__scrollParentHandler);
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
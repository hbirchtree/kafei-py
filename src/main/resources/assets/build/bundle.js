
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Navbar.svelte generated by Svelte v3.18.2 */

    const file = "src/Navbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (75:8) {#each links as link (link.target)}
    function create_each_block_3(key_1, ctx) {
    	let a;
    	let h3;
    	let t_value = /*link*/ ctx[8].name + "";
    	let t;
    	let a_data_tab_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			h3 = element("h3");
    			t = text(t_value);
    			add_location(h3, file, 76, 16, 1687);
    			attr_dev(a, "data-tab", a_data_tab_value = /*link*/ ctx[8].target);
    			attr_dev(a, "class", "ui item svelte-3fkin8");
    			add_location(a, file, 75, 12, 1626);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, h3);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 1 && t_value !== (t_value = /*link*/ ctx[8].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*links*/ 1 && a_data_tab_value !== (a_data_tab_value = /*link*/ ctx[8].target)) {
    				attr_dev(a, "data-tab", a_data_tab_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(75:8) {#each links as link (link.target)}",
    		ctx
    	});

    	return block;
    }

    // (80:8) {#each externals as link (link.name)}
    function create_each_block_2(key_1, ctx) {
    	let a;
    	let h3;
    	let t0_value = /*link*/ ctx[8].name + "";
    	let t0;
    	let t1;
    	let i;
    	let a_href_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			i = element("i");
    			add_location(h3, file, 81, 16, 1856);
    			set_style(i, "margin-left", "0.4em");
    			attr_dev(i, "class", "icon external alternate");
    			add_location(i, file, 81, 37, 1877);
    			attr_dev(a, "class", "ui item svelte-3fkin8");
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[8].target);
    			add_location(a, file, 80, 12, 1799);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*externals*/ 2 && t0_value !== (t0_value = /*link*/ ctx[8].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*externals*/ 2 && a_href_value !== (a_href_value = /*link*/ ctx[8].target)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(80:8) {#each externals as link (link.name)}",
    		ctx
    	});

    	return block;
    }

    // (97:8) {#each links as link (link.target)}
    function create_each_block_1(key_1, ctx) {
    	let a;
    	let i;
    	let i_class_value;
    	let b;
    	let t_value = /*link*/ ctx[8].name + "";
    	let t;
    	let a_data_tab_value;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			b = element("b");
    			t = text(t_value);
    			attr_dev(i, "class", i_class_value = "large icon " + /*link*/ ctx[8].icon + " svelte-3fkin8");
    			add_location(i, file, 100, 16, 2654);
    			add_location(b, file, 100, 54, 2692);
    			attr_dev(a, "class", "ui item svelte-3fkin8");
    			attr_dev(a, "data-tab", a_data_tab_value = /*link*/ ctx[8].target);
    			add_location(a, file, 97, 12, 2499);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, b);
    			append_dev(b, t);
    			dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 1 && i_class_value !== (i_class_value = "large icon " + /*link*/ ctx[8].icon + " svelte-3fkin8")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*links*/ 1 && t_value !== (t_value = /*link*/ ctx[8].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*links*/ 1 && a_data_tab_value !== (a_data_tab_value = /*link*/ ctx[8].target)) {
    				attr_dev(a, "data-tab", a_data_tab_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(97:8) {#each links as link (link.target)}",
    		ctx
    	});

    	return block;
    }

    // (104:8) {#each externals as link (link.name)}
    function create_each_block(key_1, ctx) {
    	let a;
    	let i;
    	let b;
    	let t0_value = /*link*/ ctx[8].name + "";
    	let t0;
    	let t1;
    	let a_href_value;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(i, "class", "large icon external alternate svelte-3fkin8");
    			add_location(i, file, 107, 16, 2953);
    			add_location(b, file, 107, 61, 2998);
    			attr_dev(a, "class", "ui item svelte-3fkin8");
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[8].target);
    			add_location(a, file, 104, 12, 2802);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, b);
    			append_dev(b, t0);
    			append_dev(a, t1);
    			dispose = listen_dev(a, "click", /*click_handler_2*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*externals*/ 2 && t0_value !== (t0_value = /*link*/ ctx[8].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*externals*/ 2 && a_href_value !== (a_href_value = /*link*/ ctx[8].target)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(104:8) {#each externals as link (link.name)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let each_blocks_3 = [];
    	let each0_lookup = new Map();
    	let t0;
    	let each_blocks_2 = [];
    	let each1_lookup = new Map();
    	let t1;
    	let a0;
    	let img;
    	let img_src_value;
    	let a0_href_value;
    	let t2;
    	let div3;
    	let a1;
    	let i;
    	let t3;
    	let b;
    	let t5;
    	let div2;
    	let each_blocks_1 = [];
    	let each2_lookup = new Map();
    	let t6;
    	let each_blocks = [];
    	let each3_lookup = new Map();
    	let dispose;
    	let each_value_3 = /*links*/ ctx[0];
    	const get_key = ctx => /*link*/ ctx[8].target;
    	validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_3[i] = create_each_block_3(key, child_ctx));
    	}

    	let each_value_2 = /*externals*/ ctx[1];
    	const get_key_1 = ctx => /*link*/ ctx[8].name;
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_1);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks_2[i] = create_each_block_2(key, child_ctx));
    	}

    	let each_value_1 = /*links*/ ctx[0];
    	const get_key_2 = ctx => /*link*/ ctx[8].target;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_2);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key_2(child_ctx);
    		each2_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*externals*/ ctx[1];
    	const get_key_3 = ctx => /*link*/ ctx[8].name;
    	validate_each_keys(ctx, each_value, get_each_context, get_key_3);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_3(child_ctx);
    		each3_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();
    			a0 = element("a");
    			img = element("img");
    			t2 = space();
    			div3 = element("div");
    			a1 = element("a");
    			i = element("i");
    			t3 = space();
    			b = element("b");
    			b.textContent = "birchy.dev";
    			t5 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = /*github*/ ctx[2].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 85, 12, 2063);
    			attr_dev(a0, "href", a0_href_value = /*github*/ ctx[2].link);
    			attr_dev(a0, "class", "ui tiny circular image dootable svelte-3fkin8");
    			add_location(a0, file, 84, 8, 1986);
    			attr_dev(div0, "class", "ui container svelte-3fkin8");
    			add_location(div0, file, 73, 4, 1543);
    			attr_dev(div1, "class", "ui inverted menu desktop svelte-3fkin8");
    			add_location(div1, file, 72, 0, 1500);
    			set_style(i, "color", "white");
    			attr_dev(i, "class", "huge icon bars svelte-3fkin8");
    			add_location(i, file, 92, 8, 2287);
    			add_location(b, file, 93, 8, 2349);
    			attr_dev(a1, "class", "ui container horizontal fluid svelte-3fkin8");
    			add_location(a1, file, 91, 4, 2177);
    			attr_dev(div2, "class", "ui container mobile-links svelte-3fkin8");
    			add_location(div2, file, 95, 4, 2380);
    			attr_dev(div3, "class", "ui inverted vertical menu mobile fluid svelte-3fkin8");
    			add_location(div3, file, 90, 0, 2120);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div0, t1);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, a1);
    			append_dev(a1, i);
    			append_dev(a1, t3);
    			append_dev(a1, b);
    			append_dev(div3, t5);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div2, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			/*div2_binding*/ ctx[7](div2);
    			dispose = listen_dev(a1, "click", /*click_handler*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const each_value_3 = /*links*/ ctx[0];
    			validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);
    			each_blocks_3 = update_keyed_each(each_blocks_3, dirty, get_key, 1, ctx, each_value_3, each0_lookup, div0, destroy_block, create_each_block_3, t0, get_each_context_3);
    			const each_value_2 = /*externals*/ ctx[1];
    			validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_1);
    			each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key_1, 1, ctx, each_value_2, each1_lookup, div0, destroy_block, create_each_block_2, t1, get_each_context_2);

    			if (dirty & /*github*/ 4 && img.src !== (img_src_value = /*github*/ ctx[2].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*github*/ 4 && a0_href_value !== (a0_href_value = /*github*/ ctx[2].link)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			const each_value_1 = /*links*/ ctx[0];
    			validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_2);
    			each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_2, 1, ctx, each_value_1, each2_lookup, div2, destroy_block, create_each_block_1, t6, get_each_context_1);
    			const each_value = /*externals*/ ctx[1];
    			validate_each_keys(ctx, each_value, get_each_context, get_key_3);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key_3, 1, ctx, each_value, each3_lookup, div2, destroy_block, create_each_block, null, get_each_context);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].d();
    			}

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div2_binding*/ ctx[7](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { links } = $$props;
    	let { externals } = $$props;
    	let { github } = $$props;
    	let mobileMenu;
    	const writable_props = ["links", "externals", "github"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.$(mobileMenu).toggleClass("active");
    	const click_handler_1 = () => window.$(mobileMenu).removeClass("active");
    	const click_handler_2 = () => window.$(mobileMenu).removeClass("active");

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, mobileMenu = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("links" in $$props) $$invalidate(0, links = $$props.links);
    		if ("externals" in $$props) $$invalidate(1, externals = $$props.externals);
    		if ("github" in $$props) $$invalidate(2, github = $$props.github);
    	};

    	$$self.$capture_state = () => {
    		return { links, externals, github, mobileMenu };
    	};

    	$$self.$inject_state = $$props => {
    		if ("links" in $$props) $$invalidate(0, links = $$props.links);
    		if ("externals" in $$props) $$invalidate(1, externals = $$props.externals);
    		if ("github" in $$props) $$invalidate(2, github = $$props.github);
    		if ("mobileMenu" in $$props) $$invalidate(3, mobileMenu = $$props.mobileMenu);
    	};

    	return [
    		links,
    		externals,
    		github,
    		mobileMenu,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		div2_binding
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { links: 0, externals: 1, github: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*links*/ ctx[0] === undefined && !("links" in props)) {
    			console.warn("<Navbar> was created without expected prop 'links'");
    		}

    		if (/*externals*/ ctx[1] === undefined && !("externals" in props)) {
    			console.warn("<Navbar> was created without expected prop 'externals'");
    		}

    		if (/*github*/ ctx[2] === undefined && !("github" in props)) {
    			console.warn("<Navbar> was created without expected prop 'github'");
    		}
    	}

    	get links() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set links(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get externals() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set externals(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get github() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set github(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Code.svelte generated by Svelte v3.18.2 */

    const file$1 = "src/Code.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let code;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			code = element("code");
    			if (default_slot) default_slot.c();
    			attr_dev(code, "class", "svelte-1id91k9");
    			add_location(code, file$1, 19, 4, 385);
    			attr_dev(div, "class", "svelte-1id91k9");
    			add_location(div, file$1, 18, 0, 375);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, code);

    			if (default_slot) {
    				default_slot.m(code, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [$$scope, $$slots];
    }

    class Code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Code",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/UpdateBubble.svelte generated by Svelte v3.18.2 */

    const file$2 = "src/UpdateBubble.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;
    	let t0;
    	let div0;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");

    			if (!default_slot) {
    				t1 = text("Hello World!");
    			}

    			if (default_slot) default_slot.c();
    			attr_dev(img, "class", "bubble-image svelte-13vqwqv");
    			if (img.src !== (img_src_value = /*userInfo*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 52, 8, 1142);
    			attr_dev(a, "class", "bubble-image svelte-13vqwqv");
    			attr_dev(a, "href", a_href_value = /*userInfo*/ ctx[0].link);
    			add_location(a, file$2, 51, 4, 1086);
    			attr_dev(div0, "class", "bubble-listing svelte-13vqwqv");
    			add_location(div0, file$2, 54, 4, 1203);
    			attr_dev(div1, "class", "update-bubble svelte-13vqwqv");
    			add_location(div1, file$2, 50, 0, 1054);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a);
    			append_dev(a, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (!default_slot) {
    				append_dev(div0, t1);
    			}

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*userInfo*/ 1 && img.src !== (img_src_value = /*userInfo*/ ctx[0].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*userInfo*/ 1 && a_href_value !== (a_href_value = /*userInfo*/ ctx[0].link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { userInfo } = $$props;
    	const writable_props = ["userInfo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UpdateBubble> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("userInfo" in $$props) $$invalidate(0, userInfo = $$props.userInfo);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { userInfo };
    	};

    	$$self.$inject_state = $$props => {
    		if ("userInfo" in $$props) $$invalidate(0, userInfo = $$props.userInfo);
    	};

    	return [userInfo, $$scope, $$slots];
    }

    class UpdateBubble extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { userInfo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UpdateBubble",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*userInfo*/ ctx[0] === undefined && !("userInfo" in props)) {
    			console.warn("<UpdateBubble> was created without expected prop 'userInfo'");
    		}
    	}

    	get userInfo() {
    		throw new Error("<UpdateBubble>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userInfo(value) {
    		throw new Error("<UpdateBubble>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Badge.svelte generated by Svelte v3.18.2 */

    const file$3 = "src/Badge.svelte";

    // (15:0) {:else}
    function create_else_block(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = /*badgeUrl*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$3, 16, 4, 597);
    			attr_dev(a, "href", a_href_value = "https://github.com/" + /*repository*/ ctx[0] + "/releases/" + /*releaseInfo*/ ctx[1].release.tag_name);
    			add_location(a, file$3, 15, 0, 510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*repository, releaseInfo*/ 3 && a_href_value !== (a_href_value = "https://github.com/" + /*repository*/ ctx[0] + "/releases/" + /*releaseInfo*/ ctx[1].release.tag_name)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if releaseInfo === null}
    function create_if_block(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = /*badgeUrl*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$3, 12, 4, 472);
    			attr_dev(a, "href", a_href_value = "https://github.com/" + /*repository*/ ctx[0] + "/releases");
    			add_location(a, file$3, 11, 0, 416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*repository*/ 1 && a_href_value !== (a_href_value = "https://github.com/" + /*repository*/ ctx[0] + "/releases")) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(11:0) {#if releaseInfo === null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*releaseInfo*/ ctx[1] === null) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { repository } = $$props;
    	let { releaseInfo } = $$props;
    	let repoBasename = repository.split("/")[1];
    	let repoFlattened = repository.replace("/", "_");
    	let badgeUrl = `https://img.shields.io/badge/dynamic/json?color=success&label=${repoBasename}&query=%24.data.release.tag_name&url=https%3A%2F%2Fapi.birchy.dev%2Fgithub%2FlatestRelease%2F${repoFlattened}`;
    	const writable_props = ["repository", "releaseInfo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Badge> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("repository" in $$props) $$invalidate(0, repository = $$props.repository);
    		if ("releaseInfo" in $$props) $$invalidate(1, releaseInfo = $$props.releaseInfo);
    	};

    	$$self.$capture_state = () => {
    		return {
    			repository,
    			releaseInfo,
    			repoBasename,
    			repoFlattened,
    			badgeUrl
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("repository" in $$props) $$invalidate(0, repository = $$props.repository);
    		if ("releaseInfo" in $$props) $$invalidate(1, releaseInfo = $$props.releaseInfo);
    		if ("repoBasename" in $$props) repoBasename = $$props.repoBasename;
    		if ("repoFlattened" in $$props) repoFlattened = $$props.repoFlattened;
    		if ("badgeUrl" in $$props) $$invalidate(2, badgeUrl = $$props.badgeUrl);
    	};

    	return [repository, releaseInfo, badgeUrl];
    }

    class Badge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { repository: 0, releaseInfo: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Badge",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*repository*/ ctx[0] === undefined && !("repository" in props)) {
    			console.warn("<Badge> was created without expected prop 'repository'");
    		}

    		if (/*releaseInfo*/ ctx[1] === undefined && !("releaseInfo" in props)) {
    			console.warn("<Badge> was created without expected prop 'releaseInfo'");
    		}
    	}

    	get repository() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set repository(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get releaseInfo() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set releaseInfo(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Home.svelte generated by Svelte v3.18.2 */
    const file$4 = "src/Home.svelte";

    // (14:0) <UpdateBubble userInfo={github}>
    function create_default_slot_3(ctx) {
    	let p;
    	let b;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			b = element("b");
    			b.textContent = "username";
    			t1 = text(" hbirchtree");
    			t2 = text("\n    All my code is on GitHub");
    			add_location(b, file$4, 14, 7, 338);
    			add_location(p, file$4, 14, 4, 335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, b);
    			append_dev(p, t1);
    			insert_dev(target, t2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(14:0) <UpdateBubble userInfo={github}>",
    		ctx
    	});

    	return block;
    }

    // (31:0) <Code>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("git clone https://github.com/hbirchtree/coffeecutie.git");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(31:0) <Code>",
    		ctx
    	});

    	return block;
    }

    // (39:0) <Code>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("BUILD_MODE=bare ./cb quick-build [ubuntu.amd64, fedora.amd64, osx, ios.x86_64]");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(39:0) <Code>",
    		ctx
    	});

    	return block;
    }

    // (47:0) <Code>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("./cb quick-build [ubuntu.amd64, fedora.amd64]");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(47:0) <Code>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let t2;
    	let t3;
    	let h2;
    	let t5;
    	let p0;
    	let t7;
    	let t8;
    	let p1;
    	let t10;
    	let t11;
    	let p2;
    	let t13;
    	let current;

    	const updatebubble = new UpdateBubble({
    			props: {
    				userInfo: /*github*/ ctx[0],
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const badge0 = new Badge({
    			props: {
    				repository: "hbirchtree/coffeecutie",
    				releaseInfo: /*releaseInfo*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const badge1 = new Badge({
    			props: {
    				repository: "hbirchtree/coffeecutie-imgui",
    				releaseInfo: /*imguiReleaseInfo*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const badge2 = new Badge({
    			props: {
    				repository: "hbirchtree/native-library-bundle",
    				releaseInfo: /*nativeReleaseInfo*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const code0 = new Code({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const code1 = new Code({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const code2 = new Code({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(updatebubble.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(badge0.$$.fragment);
    			t1 = space();
    			create_component(badge1.$$.fragment);
    			t2 = space();
    			create_component(badge2.$$.fragment);
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Getting started";
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "Get started by cloning the source code";
    			t7 = space();
    			create_component(code0.$$.fragment);
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "If all your compilers and CMake are in order, you should be able to use the quick-build option as such";
    			t10 = space();
    			create_component(code1.$$.fragment);
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Additionally, if you don't want to set up compilers and etc., and you have Docker installed, you can go ahead with";
    			t13 = space();
    			create_component(code2.$$.fragment);
    			attr_dev(div, "class", "ui container inverted");
    			add_location(div, file$4, 18, 0, 415);
    			attr_dev(h2, "class", "ui header");
    			add_location(h2, file$4, 24, 0, 714);
    			add_location(p0, file$4, 26, 0, 758);
    			add_location(p1, file$4, 34, 0, 887);
    			add_location(p2, file$4, 42, 0, 1103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(updatebubble, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(badge0, div, null);
    			append_dev(div, t1);
    			mount_component(badge1, div, null);
    			append_dev(div, t2);
    			mount_component(badge2, div, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(code0, target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(code1, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(code2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const updatebubble_changes = {};
    			if (dirty & /*github*/ 1) updatebubble_changes.userInfo = /*github*/ ctx[0];

    			if (dirty & /*$$scope*/ 32) {
    				updatebubble_changes.$$scope = { dirty, ctx };
    			}

    			updatebubble.$set(updatebubble_changes);
    			const badge0_changes = {};
    			if (dirty & /*releaseInfo*/ 2) badge0_changes.releaseInfo = /*releaseInfo*/ ctx[1];
    			badge0.$set(badge0_changes);
    			const badge1_changes = {};
    			if (dirty & /*imguiReleaseInfo*/ 4) badge1_changes.releaseInfo = /*imguiReleaseInfo*/ ctx[2];
    			badge1.$set(badge1_changes);
    			const badge2_changes = {};
    			if (dirty & /*nativeReleaseInfo*/ 8) badge2_changes.releaseInfo = /*nativeReleaseInfo*/ ctx[3];
    			badge2.$set(badge2_changes);
    			const code0_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				code0_changes.$$scope = { dirty, ctx };
    			}

    			code0.$set(code0_changes);
    			const code1_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				code1_changes.$$scope = { dirty, ctx };
    			}

    			code1.$set(code1_changes);
    			const code2_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				code2_changes.$$scope = { dirty, ctx };
    			}

    			code2.$set(code2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(updatebubble.$$.fragment, local);
    			transition_in(badge0.$$.fragment, local);
    			transition_in(badge1.$$.fragment, local);
    			transition_in(badge2.$$.fragment, local);
    			transition_in(code0.$$.fragment, local);
    			transition_in(code1.$$.fragment, local);
    			transition_in(code2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(updatebubble.$$.fragment, local);
    			transition_out(badge0.$$.fragment, local);
    			transition_out(badge1.$$.fragment, local);
    			transition_out(badge2.$$.fragment, local);
    			transition_out(code0.$$.fragment, local);
    			transition_out(code1.$$.fragment, local);
    			transition_out(code2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(updatebubble, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(badge0);
    			destroy_component(badge1);
    			destroy_component(badge2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t7);
    			destroy_component(code0, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t10);
    			destroy_component(code1, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t13);
    			destroy_component(code2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { github } = $$props;
    	let { endpoints } = $$props;
    	let { releaseInfo } = $$props;
    	let { imguiReleaseInfo } = $$props;
    	let { nativeReleaseInfo } = $$props;
    	const writable_props = ["github", "endpoints", "releaseInfo", "imguiReleaseInfo", "nativeReleaseInfo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("github" in $$props) $$invalidate(0, github = $$props.github);
    		if ("endpoints" in $$props) $$invalidate(4, endpoints = $$props.endpoints);
    		if ("releaseInfo" in $$props) $$invalidate(1, releaseInfo = $$props.releaseInfo);
    		if ("imguiReleaseInfo" in $$props) $$invalidate(2, imguiReleaseInfo = $$props.imguiReleaseInfo);
    		if ("nativeReleaseInfo" in $$props) $$invalidate(3, nativeReleaseInfo = $$props.nativeReleaseInfo);
    	};

    	$$self.$capture_state = () => {
    		return {
    			github,
    			endpoints,
    			releaseInfo,
    			imguiReleaseInfo,
    			nativeReleaseInfo
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("github" in $$props) $$invalidate(0, github = $$props.github);
    		if ("endpoints" in $$props) $$invalidate(4, endpoints = $$props.endpoints);
    		if ("releaseInfo" in $$props) $$invalidate(1, releaseInfo = $$props.releaseInfo);
    		if ("imguiReleaseInfo" in $$props) $$invalidate(2, imguiReleaseInfo = $$props.imguiReleaseInfo);
    		if ("nativeReleaseInfo" in $$props) $$invalidate(3, nativeReleaseInfo = $$props.nativeReleaseInfo);
    	};

    	return [github, releaseInfo, imguiReleaseInfo, nativeReleaseInfo, endpoints];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			github: 0,
    			endpoints: 4,
    			releaseInfo: 1,
    			imguiReleaseInfo: 2,
    			nativeReleaseInfo: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*github*/ ctx[0] === undefined && !("github" in props)) {
    			console.warn("<Home> was created without expected prop 'github'");
    		}

    		if (/*endpoints*/ ctx[4] === undefined && !("endpoints" in props)) {
    			console.warn("<Home> was created without expected prop 'endpoints'");
    		}

    		if (/*releaseInfo*/ ctx[1] === undefined && !("releaseInfo" in props)) {
    			console.warn("<Home> was created without expected prop 'releaseInfo'");
    		}

    		if (/*imguiReleaseInfo*/ ctx[2] === undefined && !("imguiReleaseInfo" in props)) {
    			console.warn("<Home> was created without expected prop 'imguiReleaseInfo'");
    		}

    		if (/*nativeReleaseInfo*/ ctx[3] === undefined && !("nativeReleaseInfo" in props)) {
    			console.warn("<Home> was created without expected prop 'nativeReleaseInfo'");
    		}
    	}

    	get github() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set github(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get endpoints() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set endpoints(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get releaseInfo() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set releaseInfo(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imguiReleaseInfo() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imguiReleaseInfo(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nativeReleaseInfo() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nativeReleaseInfo(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Graph.svelte generated by Svelte v3.18.2 */

    const { console: console_1 } = globals;
    const file$5 = "src/Graph.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let h3;
    	let t0;
    	let t1;
    	let div0;
    	let canvas_1;
    	let t2;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			canvas_1 = element("canvas");
    			t2 = space();
    			p = element("p");
    			p.textContent = "(Sorry, these graphs don't really work on mobile)";
    			attr_dev(h3, "class", "ui header inverted");
    			add_location(h3, file$5, 64, 4, 1565);
    			add_location(canvas_1, file$5, 66, 8, 1660);
    			attr_dev(div0, "class", "ui segment fluid desktop svelte-m3abcf");
    			add_location(div0, file$5, 65, 4, 1613);
    			attr_dev(p, "class", "mobile svelte-m3abcf");
    			add_location(p, file$5, 68, 4, 1712);
    			attr_dev(div1, "class", "ui segment inverted raised");
    			add_location(div1, file$5, 63, 0, 1520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, canvas_1);
    			/*canvas_1_binding*/ ctx[8](canvas_1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*canvas_1_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { source } = $$props;
    	let { sourceKey } = $$props;
    	let { chartType } = $$props;
    	let { endpoints } = $$props;
    	let { title } = $$props;
    	let canvas;

    	async function get_json_data(source) {
    		return fetch(endpoints.data + source).then(content => {
    			return content.json();
    		}).then(content => {
    			return content;
    		}).catch(err => {
    			console.log(err);
    		});
    	}

    	async function create_graph() {
    		let glabels = [];
    		let gcounts = [];
    		const data = (await get_json_data(source)).data;

    		data.forEach(datapoint => {
    			glabels = glabels.concat(datapoint[sourceKey]);
    			gcounts = gcounts.concat(datapoint.count);
    		});

    		const context = canvas.getContext("2d");

    		const chart = new Chart(context,
    		{
    				type: chartType,
    				data: {
    					labels: glabels,
    					datasets: [
    						{
    							label: "Count",
    							data: gcounts,
    							backgroundColor: "rgba(50, 50, 224, 0.5)"
    						}
    					]
    				}
    			});
    	}

    	create_graph();
    	const writable_props = ["source", "sourceKey", "chartType", "endpoints", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Graph> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, canvas = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("source" in $$props) $$invalidate(2, source = $$props.source);
    		if ("sourceKey" in $$props) $$invalidate(3, sourceKey = $$props.sourceKey);
    		if ("chartType" in $$props) $$invalidate(4, chartType = $$props.chartType);
    		if ("endpoints" in $$props) $$invalidate(5, endpoints = $$props.endpoints);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => {
    		return {
    			source,
    			sourceKey,
    			chartType,
    			endpoints,
    			title,
    			canvas
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("source" in $$props) $$invalidate(2, source = $$props.source);
    		if ("sourceKey" in $$props) $$invalidate(3, sourceKey = $$props.sourceKey);
    		if ("chartType" in $$props) $$invalidate(4, chartType = $$props.chartType);
    		if ("endpoints" in $$props) $$invalidate(5, endpoints = $$props.endpoints);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("canvas" in $$props) $$invalidate(1, canvas = $$props.canvas);
    	};

    	return [
    		title,
    		canvas,
    		source,
    		sourceKey,
    		chartType,
    		endpoints,
    		get_json_data,
    		create_graph,
    		canvas_1_binding
    	];
    }

    class Graph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			source: 2,
    			sourceKey: 3,
    			chartType: 4,
    			endpoints: 5,
    			title: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graph",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*source*/ ctx[2] === undefined && !("source" in props)) {
    			console_1.warn("<Graph> was created without expected prop 'source'");
    		}

    		if (/*sourceKey*/ ctx[3] === undefined && !("sourceKey" in props)) {
    			console_1.warn("<Graph> was created without expected prop 'sourceKey'");
    		}

    		if (/*chartType*/ ctx[4] === undefined && !("chartType" in props)) {
    			console_1.warn("<Graph> was created without expected prop 'chartType'");
    		}

    		if (/*endpoints*/ ctx[5] === undefined && !("endpoints" in props)) {
    			console_1.warn("<Graph> was created without expected prop 'endpoints'");
    		}

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console_1.warn("<Graph> was created without expected prop 'title'");
    		}
    	}

    	get source() {
    		throw new Error("<Graph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<Graph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sourceKey() {
    		throw new Error("<Graph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sourceKey(value) {
    		throw new Error("<Graph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chartType() {
    		throw new Error("<Graph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chartType(value) {
    		throw new Error("<Graph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get endpoints() {
    		throw new Error("<Graph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set endpoints(value) {
    		throw new Error("<Graph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Graph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Graph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Statistics.svelte generated by Svelte v3.18.2 */
    const file$6 = "src/Statistics.svelte";

    // (17:0) <Code>
    function create_default_slot_1$1(ctx) {
    	let t0;
    	let t1_value = /*endpoints*/ ctx[0].profiler + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("COFFEE_REPORT_URL=");
    			t1 = text(t1_value);
    			t2 = text(" <program>");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*endpoints*/ 1 && t1_value !== (t1_value = /*endpoints*/ ctx[0].profiler + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(17:0) <Code>",
    		ctx
    	});

    	return block;
    }

    // (25:0) <Code>
    function create_default_slot$1(ctx) {
    	let t0;
    	let t1_value = /*endpoints*/ ctx[0].profiler + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("adb shell am start -n <com.package/.Activity> --es COFFEE_REPORT_URL ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*endpoints*/ 1 && t1_value !== (t1_value = /*endpoints*/ ctx[0].profiler + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(25:0) <Code>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let p0;
    	let t1;
    	let t2;
    	let p1;
    	let t4;
    	let t5;
    	let div;
    	let t6;
    	let current;

    	const code0 = new Code({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const code1 = new Code({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const graph0 = new Graph({
    			props: {
    				endpoints: /*endpoints*/ ctx[0],
    				title: "Operating Systems",
    				source: "/v1/statistics/os",
    				sourceKey: "system",
    				chartType: "doughnut"
    			},
    			$$inline: true
    		});

    	const graph1 = new Graph({
    			props: {
    				endpoints: /*endpoints*/ ctx[0],
    				title: "Architectures",
    				source: "/v1/statistics/arch",
    				sourceKey: "architecture",
    				chartType: "doughnut"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "These numbers are collected from devices sending runtime reports. This is made possible by embedding a profiler in the application, activated by the following arguments/variables:";
    			t1 = space();
    			create_component(code0.$$.fragment);
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "For Android, it may be invoked by starting it with extra strings:";
    			t4 = space();
    			create_component(code1.$$.fragment);
    			t5 = space();
    			div = element("div");
    			create_component(graph0.$$.fragment);
    			t6 = space();
    			create_component(graph1.$$.fragment);
    			add_location(p0, file$6, 12, 0, 337);
    			add_location(p1, file$6, 20, 0, 606);
    			attr_dev(div, "class", "ui stacked segments");
    			add_location(div, file$6, 28, 0, 802);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(code0, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(code1, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(graph0, div, null);
    			append_dev(div, t6);
    			mount_component(graph1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const code0_changes = {};

    			if (dirty & /*$$scope, endpoints*/ 3) {
    				code0_changes.$$scope = { dirty, ctx };
    			}

    			code0.$set(code0_changes);
    			const code1_changes = {};

    			if (dirty & /*$$scope, endpoints*/ 3) {
    				code1_changes.$$scope = { dirty, ctx };
    			}

    			code1.$set(code1_changes);
    			const graph0_changes = {};
    			if (dirty & /*endpoints*/ 1) graph0_changes.endpoints = /*endpoints*/ ctx[0];
    			graph0.$set(graph0_changes);
    			const graph1_changes = {};
    			if (dirty & /*endpoints*/ 1) graph1_changes.endpoints = /*endpoints*/ ctx[0];
    			graph1.$set(graph1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(code0.$$.fragment, local);
    			transition_in(code1.$$.fragment, local);
    			transition_in(graph0.$$.fragment, local);
    			transition_in(graph1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(code0.$$.fragment, local);
    			transition_out(code1.$$.fragment, local);
    			transition_out(graph0.$$.fragment, local);
    			transition_out(graph1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			destroy_component(code0, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			destroy_component(code1, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div);
    			destroy_component(graph0);
    			destroy_component(graph1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { endpoints } = $$props;
    	const writable_props = ["endpoints"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Statistics> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("endpoints" in $$props) $$invalidate(0, endpoints = $$props.endpoints);
    	};

    	$$self.$capture_state = () => {
    		return { endpoints };
    	};

    	$$self.$inject_state = $$props => {
    		if ("endpoints" in $$props) $$invalidate(0, endpoints = $$props.endpoints);
    	};

    	return [endpoints];
    }

    class Statistics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { endpoints: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Statistics",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*endpoints*/ ctx[0] === undefined && !("endpoints" in props)) {
    			console.warn("<Statistics> was created without expected prop 'endpoints'");
    		}
    	}

    	get endpoints() {
    		throw new Error("<Statistics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set endpoints(value) {
    		throw new Error("<Statistics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Examples.svelte generated by Svelte v3.18.2 */
    const file$7 = "src/Examples.svelte";

    // (23:0) {:else}
    function create_else_block_1(ctx) {
    	let current;

    	const updatebubble = new UpdateBubble({
    			props: {
    				userInfo: /*github*/ ctx[0],
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(updatebubble.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(updatebubble, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const updatebubble_changes = {};
    			if (dirty & /*github*/ 1) updatebubble_changes.userInfo = /*github*/ ctx[0];

    			if (dirty & /*$$scope*/ 16) {
    				updatebubble_changes.$$scope = { dirty, ctx };
    			}

    			updatebubble.$set(updatebubble_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(updatebubble.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(updatebubble.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(updatebubble, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(23:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:0) {#if releaseInfo !== null && commitInfo !== null }
    function create_if_block_1(ctx) {
    	let current;

    	const updatebubble = new UpdateBubble({
    			props: {
    				userInfo: /*github*/ ctx[0],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(updatebubble.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(updatebubble, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const updatebubble_changes = {};
    			if (dirty & /*github*/ 1) updatebubble_changes.userInfo = /*github*/ ctx[0];

    			if (dirty & /*$$scope, commitInfo*/ 20) {
    				updatebubble_changes.$$scope = { dirty, ctx };
    			}

    			updatebubble.$set(updatebubble_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(updatebubble.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(updatebubble.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(updatebubble, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(10:0) {#if releaseInfo !== null && commitInfo !== null }",
    		ctx
    	});

    	return block;
    }

    // (24:4) <UpdateBubble userInfo={github}>
    function create_default_slot_1$2(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "ui loader");
    			add_location(div0, file$7, 25, 12, 713);
    			attr_dev(div1, "class", "ui active dimmer");
    			add_location(div1, file$7, 24, 8, 670);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(24:4) <UpdateBubble userInfo={github}>",
    		ctx
    	});

    	return block;
    }

    // (11:4) <UpdateBubble userInfo={github}>
    function create_default_slot$2(ctx) {
    	let p0;
    	let b0;
    	let t1;
    	let t2_value = /*commitInfo*/ ctx[2].head_commit.timestamp + "";
    	let t2;
    	let t3;
    	let b1;
    	let t5;
    	let t6_value = /*commitInfo*/ ctx[2].head_commit.id.substr(0, 10) + "";
    	let t6;
    	let t7;
    	let p1;
    	let b2;
    	let t9;
    	let t10_value = /*commitInfo*/ ctx[2].ref + "";
    	let t10;
    	let t11;
    	let div;
    	let raw_value = /*commitInfo*/ ctx[2].head_commit.message.split("\n").join("</br>") + "";

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "updated";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			b1 = element("b");
    			b1.textContent = "hash";
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			b2 = element("b");
    			b2.textContent = "branch";
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			div = element("div");
    			add_location(b0, file$7, 12, 12, 292);
    			add_location(b1, file$7, 13, 12, 355);
    			add_location(p0, file$7, 11, 8, 276);
    			add_location(b2, file$7, 16, 12, 447);
    			add_location(p1, file$7, 15, 8, 431);
    			add_location(div, file$7, 18, 8, 499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, b1);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, b2);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*commitInfo*/ 4 && t2_value !== (t2_value = /*commitInfo*/ ctx[2].head_commit.timestamp + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*commitInfo*/ 4 && t6_value !== (t6_value = /*commitInfo*/ ctx[2].head_commit.id.substr(0, 10) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*commitInfo*/ 4 && t10_value !== (t10_value = /*commitInfo*/ ctx[2].ref + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*commitInfo*/ 4 && raw_value !== (raw_value = /*commitInfo*/ ctx[2].head_commit.message.split("\n").join("</br>") + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(11:4) <UpdateBubble userInfo={github}>",
    		ctx
    	});

    	return block;
    }

    // (42:4) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "ui loader");
    			add_location(div0, file$7, 43, 12, 1197);
    			attr_dev(div1, "class", "ui active dimmer");
    			add_location(div1, file$7, 42, 8, 1154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(42:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#if releaseInfo !== null}
    function create_if_block$1(ctx) {
    	let li;
    	let a;
    	let i;
    	let t0;
    	let t1_value = /*releaseInfo*/ ctx[1].release.tag_name + "";
    	let t1;
    	let t2;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			i = element("i");
    			t0 = text("Latest release (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(i, "class", "big icon box");
    			add_location(i, file$7, 39, 12, 1040);
    			attr_dev(a, "href", a_href_value = /*releaseInfo*/ ctx[1].release.html_url);
    			add_location(a, file$7, 38, 12, 986);
    			add_location(li, file$7, 38, 8, 982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, i);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*releaseInfo*/ 2 && t1_value !== (t1_value = /*releaseInfo*/ ctx[1].release.tag_name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*releaseInfo*/ 2 && a_href_value !== (a_href_value = /*releaseInfo*/ ctx[1].release.html_url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(38:4) {#if releaseInfo !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let h2;
    	let t2;
    	let p;
    	let t4;
    	let ul;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*releaseInfo*/ ctx[1] !== null && /*commitInfo*/ ctx[2] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*releaseInfo*/ ctx[1] !== null) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Downloadable examples";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Every release generates downloadable binaries for Linux and macOS platforms, found here:";
    			t4 = space();
    			ul = element("ul");
    			if_block1.c();
    			attr_dev(h2, "class", "ui header");
    			add_location(h2, file$7, 30, 0, 785);
    			add_location(p, file$7, 32, 0, 835);
    			add_location(ul, file$7, 36, 0, 938);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, ul, anchor);
    			if_block1.m(ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(ul);
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { github } = $$props;
    	let { repository } = $$props;
    	let { releaseInfo } = $$props;
    	let { commitInfo } = $$props;
    	const writable_props = ["github", "repository", "releaseInfo", "commitInfo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Examples> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("github" in $$props) $$invalidate(0, github = $$props.github);
    		if ("repository" in $$props) $$invalidate(3, repository = $$props.repository);
    		if ("releaseInfo" in $$props) $$invalidate(1, releaseInfo = $$props.releaseInfo);
    		if ("commitInfo" in $$props) $$invalidate(2, commitInfo = $$props.commitInfo);
    	};

    	$$self.$capture_state = () => {
    		return {
    			github,
    			repository,
    			releaseInfo,
    			commitInfo
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("github" in $$props) $$invalidate(0, github = $$props.github);
    		if ("repository" in $$props) $$invalidate(3, repository = $$props.repository);
    		if ("releaseInfo" in $$props) $$invalidate(1, releaseInfo = $$props.releaseInfo);
    		if ("commitInfo" in $$props) $$invalidate(2, commitInfo = $$props.commitInfo);
    	};

    	return [github, releaseInfo, commitInfo, repository];
    }

    class Examples extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			github: 0,
    			repository: 3,
    			releaseInfo: 1,
    			commitInfo: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Examples",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*github*/ ctx[0] === undefined && !("github" in props)) {
    			console.warn("<Examples> was created without expected prop 'github'");
    		}

    		if (/*repository*/ ctx[3] === undefined && !("repository" in props)) {
    			console.warn("<Examples> was created without expected prop 'repository'");
    		}

    		if (/*releaseInfo*/ ctx[1] === undefined && !("releaseInfo" in props)) {
    			console.warn("<Examples> was created without expected prop 'releaseInfo'");
    		}

    		if (/*commitInfo*/ ctx[2] === undefined && !("commitInfo" in props)) {
    			console.warn("<Examples> was created without expected prop 'commitInfo'");
    		}
    	}

    	get github() {
    		throw new Error("<Examples>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set github(value) {
    		throw new Error("<Examples>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get repository() {
    		throw new Error("<Examples>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set repository(value) {
    		throw new Error("<Examples>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get releaseInfo() {
    		throw new Error("<Examples>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set releaseInfo(value) {
    		throw new Error("<Examples>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get commitInfo() {
    		throw new Error("<Examples>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set commitInfo(value) {
    		throw new Error("<Examples>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/crash/Group.svelte generated by Svelte v3.18.2 */

    const file$8 = "src/crash/Group.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let h4;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			i = element("i");
    			t0 = space();
    			t1 = text(/*headerName*/ ctx[1]);
    			t2 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "class", i_class_value = "" + (/*icon*/ ctx[0] + " icon"));
    			add_location(i, file$8, 7, 8, 167);
    			attr_dev(h4, "class", "ui horizontal divider header inverted");
    			add_location(h4, file$8, 6, 4, 108);
    			attr_dev(div0, "class", "ui divided internally celled centered grid inverted");
    			add_location(div0, file$8, 10, 4, 230);
    			attr_dev(div1, "class", "ui container inverted");
    			add_location(div1, file$8, 5, 0, 68);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(h4, i);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*icon*/ 1 && i_class_value !== (i_class_value = "" + (/*icon*/ ctx[0] + " icon"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*headerName*/ 2) set_data_dev(t1, /*headerName*/ ctx[1]);

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { icon } = $$props;
    	let { headerName } = $$props;
    	const writable_props = ["icon", "headerName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Group> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("headerName" in $$props) $$invalidate(1, headerName = $$props.headerName);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { icon, headerName };
    	};

    	$$self.$inject_state = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("headerName" in $$props) $$invalidate(1, headerName = $$props.headerName);
    	};

    	return [icon, headerName, $$scope, $$slots];
    }

    class Group extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { icon: 0, headerName: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Group",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<Group> was created without expected prop 'icon'");
    		}

    		if (/*headerName*/ ctx[1] === undefined && !("headerName" in props)) {
    			console.warn("<Group> was created without expected prop 'headerName'");
    		}
    	}

    	get icon() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerName() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerName(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/crash/Row.svelte generated by Svelte v3.18.2 */

    const file$9 = "src/crash/Row.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_name_slot_changes = dirty => ({});
    const get_name_slot_context = ctx => ({});

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let h5;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let current;
    	const name_slot_template = /*$$slots*/ ctx[3].name;
    	const name_slot = create_slot(name_slot_template, ctx, /*$$scope*/ ctx[2], get_name_slot_context);
    	const content_slot_template = /*$$slots*/ ctx[3].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[2], get_content_slot_context);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			if (!name_slot) {
    				h5 = element("h5");
    				t0 = text(/*name*/ ctx[0]);
    			}

    			if (name_slot) name_slot.c();
    			t1 = space();
    			div1 = element("div");

    			if (!content_slot) {
    				t2 = text(/*content*/ ctx[1]);
    			}

    			if (content_slot) content_slot.c();

    			if (!name_slot) {
    				attr_dev(h5, "class", "ui header inverted");
    				add_location(h5, file$9, 8, 12, 207);
    			}

    			attr_dev(div0, "class", "ui right aligned four wide column header inverted");
    			add_location(div0, file$9, 6, 4, 104);
    			attr_dev(div1, "class", "ui ten wide column inverted");
    			add_location(div1, file$9, 11, 4, 281);
    			attr_dev(div2, "class", "ui row inverted");
    			add_location(div2, file$9, 5, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			if (!name_slot) {
    				append_dev(div0, h5);
    				append_dev(h5, t0);
    			}

    			if (name_slot) {
    				name_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (!content_slot) {
    				append_dev(div1, t2);
    			}

    			if (content_slot) {
    				content_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!name_slot) {
    				if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			}

    			if (name_slot && name_slot.p && dirty & /*$$scope*/ 4) {
    				name_slot.p(get_slot_context(name_slot_template, ctx, /*$$scope*/ ctx[2], get_name_slot_context), get_slot_changes(name_slot_template, /*$$scope*/ ctx[2], dirty, get_name_slot_changes));
    			}

    			if (!content_slot) {
    				if (!current || dirty & /*content*/ 2) set_data_dev(t2, /*content*/ ctx[1]);
    			}

    			if (content_slot && content_slot.p && dirty & /*$$scope*/ 4) {
    				content_slot.p(get_slot_context(content_slot_template, ctx, /*$$scope*/ ctx[2], get_content_slot_context), get_slot_changes(content_slot_template, /*$$scope*/ ctx[2], dirty, get_content_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(name_slot, local);
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(name_slot, local);
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (name_slot) name_slot.d(detaching);
    			if (content_slot) content_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { content = "" } = $$props;
    	const writable_props = ["name", "content"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("content" in $$props) $$invalidate(1, content = $$props.content);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { name, content };
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("content" in $$props) $$invalidate(1, content = $$props.content);
    	};

    	return [name, content, $$scope, $$slots];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { name: 0, content: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Row> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/crash/ReportView.svelte generated by Svelte v3.18.2 */
    const file$a = "src/crash/ReportView.svelte";

    // (9:0) <Group icon="box" headerName="General Info">
    function create_default_slot_6(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "submission time",
    				content: new Date(/*summary*/ ctx[1].submitTime).toGMTString()
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*summary*/ 2) row_changes.content = new Date(/*summary*/ ctx[1].submitTime).toGMTString();
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(9:0) <Group icon=\\\"box\\\" headerName=\\\"General Info\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Group icon="box" headerName="Application">
    function create_default_slot_5(ctx) {
    	let t0;
    	let t1;
    	let current;

    	const row0 = new Row({
    			props: {
    				name: "name",
    				content: /*report*/ ctx[0].application.name
    			},
    			$$inline: true
    		});

    	const row1 = new Row({
    			props: {
    				name: "writer",
    				content: /*report*/ ctx[0].application.organization
    			},
    			$$inline: true
    		});

    	const row2 = new Row({
    			props: {
    				name: "version",
    				content: /*report*/ ctx[0].application.version
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t0 = space();
    			create_component(row1.$$.fragment);
    			t1 = space();
    			create_component(row2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};
    			if (dirty & /*report*/ 1) row0_changes.content = /*report*/ ctx[0].application.name;
    			row0.$set(row0_changes);
    			const row1_changes = {};
    			if (dirty & /*report*/ 1) row1_changes.content = /*report*/ ctx[0].application.organization;
    			row1.$set(row1_changes);
    			const row2_changes = {};
    			if (dirty & /*report*/ 1) row2_changes.content = /*report*/ ctx[0].application.version;
    			row2.$set(row2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(row2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(row2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(row2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(12:0) <Group icon=\\\"box\\\" headerName=\\\"Application\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if report.build.target}
    function create_if_block_9(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "compiled for",
    				content: /*report*/ ctx[0].build.target
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = /*report*/ ctx[0].build.target;
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(20:4) {#if report.build.target}",
    		ctx
    	});

    	return block;
    }

    // (17:0) <Group icon="cog" headerName="Build">
    function create_default_slot_4(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const row0 = new Row({
    			props: {
    				name: "mode",
    				content: /*report*/ ctx[0].build.buildMode
    			},
    			$$inline: true
    		});

    	const row1 = new Row({
    			props: {
    				name: "version",
    				content: /*report*/ ctx[0].build.version
    			},
    			$$inline: true
    		});

    	let if_block = /*report*/ ctx[0].build.target && create_if_block_9(ctx);

    	const row2 = new Row({
    			props: {
    				name: "compiler",
    				content: "" + (/*report*/ ctx[0].build.compiler + " " + (/*report*/ ctx[0].build.compilerVersion
    				? /*report*/ ctx[0].build.compilerVersion
    				: ""))
    			},
    			$$inline: true
    		});

    	const row3 = new Row({
    			props: {
    				name: "architecture",
    				content: /*report*/ ctx[0].build.architecture
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t0 = space();
    			create_component(row1.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(row2.$$.fragment);
    			t3 = space();
    			create_component(row3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(row2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(row3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};
    			if (dirty & /*report*/ 1) row0_changes.content = /*report*/ ctx[0].build.buildMode;
    			row0.$set(row0_changes);
    			const row1_changes = {};
    			if (dirty & /*report*/ 1) row1_changes.content = /*report*/ ctx[0].build.version;
    			row1.$set(row1_changes);

    			if (/*report*/ ctx[0].build.target) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t2.parentNode, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const row2_changes = {};

    			if (dirty & /*report*/ 1) row2_changes.content = "" + (/*report*/ ctx[0].build.compiler + " " + (/*report*/ ctx[0].build.compilerVersion
    			? /*report*/ ctx[0].build.compilerVersion
    			: ""));

    			row2.$set(row2_changes);
    			const row3_changes = {};
    			if (dirty & /*report*/ 1) row3_changes.content = /*report*/ ctx[0].build.architecture;
    			row3.$set(row3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(row2.$$.fragment, local);
    			transition_in(row3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(row2.$$.fragment, local);
    			transition_out(row3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(row2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(row3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(17:0) <Group icon=\\\"cog\\\" headerName=\\\"Build\\\">",
    		ctx
    	});

    	return block;
    }

    // (44:4) {:else}
    function create_else_block$2(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "system",
    				content: /*report*/ ctx[0].runtime.system.split(" (")[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = /*report*/ ctx[0].runtime.system.split(" (")[0];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(44:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if report.runtime.distro && report.runtime.distroVersion}
    function create_if_block_8(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "system",
    				content: "",
    				$$slots: {
    					default: [create_default_slot_3$1],
    					content: [create_content_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope, report*/ 5) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(33:4) {#if report.runtime.distro && report.runtime.distroVersion}",
    		ctx
    	});

    	return block;
    }

    // (35:12) <p slot="content">
    function create_content_slot(ctx) {
    	let p;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*report*/ ctx[0].runtime.distro + "";
    	let t1;
    	let t2;
    	let t3_value = /*report*/ ctx[0].runtime.distroVersion + "";
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);

    			attr_dev(i, "class", i_class_value = "circular inverted blue icon " + (/*report*/ ctx[0].runtime.distro == "Android"
    			? "android"
    			: /*report*/ ctx[0].runtime.distro == "macOS"
    				? "apple"
    				: /*report*/ ctx[0].runtime.distro == "iOS"
    					? "apple"
    					: /*report*/ ctx[0].runtime.kernel == "Linux"
    						? "linux"
    						: /*report*/ ctx[0].runtime.kernel == "Windows"
    							? "windows"
    							: "hdd"));

    			add_location(i, file$a, 35, 16, 1484);
    			attr_dev(p, "slot", "content");
    			add_location(p, file$a, 34, 12, 1449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*report*/ 1 && i_class_value !== (i_class_value = "circular inverted blue icon " + (/*report*/ ctx[0].runtime.distro == "Android"
    			? "android"
    			: /*report*/ ctx[0].runtime.distro == "macOS"
    				? "apple"
    				: /*report*/ ctx[0].runtime.distro == "iOS"
    					? "apple"
    					: /*report*/ ctx[0].runtime.kernel == "Linux"
    						? "linux"
    						: /*report*/ ctx[0].runtime.kernel == "Windows"
    							? "windows"
    							: "hdd"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*report*/ 1 && t1_value !== (t1_value = /*report*/ ctx[0].runtime.distro + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*report*/ 1 && t3_value !== (t3_value = /*report*/ ctx[0].runtime.distroVersion + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(35:12) <p slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (34:8) <Row name="system" content="">
    function create_default_slot_3$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(34:8) <Row name=\\\"system\\\" content=\\\"\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if report.runtime.kernel && report.runtime.kernelVersion}
    function create_if_block_7(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "kernel",
    				content: "" + (/*report*/ ctx[0].runtime.kernel + " " + /*report*/ ctx[0].runtime.kernelVersion)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = "" + (/*report*/ ctx[0].runtime.kernel + " " + /*report*/ ctx[0].runtime.kernelVersion);
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(49:4) {#if report.runtime.kernel && report.runtime.kernelVersion}",
    		ctx
    	});

    	return block;
    }

    // (26:0) <Group headerName="System"        icon="{report.device.type == 4 ? "mobile alternate" :                  report.device.type == 3 ? "laptop" :                 report.device.type == 2 ? "microchip" :                 report.device.type == 5 ? "tablet alternate" :                 report.device.type == 8 ? "hdd" :                 "server"}">
    function create_default_slot_2$1(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_8, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*report*/ ctx[0].runtime.distro && /*report*/ ctx[0].runtime.distroVersion) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const row0 = new Row({
    			props: {
    				name: "architecture",
    				content: /*report*/ ctx[0].runtime.architecture
    				? /*report*/ ctx[0].runtime.architecture
    				: /*report*/ ctx[0].runtime.system.split("(")[1].split(")")[0]
    			},
    			$$inline: true
    		});

    	const row1 = new Row({
    			props: {
    				name: "device",
    				content: /*report*/ ctx[0].device.name.split(" running ")[0]
    			},
    			$$inline: true
    		});

    	let if_block1 = /*report*/ ctx[0].runtime.kernel && /*report*/ ctx[0].runtime.kernelVersion && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t0 = space();
    			create_component(row0.$$.fragment);
    			t1 = space();
    			create_component(row1.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(row0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			const row0_changes = {};

    			if (dirty & /*report*/ 1) row0_changes.content = /*report*/ ctx[0].runtime.architecture
    			? /*report*/ ctx[0].runtime.architecture
    			: /*report*/ ctx[0].runtime.system.split("(")[1].split(")")[0];

    			row0.$set(row0_changes);
    			const row1_changes = {};
    			if (dirty & /*report*/ 1) row1_changes.content = /*report*/ ctx[0].device.name.split(" running ")[0];
    			row1.$set(row1_changes);

    			if (/*report*/ ctx[0].runtime.kernel && /*report*/ ctx[0].runtime.kernelVersion) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(26:0) <Group headerName=\\\"System\\\"        icon=\\\"{report.device.type == 4 ? \\\"mobile alternate\\\" :                  report.device.type == 3 ? \\\"laptop\\\" :                 report.device.type == 2 ? \\\"microchip\\\" :                 report.device.type == 5 ? \\\"tablet alternate\\\" :                 report.device.type == 8 ? \\\"hdd\\\" :                 \\\"server\\\"}\\\">",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if report.memory}
    function create_if_block_6(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "memory",
    				content: "" + (Math.ceil(/*report*/ ctx[0].memory.bank / (1024 * 1024 * 1024)) + " GB (" + /*report*/ ctx[0].memory.bank + " B)")
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = "" + (Math.ceil(/*report*/ ctx[0].memory.bank / (1024 * 1024 * 1024)) + " GB (" + /*report*/ ctx[0].memory.bank + " B)");
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(57:4) {#if report.memory}",
    		ctx
    	});

    	return block;
    }

    // (53:0) <Group icon="microchip" headerName="Processor">
    function create_default_slot_1$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let if_block_anchor;
    	let current;

    	const row0 = new Row({
    			props: {
    				name: "model",
    				content: /*report*/ ctx[0].processor.model
    			},
    			$$inline: true
    		});

    	const row1 = new Row({
    			props: {
    				name: "cores",
    				content: /*report*/ ctx[0].processor.cores
    			},
    			$$inline: true
    		});

    	const row2 = new Row({
    			props: {
    				name: "threads",
    				content: /*report*/ ctx[0].processor.threads
    			},
    			$$inline: true
    		});

    	let if_block = /*report*/ ctx[0].memory && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t0 = space();
    			create_component(row1.$$.fragment);
    			t1 = space();
    			create_component(row2.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row2, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};
    			if (dirty & /*report*/ 1) row0_changes.content = /*report*/ ctx[0].processor.model;
    			row0.$set(row0_changes);
    			const row1_changes = {};
    			if (dirty & /*report*/ 1) row1_changes.content = /*report*/ ctx[0].processor.cores;
    			row1.$set(row1_changes);
    			const row2_changes = {};
    			if (dirty & /*report*/ 1) row2_changes.content = /*report*/ ctx[0].processor.threads;
    			row2.$set(row2_changes);

    			if (/*report*/ ctx[0].memory) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(row2.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(row2.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(row2, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(53:0) <Group icon=\\\"microchip\\\" headerName=\\\"Processor\\\">",
    		ctx
    	});

    	return block;
    }

    // (61:0) {#if report.extra["window:library"]}
    function create_if_block$2(ctx) {
    	let current;

    	const group = new Group({
    			props: {
    				icon: "desktop",
    				headerName: "Graphics",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(group.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(group, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const group_changes = {};

    			if (dirty & /*$$scope, report*/ 5) {
    				group_changes.$$scope = { dirty, ctx };
    			}

    			group.$set(group_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(group, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(61:0) {#if report.extra[\\\"window:library\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if report.extra["window:library"]}
    function create_if_block_5(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "windowing library",
    				content: /*report*/ ctx[0].extra["window:library"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = /*report*/ ctx[0].extra["window:library"];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(63:4) {#if report.extra[\\\"window:library\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {#if report.extra["gl:renderer"]}
    function create_if_block_4(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "renderer",
    				content: /*report*/ ctx[0].extra["gl:renderer"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = /*report*/ ctx[0].extra["gl:renderer"];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(66:4) {#if report.extra[\\\"gl:renderer\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {#if report.extra["gl:version"]}
    function create_if_block_3(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "version",
    				content: "OpenGL " + /*report*/ ctx[0].extra["gl:version"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = "OpenGL " + /*report*/ ctx[0].extra["gl:version"];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(69:4) {#if report.extra[\\\"gl:version\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if report.extra["gl:glsl_version"]}
    function create_if_block_2(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "shader version",
    				content: "GLSL " + /*report*/ ctx[0].extra["gl:glsl_version"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = "GLSL " + /*report*/ ctx[0].extra["gl:glsl_version"];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(72:4) {#if report.extra[\\\"gl:glsl_version\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if report.extra["gl:driver"] && report.extra["gl:driver"].length > 0}
    function create_if_block_1$1(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				name: "graphics driver",
    				content: /*report*/ ctx[0].extra["gl:driver"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*report*/ 1) row_changes.content = /*report*/ ctx[0].extra["gl:driver"];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(75:4) {#if report.extra[\\\"gl:driver\\\"] && report.extra[\\\"gl:driver\\\"].length > 0}",
    		ctx
    	});

    	return block;
    }

    // (62:0) <Group icon="desktop" headerName="Graphics">
    function create_default_slot$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let if_block4_anchor;
    	let current;
    	let if_block0 = /*report*/ ctx[0].extra["window:library"] && create_if_block_5(ctx);
    	let if_block1 = /*report*/ ctx[0].extra["gl:renderer"] && create_if_block_4(ctx);
    	let if_block2 = /*report*/ ctx[0].extra["gl:version"] && create_if_block_3(ctx);
    	let if_block3 = /*report*/ ctx[0].extra["gl:glsl_version"] && create_if_block_2(ctx);
    	let if_block4 = /*report*/ ctx[0].extra["gl:driver"] && /*report*/ ctx[0].extra["gl:driver"].length > 0 && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, if_block4_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*report*/ ctx[0].extra["window:library"]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*report*/ ctx[0].extra["gl:renderer"]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*report*/ ctx[0].extra["gl:version"]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*report*/ ctx[0].extra["gl:glsl_version"]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    					transition_in(if_block3, 1);
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*report*/ ctx[0].extra["gl:driver"] && /*report*/ ctx[0].extra["gl:driver"].length > 0) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    					transition_in(if_block4, 1);
    				} else {
    					if_block4 = create_if_block_1$1(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(if_block4_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(62:0) <Group icon=\\\"desktop\\\" headerName=\\\"Graphics\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block_anchor;
    	let current;

    	const group0 = new Group({
    			props: {
    				icon: "box",
    				headerName: "General Info",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const group1 = new Group({
    			props: {
    				icon: "box",
    				headerName: "Application",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const group2 = new Group({
    			props: {
    				icon: "cog",
    				headerName: "Build",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const group3 = new Group({
    			props: {
    				headerName: "System",
    				icon: /*report*/ ctx[0].device.type == 4
    				? "mobile alternate"
    				: /*report*/ ctx[0].device.type == 3
    					? "laptop"
    					: /*report*/ ctx[0].device.type == 2
    						? "microchip"
    						: /*report*/ ctx[0].device.type == 5
    							? "tablet alternate"
    							: /*report*/ ctx[0].device.type == 8 ? "hdd" : "server",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const group4 = new Group({
    			props: {
    				icon: "microchip",
    				headerName: "Processor",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*report*/ ctx[0].extra["window:library"] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			create_component(group0.$$.fragment);
    			t0 = space();
    			create_component(group1.$$.fragment);
    			t1 = space();
    			create_component(group2.$$.fragment);
    			t2 = space();
    			create_component(group3.$$.fragment);
    			t3 = space();
    			create_component(group4.$$.fragment);
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(group0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(group1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(group2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(group3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(group4, target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const group0_changes = {};

    			if (dirty & /*$$scope, summary*/ 6) {
    				group0_changes.$$scope = { dirty, ctx };
    			}

    			group0.$set(group0_changes);
    			const group1_changes = {};

    			if (dirty & /*$$scope, report*/ 5) {
    				group1_changes.$$scope = { dirty, ctx };
    			}

    			group1.$set(group1_changes);
    			const group2_changes = {};

    			if (dirty & /*$$scope, report*/ 5) {
    				group2_changes.$$scope = { dirty, ctx };
    			}

    			group2.$set(group2_changes);
    			const group3_changes = {};

    			if (dirty & /*report*/ 1) group3_changes.icon = /*report*/ ctx[0].device.type == 4
    			? "mobile alternate"
    			: /*report*/ ctx[0].device.type == 3
    				? "laptop"
    				: /*report*/ ctx[0].device.type == 2
    					? "microchip"
    					: /*report*/ ctx[0].device.type == 5
    						? "tablet alternate"
    						: /*report*/ ctx[0].device.type == 8 ? "hdd" : "server";

    			if (dirty & /*$$scope, report*/ 5) {
    				group3_changes.$$scope = { dirty, ctx };
    			}

    			group3.$set(group3_changes);
    			const group4_changes = {};

    			if (dirty & /*$$scope, report*/ 5) {
    				group4_changes.$$scope = { dirty, ctx };
    			}

    			group4.$set(group4_changes);

    			if (/*report*/ ctx[0].extra["window:library"]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group0.$$.fragment, local);
    			transition_in(group1.$$.fragment, local);
    			transition_in(group2.$$.fragment, local);
    			transition_in(group3.$$.fragment, local);
    			transition_in(group4.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group0.$$.fragment, local);
    			transition_out(group1.$$.fragment, local);
    			transition_out(group2.$$.fragment, local);
    			transition_out(group3.$$.fragment, local);
    			transition_out(group4.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(group0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(group1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(group2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(group3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(group4, detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { report } = $$props;
    	let { summary } = $$props;
    	const writable_props = ["report", "summary"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ReportView> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("report" in $$props) $$invalidate(0, report = $$props.report);
    		if ("summary" in $$props) $$invalidate(1, summary = $$props.summary);
    	};

    	$$self.$capture_state = () => {
    		return { report, summary };
    	};

    	$$self.$inject_state = $$props => {
    		if ("report" in $$props) $$invalidate(0, report = $$props.report);
    		if ("summary" in $$props) $$invalidate(1, summary = $$props.summary);
    	};

    	return [report, summary];
    }

    class ReportView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { report: 0, summary: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ReportView",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*report*/ ctx[0] === undefined && !("report" in props)) {
    			console.warn("<ReportView> was created without expected prop 'report'");
    		}

    		if (/*summary*/ ctx[1] === undefined && !("summary" in props)) {
    			console.warn("<ReportView> was created without expected prop 'summary'");
    		}
    	}

    	get report() {
    		throw new Error("<ReportView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set report(value) {
    		throw new Error("<ReportView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get summary() {
    		throw new Error("<ReportView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set summary(value) {
    		throw new Error("<ReportView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Crash.svelte generated by Svelte v3.18.2 */

    const { console: console_1$1 } = globals;
    const file$b = "src/Crash.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (105:8) {:else}
    function create_else_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ui active inline centered loader");
    			add_location(div, file$b, 105, 12, 4075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(105:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:36) 
    function create_if_block_1$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let div1;
    	let t4;
    	let div2;
    	let p;
    	let t5;
    	let t6_value = /*crash*/ ctx[0].data.exitCode + "";
    	let t6;
    	let t7;
    	let div3;
    	let current;
    	let if_block0 = !/*noProfile*/ ctx[5] && create_if_block_3$1(ctx);

    	const group = new Group({
    			props: {
    				icon: "bug",
    				headerName: "Crash log",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function select_block_type_1(ctx, dirty) {
    		if (!/*logErrorDetected*/ ctx[8]) return create_if_block_2$1;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);
    	let each_value_1 = /*stdout*/ ctx[6].split("\n");
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*stderr*/ ctx[7].split("\n");
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(group.$$.fragment);
    			t1 = space();
    			if_block1.c();
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div2 = element("div");
    			p = element("p");
    			t5 = text("Exited with ");
    			t6 = text(t6_value);
    			t7 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "ui segment left aligned inverted log-segment svelte-e8sp59");
    			add_location(div0, file$b, 90, 12, 3462);
    			attr_dev(div1, "class", "ui segment left aligned inverted log-segment svelte-e8sp59");
    			add_location(div1, file$b, 95, 12, 3661);
    			attr_dev(p, "class", "svelte-e8sp59");
    			add_location(p, file$b, 101, 16, 3935);
    			attr_dev(div2, "class", "ui segment left aligned inverted log-segment svelte-e8sp59");
    			add_location(div2, file$b, 100, 12, 3860);
    			set_style(div3, "margin-bottom", "2em");
    			add_location(div3, file$b, 103, 12, 4007);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(group, target, anchor);
    			insert_dev(target, t1, anchor);
    			if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*noProfile*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const group_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				group_changes.$$scope = { dirty, ctx };
    			}

    			group.$set(group_changes);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(t2.parentNode, t2);
    				}
    			}

    			if (dirty & /*stdout*/ 64) {
    				each_value_1 = /*stdout*/ ctx[6].split("\n");
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*stderr*/ 128) {
    				each_value = /*stderr*/ ctx[7].split("\n");
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*crash*/ 1) && t6_value !== (t6_value = /*crash*/ ctx[0].data.exitCode + "")) set_data_dev(t6, t6_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(group, detaching);
    			if (detaching) detach_dev(t1);
    			if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(73:36) ",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if errored}
    function create_if_block$3(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Something went wrong";
    			attr_dev(span, "class", "center aligned");
    			add_location(span, file$b, 71, 47, 2618);
    			attr_dev(div, "class", "ui container centered svelte-e8sp59");
    			add_location(div, file$b, 71, 12, 2583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(71:8) {#if errored}",
    		ctx
    	});

    	return block;
    }

    // (74:12) {#if !noProfile}
    function create_if_block_3$1(ctx) {
    	let current;

    	const reportview = new ReportView({
    			props: {
    				report: /*fullInfo*/ ctx[4],
    				summary: /*crash*/ ctx[0].data
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(reportview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(reportview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const reportview_changes = {};
    			if (dirty & /*fullInfo*/ 16) reportview_changes.report = /*fullInfo*/ ctx[4];
    			if (dirty & /*crash*/ 1) reportview_changes.summary = /*crash*/ ctx[0].data;
    			reportview.$set(reportview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(reportview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(reportview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(reportview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(74:12) {#if !noProfile}",
    		ctx
    	});

    	return block;
    }

    // (77:12) <Group icon="bug" headerName="Crash log">
    function create_default_slot$4(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(77:12) <Group icon=\\\"bug\\\" headerName=\\\"Crash log\\\">",
    		ctx
    	});

    	return block;
    }

    // (83:12) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let p;
    	let i;
    	let b;
    	let t1;
    	let each_value_2 = /*logException*/ ctx[9].split("\n");
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			i = element("i");
    			b = element("b");
    			b.textContent = "Likely culprit:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i, "class", "large icon info circle");
    			add_location(i, file$b, 84, 19, 3233);
    			add_location(b, file$b, 84, 57, 3271);
    			add_location(p, file$b, 84, 16, 3230);
    			attr_dev(div, "class", "ui segment blue inverted top attached");
    			add_location(div, file$b, 83, 12, 3162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, i);
    			append_dev(p, b);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*logException*/ 512) {
    				each_value_2 = /*logException*/ ctx[9].split("\n");
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(83:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:12) {#if !logErrorDetected}
    function create_if_block_2$1(ctx) {
    	let div;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t = text("Crash was not automatically detected!");
    			attr_dev(i, "class", "large icon exclamation circle");
    			add_location(i, file$b, 80, 16, 3028);
    			attr_dev(div, "class", "ui segment orange inverted top attached");
    			add_location(div, file$b, 79, 12, 2958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(79:12) {#if !logErrorDetected}",
    		ctx
    	});

    	return block;
    }

    // (86:16) {#each logException.split('\n') as line}
    function create_each_block_2$1(ctx) {
    	let p;
    	let t_value = /*line*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$b, 86, 20, 3375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*logException*/ 512 && t_value !== (t_value = /*line*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(86:16) {#each logException.split('\\n') as line}",
    		ctx
    	});

    	return block;
    }

    // (92:16) {#each stdout.split('\n') as line}
    function create_each_block_1$1(ctx) {
    	let p;
    	let t_value = /*line*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-e8sp59");
    			add_location(p, file$b, 92, 20, 3592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stdout*/ 64 && t_value !== (t_value = /*line*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(92:16) {#each stdout.split('\\n') as line}",
    		ctx
    	});

    	return block;
    }

    // (97:16) {#each stderr.split('\n') as line}
    function create_each_block$1(ctx) {
    	let p;
    	let t_value = /*line*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-e8sp59");
    			add_location(p, file$b, 97, 20, 3791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stderr*/ 128 && t_value !== (t_value = /*line*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(97:16) {#each stderr.split('\\n') as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let a;
    	let div0;
    	let b;
    	let t0_value = /*crash*/ ctx[0].data.crashId + "";
    	let t0;
    	let t1;
    	let t2_value = /*crash*/ ctx[0].data.exitCode + "";
    	let t2;
    	let t3;
    	let t4_value = new Date(/*crash*/ ctx[0].data.submitTime).toGMTString() + "";
    	let t4;
    	let t5;
    	let i;
    	let t6;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_if_block_1$2, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*errored*/ ctx[2]) return 0;
    		if (/*fullInfo*/ ctx[4] !== null) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div0 = element("div");
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = text(" - exited with ");
    			t2 = text(t2_value);
    			t3 = text(" - ");
    			t4 = text(t4_value);
    			t5 = space();
    			i = element("i");
    			t6 = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(b, "class", "svelte-e8sp59");
    			add_location(b, file$b, 65, 12, 2230);
    			attr_dev(i, "class", "icon large chevron down");
    			add_location(i, file$b, 66, 12, 2356);
    			attr_dev(div0, "class", "ui inverted fluid container preview-item svelte-e8sp59");
    			set_style(div0, "background-color", /*backgroundColor*/ ctx[1], 1);
    			add_location(div0, file$b, 64, 8, 2107);
    			attr_dev(a, "class", "ui inverted container fluid svelte-e8sp59");
    			add_location(a, file$b, 60, 4, 1892);
    			attr_dev(div1, "class", "ui inverted crash-item container svelte-e8sp59");
    			set_style(div1, "background-color", /*backgroundColor*/ ctx[1], 1);
    			add_location(div1, file$b, 69, 4, 2424);
    			attr_dev(div2, "class", "ui inverted container fluid crash-row svelte-e8sp59");
    			add_location(div2, file$b, 59, 0, 1836);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div0);
    			append_dev(div0, b);
    			append_dev(b, t0);
    			append_dev(b, t1);
    			append_dev(b, t2);
    			append_dev(b, t3);
    			append_dev(b, t4);
    			append_dev(div0, t5);
    			append_dev(div0, i);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			/*div1_binding*/ ctx[14](div1);
    			current = true;
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[13], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*crash*/ 1) && t0_value !== (t0_value = /*crash*/ ctx[0].data.crashId + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*crash*/ 1) && t2_value !== (t2_value = /*crash*/ ctx[0].data.exitCode + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*crash*/ 1) && t4_value !== (t4_value = new Date(/*crash*/ ctx[0].data.submitTime).toGMTString() + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*backgroundColor*/ 2) {
    				set_style(div0, "background-color", /*backgroundColor*/ ctx[1], 1);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}

    			if (!current || dirty & /*backgroundColor*/ 2) {
    				set_style(div1, "background-color", /*backgroundColor*/ ctx[1], 1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			/*div1_binding*/ ctx[14](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { endpoints } = $$props;
    	let { crash } = $$props;
    	let { alternate } = $$props;
    	let { backgroundColor = alternate ? "#202035" : "#151530" } = $$props;
    	let errored = false;
    	let container;
    	let fullInfo = null;
    	let noProfile = false;
    	let stdout = null;
    	let stderr = null;
    	let logErrorDetected = true;
    	let logException;

    	async function get_full_crash() {
    		if (fullInfo !== null || errored) return;

    		let info = await fetch(endpoints.data + crash.links[4].uri).then(content => {
    			return content.json();
    		}).catch(e => {
    			$$invalidate(2, errored = true);
    		});

    		const out = await fetch(endpoints.data + crash.links[1].uri).then(content => {
    			return content.text();
    		}).catch(e => {
    			$$invalidate(2, errored = true);
    			console.log(e);
    		});

    		const err = await fetch(endpoints.data + crash.links[2].uri).then(content => {
    			return content.text();
    		}).catch(e => {
    			$$invalidate(2, errored = true);
    			console.log(e);
    		});

    		if (info.code && info.code !== 200) $$invalidate(2, errored = true);

    		if (errored && !out.code && !err.code) {
    			$$invalidate(2, errored = false);
    			$$invalidate(5, noProfile = true);
    			info = {};
    		}

    		if (!errored) {
    			$$invalidate(4, fullInfo = info);
    			$$invalidate(6, stdout = out);
    			$$invalidate(7, stderr = err);
    			$$invalidate(8, logErrorDetected = stderr.search("exception encountered") >= 0);

    			if (logErrorDetected) {
    				const exceptStart = stderr.search("exception encountered");
    				$$invalidate(9, logException = stderr.substr(exceptStart, stderr.search("dumping stacktrace") - exceptStart));
    			}
    		}
    	}

    	const writable_props = ["endpoints", "crash", "alternate", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Crash> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		window.$(container).toggleClass("active");
    		get_full_crash();
    	};

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("endpoints" in $$props) $$invalidate(11, endpoints = $$props.endpoints);
    		if ("crash" in $$props) $$invalidate(0, crash = $$props.crash);
    		if ("alternate" in $$props) $$invalidate(12, alternate = $$props.alternate);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => {
    		return {
    			endpoints,
    			crash,
    			alternate,
    			backgroundColor,
    			errored,
    			container,
    			fullInfo,
    			noProfile,
    			stdout,
    			stderr,
    			logErrorDetected,
    			logException
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("endpoints" in $$props) $$invalidate(11, endpoints = $$props.endpoints);
    		if ("crash" in $$props) $$invalidate(0, crash = $$props.crash);
    		if ("alternate" in $$props) $$invalidate(12, alternate = $$props.alternate);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    		if ("errored" in $$props) $$invalidate(2, errored = $$props.errored);
    		if ("container" in $$props) $$invalidate(3, container = $$props.container);
    		if ("fullInfo" in $$props) $$invalidate(4, fullInfo = $$props.fullInfo);
    		if ("noProfile" in $$props) $$invalidate(5, noProfile = $$props.noProfile);
    		if ("stdout" in $$props) $$invalidate(6, stdout = $$props.stdout);
    		if ("stderr" in $$props) $$invalidate(7, stderr = $$props.stderr);
    		if ("logErrorDetected" in $$props) $$invalidate(8, logErrorDetected = $$props.logErrorDetected);
    		if ("logException" in $$props) $$invalidate(9, logException = $$props.logException);
    	};

    	return [
    		crash,
    		backgroundColor,
    		errored,
    		container,
    		fullInfo,
    		noProfile,
    		stdout,
    		stderr,
    		logErrorDetected,
    		logException,
    		get_full_crash,
    		endpoints,
    		alternate,
    		click_handler,
    		div1_binding
    	];
    }

    class Crash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			endpoints: 11,
    			crash: 0,
    			alternate: 12,
    			backgroundColor: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Crash",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*endpoints*/ ctx[11] === undefined && !("endpoints" in props)) {
    			console_1$1.warn("<Crash> was created without expected prop 'endpoints'");
    		}

    		if (/*crash*/ ctx[0] === undefined && !("crash" in props)) {
    			console_1$1.warn("<Crash> was created without expected prop 'crash'");
    		}

    		if (/*alternate*/ ctx[12] === undefined && !("alternate" in props)) {
    			console_1$1.warn("<Crash> was created without expected prop 'alternate'");
    		}
    	}

    	get endpoints() {
    		throw new Error("<Crash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set endpoints(value) {
    		throw new Error("<Crash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get crash() {
    		throw new Error("<Crash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set crash(value) {
    		throw new Error("<Crash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alternate() {
    		throw new Error("<Crash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alternate(value) {
    		throw new Error("<Crash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Crash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Crash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Report.svelte generated by Svelte v3.18.2 */
    const file$c = "src/Report.svelte";

    // (64:8) {:else}
    function create_else_block$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ui active inline centered loader");
    			add_location(div, file$c, 64, 12, 2593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(64:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:36) 
    function create_if_block_1$3(ctx) {
    	let t;
    	let current;

    	const reportview = new ReportView({
    			props: {
    				report: /*fullInfo*/ ctx[4],
    				summary: /*report*/ ctx[0].data
    			},
    			$$inline: true
    		});

    	const group = new Group({
    			props: {
    				icon: "download",
    				headerName: "Raw format",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(reportview.$$.fragment);
    			t = space();
    			create_component(group.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(reportview, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(group, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const reportview_changes = {};
    			if (dirty & /*fullInfo*/ 16) reportview_changes.report = /*fullInfo*/ ctx[4];
    			if (dirty & /*report*/ 1) reportview_changes.summary = /*report*/ ctx[0].data;
    			reportview.$set(reportview_changes);
    			const group_changes = {};

    			if (dirty & /*$$scope, report*/ 1025) {
    				group_changes.$$scope = { dirty, ctx };
    			}

    			group.$set(group_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(reportview.$$.fragment, local);
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(reportview.$$.fragment, local);
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(reportview, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(group, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(46:36) ",
    		ctx
    	});

    	return block;
    }

    // (44:8) {#if errored}
    function create_if_block$4(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Something went wrong";
    			attr_dev(span, "class", "center aligned");
    			add_location(span, file$c, 44, 47, 1626);
    			attr_dev(div, "class", "ui container centered svelte-d1z632");
    			add_location(div, file$c, 44, 12, 1591);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(44:8) {#if errored}",
    		ctx
    	});

    	return block;
    }

    // (50:20) <a href="{report.links[2].uri}" slot="content">
    function create_content_slot_1(ctx) {
    	let a;
    	let div;
    	let i;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			i = element("i");
    			t = text(" Download");
    			attr_dev(i, "class", "download icon");
    			add_location(i, file$c, 51, 28, 2054);
    			attr_dev(div, "class", "ui label inverted");
    			add_location(div, file$c, 50, 24, 1994);
    			attr_dev(a, "href", a_href_value = /*report*/ ctx[0].links[2].uri);
    			attr_dev(a, "slot", "content");
    			add_location(a, file$c, 49, 20, 1922);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, i);
    			append_dev(div, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(50:20) <a href=\\\"{report.links[2].uri}\\\" slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:16) <Row name="raw report download">
    function create_default_slot_2$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(49:16) <Row name=\\\"raw report download\\\">",
    		ctx
    	});

    	return block;
    }

    // (57:20) <a href="https://trace.birchy.dev?source=https://api.birchy.dev/{report.links[2].uri}" slot="content">
    function create_content_slot$1(ctx) {
    	let a;
    	let div;
    	let i;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			i = element("i");
    			t = text(" View");
    			attr_dev(i, "class", "external alternate icon");
    			add_location(i, file$c, 58, 28, 2420);
    			attr_dev(div, "class", "ui label inverted");
    			add_location(div, file$c, 57, 24, 2360);
    			attr_dev(a, "href", a_href_value = "https://trace.birchy.dev?source=https://api.birchy.dev/" + /*report*/ ctx[0].links[2].uri);
    			attr_dev(a, "slot", "content");
    			add_location(a, file$c, 56, 20, 2233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, i);
    			append_dev(div, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot$1.name,
    		type: "slot",
    		source: "(57:20) <a href=\\\"https://trace.birchy.dev?source=https://api.birchy.dev/{report.links[2].uri}\\\" slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (56:16) <Row name="view report">
    function create_default_slot_1$4(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(56:16) <Row name=\\\"view report\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:12) <Group icon="download" headerName="Raw format">
    function create_default_slot$5(ctx) {
    	let t;
    	let current;

    	const row0 = new Row({
    			props: {
    				name: "raw report download",
    				$$slots: {
    					default: [create_default_slot_2$2],
    					content: [create_content_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const row1 = new Row({
    			props: {
    				name: "view report",
    				$$slots: {
    					default: [create_default_slot_1$4],
    					content: [create_content_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t = space();
    			create_component(row1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(row1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};

    			if (dirty & /*$$scope, report*/ 1025) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope, report*/ 1025) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(row1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(48:12) <Group icon=\\\"download\\\" headerName=\\\"Raw format\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div2;
    	let a;
    	let div0;
    	let b0;
    	let t0_value = /*report*/ ctx[0].data.reportId + "";
    	let t0;
    	let t1;
    	let t2_value = /*report*/ ctx[0].data.system.split(" running ")[0] + "";
    	let t2;
    	let t3;
    	let t4_value = new Date(/*report*/ ctx[0].data.submitTime).toGMTString() + "";
    	let t4;
    	let t5;
    	let b1;
    	let t6;
    	let i;
    	let t7;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$4, create_if_block_1$3, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*errored*/ ctx[2]) return 0;
    		if (/*fullInfo*/ ctx[4] !== null) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div0 = element("div");
    			b0 = element("b");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = text(" - ");
    			t4 = text(t4_value);
    			t5 = space();
    			b1 = element("b");
    			t6 = space();
    			i = element("i");
    			t7 = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(b0, "class", "svelte-d1z632");
    			add_location(b0, file$c, 37, 12, 1205);
    			attr_dev(b1, "class", "svelte-d1z632");
    			add_location(b1, file$c, 38, 12, 1343);
    			attr_dev(i, "class", "icon large chevron down");
    			add_location(i, file$c, 39, 12, 1363);
    			attr_dev(div0, "class", "ui inverted fluid container preview-item svelte-d1z632");
    			set_style(div0, "background-color", /*backgroundColor*/ ctx[1], 1);
    			add_location(div0, file$c, 36, 8, 1082);
    			attr_dev(a, "class", "ui inverted container fluid svelte-d1z632");
    			add_location(a, file$c, 32, 4, 866);
    			attr_dev(div1, "class", "ui inverted report-item container svelte-d1z632");
    			set_style(div1, "background-color", /*backgroundColor*/ ctx[1], 1);
    			add_location(div1, file$c, 42, 4, 1431);
    			attr_dev(div2, "class", "ui inverted container fluid report-row svelte-d1z632");
    			add_location(div2, file$c, 31, 0, 809);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div0);
    			append_dev(div0, b0);
    			append_dev(b0, t0);
    			append_dev(b0, t1);
    			append_dev(b0, t2);
    			append_dev(b0, t3);
    			append_dev(b0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, b1);
    			append_dev(div0, t6);
    			append_dev(div0, i);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			/*div1_binding*/ ctx[9](div1);
    			current = true;
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[8], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*report*/ 1) && t0_value !== (t0_value = /*report*/ ctx[0].data.reportId + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*report*/ 1) && t2_value !== (t2_value = /*report*/ ctx[0].data.system.split(" running ")[0] + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*report*/ 1) && t4_value !== (t4_value = new Date(/*report*/ ctx[0].data.submitTime).toGMTString() + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*backgroundColor*/ 2) {
    				set_style(div0, "background-color", /*backgroundColor*/ ctx[1], 1);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}

    			if (!current || dirty & /*backgroundColor*/ 2) {
    				set_style(div1, "background-color", /*backgroundColor*/ ctx[1], 1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			/*div1_binding*/ ctx[9](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { endpoints } = $$props;
    	let { report } = $$props;
    	let { alternate } = $$props;
    	let { backgroundColor = alternate ? "#202035" : "#151530" } = $$props;
    	let errored = false;
    	let container;
    	let fullInfo = null;

    	async function get_full_report() {
    		if (fullInfo !== null || errored) return;

    		const info = await fetch(endpoints.data + report.links[0].uri).then(content => {
    			return content.json();
    		}).catch(e => {
    			$$invalidate(2, errored = true);
    		});

    		if (info.code && info.code !== 200) $$invalidate(2, errored = true);
    		if (!errored) $$invalidate(4, fullInfo = info.data);
    	}

    	const writable_props = ["endpoints", "report", "alternate", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Report> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		window.$(container).toggleClass("active");
    		get_full_report();
    	};

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("endpoints" in $$props) $$invalidate(6, endpoints = $$props.endpoints);
    		if ("report" in $$props) $$invalidate(0, report = $$props.report);
    		if ("alternate" in $$props) $$invalidate(7, alternate = $$props.alternate);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => {
    		return {
    			endpoints,
    			report,
    			alternate,
    			backgroundColor,
    			errored,
    			container,
    			fullInfo
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("endpoints" in $$props) $$invalidate(6, endpoints = $$props.endpoints);
    		if ("report" in $$props) $$invalidate(0, report = $$props.report);
    		if ("alternate" in $$props) $$invalidate(7, alternate = $$props.alternate);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    		if ("errored" in $$props) $$invalidate(2, errored = $$props.errored);
    		if ("container" in $$props) $$invalidate(3, container = $$props.container);
    		if ("fullInfo" in $$props) $$invalidate(4, fullInfo = $$props.fullInfo);
    	};

    	return [
    		report,
    		backgroundColor,
    		errored,
    		container,
    		fullInfo,
    		get_full_report,
    		endpoints,
    		alternate,
    		click_handler,
    		div1_binding
    	];
    }

    class Report extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			endpoints: 6,
    			report: 0,
    			alternate: 7,
    			backgroundColor: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Report",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*endpoints*/ ctx[6] === undefined && !("endpoints" in props)) {
    			console.warn("<Report> was created without expected prop 'endpoints'");
    		}

    		if (/*report*/ ctx[0] === undefined && !("report" in props)) {
    			console.warn("<Report> was created without expected prop 'report'");
    		}

    		if (/*alternate*/ ctx[7] === undefined && !("alternate" in props)) {
    			console.warn("<Report> was created without expected prop 'alternate'");
    		}
    	}

    	get endpoints() {
    		throw new Error("<Report>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set endpoints(value) {
    		throw new Error("<Report>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get report() {
    		throw new Error("<Report>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set report(value) {
    		throw new Error("<Report>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alternate() {
    		throw new Error("<Report>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alternate(value) {
    		throw new Error("<Report>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Report>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Report>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Diagnostics.svelte generated by Svelte v3.18.2 */
    const file$d = "src/Diagnostics.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (36:0) {:else}
    function create_else_block_1$2(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "ui loader");
    			add_location(div0, file$d, 37, 8, 1046);
    			attr_dev(div1, "class", "ui active dimmer");
    			add_location(div1, file$d, 36, 4, 1007);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(36:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if crashes}
    function create_if_block_1$4(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*crashes*/ ctx[1];
    	const get_key = ctx => /*crash*/ ctx[6].data.crashId;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const each_value_1 = /*crashes*/ ctx[1];
    			group_outros();
    			validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1$2, each_1_anchor, get_each_context_1$2);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(32:0) {#if crashes}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#each crashes as crash, i (crash.data.crashId)}
    function create_each_block_1$2(key_1, ctx) {
    	let first;
    	let current;

    	const crash = new Crash({
    			props: {
    				crash: /*crash*/ ctx[6],
    				endpoints: /*endpoints*/ ctx[0],
    				alternate: /*i*/ ctx[5] % 2 == 0
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(crash.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(crash, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const crash_changes = {};
    			if (dirty & /*crashes*/ 2) crash_changes.crash = /*crash*/ ctx[6];
    			if (dirty & /*endpoints*/ 1) crash_changes.endpoints = /*endpoints*/ ctx[0];
    			if (dirty & /*crashes*/ 2) crash_changes.alternate = /*i*/ ctx[5] % 2 == 0;
    			crash.$set(crash_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crash.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crash.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(crash, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(33:4) {#each crashes as crash, i (crash.data.crashId)}",
    		ctx
    	});

    	return block;
    }

    // (48:0) {:else}
    function create_else_block$5(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "ui loader");
    			add_location(div0, file$d, 49, 8, 1392);
    			attr_dev(div1, "class", "ui active dimmer");
    			add_location(div1, file$d, 48, 4, 1353);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(48:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:0) {#if reports}
    function create_if_block$5(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*reports*/ ctx[2];
    	const get_key = ctx => /*report*/ ctx[3].data.reportId;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const each_value = /*reports*/ ctx[2];
    			group_outros();
    			validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(44:0) {#if reports}",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#each reports as report, i (report.data.reportId)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const report = new Report({
    			props: {
    				report: /*report*/ ctx[3],
    				endpoints: /*endpoints*/ ctx[0],
    				alternate: /*i*/ ctx[5] % 2 == 0
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(report.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(report, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const report_changes = {};
    			if (dirty & /*reports*/ 4) report_changes.report = /*report*/ ctx[3];
    			if (dirty & /*endpoints*/ 1) report_changes.endpoints = /*endpoints*/ ctx[0];
    			if (dirty & /*reports*/ 4) report_changes.alternate = /*i*/ ctx[5] % 2 == 0;
    			report.$set(report_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(report.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(report.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(report, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(45:4) {#each reports as report, i (report.data.reportId)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div0;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let div1;
    	let current_block_type_index;
    	let if_block0;
    	let t4;
    	let div2;
    	let current_block_type_index_1;
    	let if_block1;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block_1$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*crashes*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block$5, create_else_block$5];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*reports*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Crashes";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Reports";
    			t3 = space();
    			div1 = element("div");
    			if_block0.c();
    			t4 = space();
    			div2 = element("div");
    			if_block1.c();
    			attr_dev(a0, "class", "ui item active");
    			attr_dev(a0, "data-tab", "diag::crash");
    			add_location(a0, file$d, 26, 4, 627);
    			attr_dev(a1, "class", "ui item");
    			attr_dev(a1, "data-tab", "diag::report");
    			add_location(a1, file$d, 27, 4, 692);
    			attr_dev(div0, "class", "ui inverted top attached tabular menu");
    			add_location(div0, file$d, 25, 0, 571);
    			attr_dev(div1, "data-tab", "diag::crash");
    			attr_dev(div1, "class", "ui inverted bottom attached tab segment active svelte-58j8ih");
    			add_location(div1, file$d, 30, 0, 755);
    			attr_dev(div2, "data-tab", "diag::report");
    			attr_dev(div2, "class", "ui inverted bottom attached tab segment svelte-58j8ih");
    			add_location(div2, file$d, 42, 0, 1101);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			if_blocks[current_block_type_index].m(div1, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			if_blocks_1[current_block_type_index_1].m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div1, null);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div2, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if_blocks_1[current_block_type_index_1].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { endpoints } = $$props;
    	let crashes;
    	let reports;

    	fetch(endpoints.data + "/v2/crash").then(content => {
    		return content.json();
    	}).then(content => {
    		$$invalidate(1, crashes = content.data.reverse());
    	});

    	fetch(endpoints.data + "/v2/reports").then(content => {
    		return content.json();
    	}).then(content => {
    		$$invalidate(2, reports = content.data.reverse());
    	});

    	const writable_props = ["endpoints"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Diagnostics> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("endpoints" in $$props) $$invalidate(0, endpoints = $$props.endpoints);
    	};

    	$$self.$capture_state = () => {
    		return { endpoints, crashes, reports };
    	};

    	$$self.$inject_state = $$props => {
    		if ("endpoints" in $$props) $$invalidate(0, endpoints = $$props.endpoints);
    		if ("crashes" in $$props) $$invalidate(1, crashes = $$props.crashes);
    		if ("reports" in $$props) $$invalidate(2, reports = $$props.reports);
    	};

    	return [endpoints, crashes, reports];
    }

    class Diagnostics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { endpoints: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Diagnostics",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*endpoints*/ ctx[0] === undefined && !("endpoints" in props)) {
    			console.warn("<Diagnostics> was created without expected prop 'endpoints'");
    		}
    	}

    	get endpoints() {
    		throw new Error("<Diagnostics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set endpoints(value) {
    		throw new Error("<Diagnostics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.18.2 */

    const file$e = "src/Footer.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let t0;
    	let a;
    	let i;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("source can be found over at ");
    			a = element("a");
    			i = element("i");
    			t1 = text(" github");
    			attr_dev(i, "class", "icon github");
    			add_location(i, file$e, 7, 81, 220);
    			attr_dev(a, "href", "https://github.com/hbirchtree/kafei-py");
    			add_location(a, file$e, 7, 32, 171);
    			attr_dev(div, "class", "ui inverted vertical footer segment centered svelte-1ausncw");
    			add_location(div, file$e, 6, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, a);
    			append_dev(a, i);
    			append_dev(a, t1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.18.2 */

    const { console: console_1$2 } = globals;
    const file$f = "src/App.svelte";

    function create_fragment$f(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let link3;
    	let t3;
    	let link4;
    	let t4;
    	let link5;
    	let t5;
    	let link6;
    	let t6;
    	let t7;
    	let div0;
    	let t8;
    	let div1;
    	let t9;
    	let div2;
    	let t10;
    	let div3;
    	let t11;
    	let t12;
    	let link7;
    	let current;

    	const navbar = new Navbar({
    			props: {
    				links: /*navLinks*/ ctx[4],
    				externals: /*extLinks*/ ctx[5],
    				github: /*github*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const home = new Home({
    			props: {
    				github: /*github*/ ctx[6],
    				endpoints: /*endpoints*/ ctx[8],
    				releaseInfo: /*releaseInfo*/ ctx[0],
    				imguiReleaseInfo: /*imguiReleaseInfo*/ ctx[1],
    				nativeReleaseInfo: /*nativeReleaseInfo*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const examples = new Examples({
    			props: {
    				github: /*github*/ ctx[6],
    				repository: /*repository*/ ctx[7],
    				releaseInfo: /*releaseInfo*/ ctx[0],
    				commitInfo: /*commitInfo*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const statistics = new Statistics({
    			props: { endpoints: /*endpoints*/ ctx[8] },
    			$$inline: true
    		});

    	const diagnostics = new Diagnostics({
    			props: { endpoints: /*endpoints*/ ctx[8] },
    			$$inline: true
    		});

    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			link3 = element("link");
    			t3 = space();
    			link4 = element("link");
    			t4 = space();
    			link5 = element("link");
    			t5 = space();
    			link6 = element("link");
    			t6 = space();
    			create_component(navbar.$$.fragment);
    			t7 = space();
    			div0 = element("div");
    			create_component(home.$$.fragment);
    			t8 = space();
    			div1 = element("div");
    			create_component(examples.$$.fragment);
    			t9 = space();
    			div2 = element("div");
    			create_component(statistics.$$.fragment);
    			t10 = space();
    			div3 = element("div");
    			create_component(diagnostics.$$.fragment);
    			t11 = space();
    			create_component(footer.$$.fragment);
    			t12 = space();
    			link7 = element("link");
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "type", "text/css");
    			attr_dev(link0, "href", "semantic/semantic.min.css");
    			add_location(link0, file$f, 63, 0, 1977);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "type", "text/css");
    			attr_dev(link1, "href", "semantic/components/container.min.css");
    			add_location(link1, file$f, 64, 0, 2050);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "type", "text/css");
    			attr_dev(link2, "href", "semantic/components/grid.min.css");
    			add_location(link2, file$f, 65, 0, 2135);
    			attr_dev(link3, "rel", "stylesheet");
    			attr_dev(link3, "type", "text/css");
    			attr_dev(link3, "href", "semantic/components/header.min.css");
    			add_location(link3, file$f, 66, 0, 2215);
    			attr_dev(link4, "rel", "stylesheet");
    			attr_dev(link4, "type", "text/css");
    			attr_dev(link4, "href", "semantic/components/menu.min.css");
    			add_location(link4, file$f, 67, 0, 2297);
    			attr_dev(link5, "rel", "stylesheet");
    			attr_dev(link5, "type", "text/css");
    			attr_dev(link5, "href", "semantic/components/modal.min.css");
    			add_location(link5, file$f, 68, 0, 2377);
    			attr_dev(link6, "rel", "stylesheet");
    			attr_dev(link6, "type", "text/css");
    			attr_dev(link6, "href", "semantic/components/tab.min.css");
    			add_location(link6, file$f, 69, 0, 2458);
    			attr_dev(div0, "data-tab", "nav::home");
    			attr_dev(div0, "class", "ui inverted text tab segment active svelte-17u2bue");
    			add_location(div0, file$f, 73, 0, 2603);
    			attr_dev(div1, "data-tab", "nav::examples");
    			attr_dev(div1, "class", "ui inverted text tab segment svelte-17u2bue");
    			add_location(div1, file$f, 76, 0, 2831);
    			attr_dev(div2, "data-tab", "nav::stats");
    			attr_dev(div2, "class", "ui inverted text tab segment svelte-17u2bue");
    			add_location(div2, file$f, 79, 0, 3012);
    			attr_dev(div3, "data-tab", "nav::diag");
    			attr_dev(div3, "class", "ui inverted text tab fluid segment svelte-17u2bue");
    			add_location(div3, file$f, 82, 0, 3124);
    			attr_dev(link7, "href", "https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,400i,700&subset=latin-ext");
    			attr_dev(link7, "rel", "stylesheet");
    			add_location(link7, file$f, 96, 0, 3389);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, link2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, link3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, link4, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, link5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, link6, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(home, div0, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(examples, div1, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(statistics, div2, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(diagnostics, div3, null);
    			insert_dev(target, t11, anchor);
    			mount_component(footer, target, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, link7, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};
    			if (dirty & /*navLinks*/ 16) navbar_changes.links = /*navLinks*/ ctx[4];
    			if (dirty & /*extLinks*/ 32) navbar_changes.externals = /*extLinks*/ ctx[5];
    			if (dirty & /*github*/ 64) navbar_changes.github = /*github*/ ctx[6];
    			navbar.$set(navbar_changes);
    			const home_changes = {};
    			if (dirty & /*github*/ 64) home_changes.github = /*github*/ ctx[6];
    			if (dirty & /*endpoints*/ 256) home_changes.endpoints = /*endpoints*/ ctx[8];
    			if (dirty & /*releaseInfo*/ 1) home_changes.releaseInfo = /*releaseInfo*/ ctx[0];
    			if (dirty & /*imguiReleaseInfo*/ 2) home_changes.imguiReleaseInfo = /*imguiReleaseInfo*/ ctx[1];
    			if (dirty & /*nativeReleaseInfo*/ 4) home_changes.nativeReleaseInfo = /*nativeReleaseInfo*/ ctx[2];
    			home.$set(home_changes);
    			const examples_changes = {};
    			if (dirty & /*github*/ 64) examples_changes.github = /*github*/ ctx[6];
    			if (dirty & /*repository*/ 128) examples_changes.repository = /*repository*/ ctx[7];
    			if (dirty & /*releaseInfo*/ 1) examples_changes.releaseInfo = /*releaseInfo*/ ctx[0];
    			if (dirty & /*commitInfo*/ 8) examples_changes.commitInfo = /*commitInfo*/ ctx[3];
    			examples.$set(examples_changes);
    			const statistics_changes = {};
    			if (dirty & /*endpoints*/ 256) statistics_changes.endpoints = /*endpoints*/ ctx[8];
    			statistics.$set(statistics_changes);
    			const diagnostics_changes = {};
    			if (dirty & /*endpoints*/ 256) diagnostics_changes.endpoints = /*endpoints*/ ctx[8];
    			diagnostics.$set(diagnostics_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			transition_in(examples.$$.fragment, local);
    			transition_in(statistics.$$.fragment, local);
    			transition_in(diagnostics.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			transition_out(examples.$$.fragment, local);
    			transition_out(statistics.$$.fragment, local);
    			transition_out(diagnostics.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(link2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(link3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(link4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(link5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(link6);
    			if (detaching) detach_dev(t6);
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div0);
    			destroy_component(home);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div1);
    			destroy_component(examples);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div2);
    			destroy_component(statistics);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
    			destroy_component(diagnostics);
    			if (detaching) detach_dev(t11);
    			destroy_component(footer, detaching);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(link7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { navLinks = [
    		{
    			name: "Home",
    			target: "nav::home",
    			icon: "home"
    		},
    		{
    			name: "Examples",
    			target: "nav::examples",
    			icon: "box"
    		},
    		{
    			name: "Statistics",
    			target: "nav::stats",
    			icon: "chart pie"
    		},
    		{
    			name: "Diagnostics",
    			target: "nav::diag",
    			icon: "archive"
    		}
    	] } = $$props;

    	let { extLinks = [] } = $$props;
    	let { github } = $$props;
    	let { repository } = $$props;
    	let { releaseInfo = null } = $$props;
    	let { imguiReleaseInfo = null } = $$props;
    	let { nativeReleaseInfo = null } = $$props;
    	let { commitInfo = null } = $$props;
    	let { endpoints } = $$props;

    	async function get_resource(source) {
    		return fetch(endpoints.data + source).then(content => {
    			return content.json();
    		}).then(content => {
    			return content.data;
    		}).catch(err => {
    			console.err(err);
    		});
    	}

    	async function initialize_releases() {
    		$$invalidate(0, releaseInfo = await get_resource("/github/latestRelease/hbirchtree_coffeecutie"));
    		$$invalidate(1, imguiReleaseInfo = await get_resource("/github/latestRelease/hbirchtree_coffeecutie-imgui"));
    		$$invalidate(2, nativeReleaseInfo = await get_resource("/github/latestRelease/hbirchtree_native-library-bundle"));
    	}

    	async function initialize_commit() {
    		$$invalidate(3, commitInfo = await get_resource("/github/updateInfo/hbirchtree_coffeecutie"));
    	}

    	async function get_resources() {
    		initialize_releases();
    		initialize_commit();
    	}

    	onMount(async () => {
    		window.$(".ui.menu .item").tab();
    		await get_resources();
    	});

    	const writable_props = [
    		"navLinks",
    		"extLinks",
    		"github",
    		"repository",
    		"releaseInfo",
    		"imguiReleaseInfo",
    		"nativeReleaseInfo",
    		"commitInfo",
    		"endpoints"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("navLinks" in $$props) $$invalidate(4, navLinks = $$props.navLinks);
    		if ("extLinks" in $$props) $$invalidate(5, extLinks = $$props.extLinks);
    		if ("github" in $$props) $$invalidate(6, github = $$props.github);
    		if ("repository" in $$props) $$invalidate(7, repository = $$props.repository);
    		if ("releaseInfo" in $$props) $$invalidate(0, releaseInfo = $$props.releaseInfo);
    		if ("imguiReleaseInfo" in $$props) $$invalidate(1, imguiReleaseInfo = $$props.imguiReleaseInfo);
    		if ("nativeReleaseInfo" in $$props) $$invalidate(2, nativeReleaseInfo = $$props.nativeReleaseInfo);
    		if ("commitInfo" in $$props) $$invalidate(3, commitInfo = $$props.commitInfo);
    		if ("endpoints" in $$props) $$invalidate(8, endpoints = $$props.endpoints);
    	};

    	$$self.$capture_state = () => {
    		return {
    			navLinks,
    			extLinks,
    			github,
    			repository,
    			releaseInfo,
    			imguiReleaseInfo,
    			nativeReleaseInfo,
    			commitInfo,
    			endpoints
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("navLinks" in $$props) $$invalidate(4, navLinks = $$props.navLinks);
    		if ("extLinks" in $$props) $$invalidate(5, extLinks = $$props.extLinks);
    		if ("github" in $$props) $$invalidate(6, github = $$props.github);
    		if ("repository" in $$props) $$invalidate(7, repository = $$props.repository);
    		if ("releaseInfo" in $$props) $$invalidate(0, releaseInfo = $$props.releaseInfo);
    		if ("imguiReleaseInfo" in $$props) $$invalidate(1, imguiReleaseInfo = $$props.imguiReleaseInfo);
    		if ("nativeReleaseInfo" in $$props) $$invalidate(2, nativeReleaseInfo = $$props.nativeReleaseInfo);
    		if ("commitInfo" in $$props) $$invalidate(3, commitInfo = $$props.commitInfo);
    		if ("endpoints" in $$props) $$invalidate(8, endpoints = $$props.endpoints);
    	};

    	return [
    		releaseInfo,
    		imguiReleaseInfo,
    		nativeReleaseInfo,
    		commitInfo,
    		navLinks,
    		extLinks,
    		github,
    		repository,
    		endpoints
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$f, safe_not_equal, {
    			navLinks: 4,
    			extLinks: 5,
    			github: 6,
    			repository: 7,
    			releaseInfo: 0,
    			imguiReleaseInfo: 1,
    			nativeReleaseInfo: 2,
    			commitInfo: 3,
    			endpoints: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*github*/ ctx[6] === undefined && !("github" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'github'");
    		}

    		if (/*repository*/ ctx[7] === undefined && !("repository" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'repository'");
    		}

    		if (/*endpoints*/ ctx[8] === undefined && !("endpoints" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'endpoints'");
    		}
    	}

    	get navLinks() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navLinks(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extLinks() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extLinks(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get github() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set github(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get repository() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set repository(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get releaseInfo() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set releaseInfo(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imguiReleaseInfo() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imguiReleaseInfo(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nativeReleaseInfo() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nativeReleaseInfo(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get commitInfo() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set commitInfo(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get endpoints() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set endpoints(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
            endpoints: {
                data: "https://api.birchy.dev",
                profiler: "https://coffee.birchy.dev",
                crash: "https://crash.birchy.dev"
            },
            github: {
                link: "https://github.com/hbirchtree", 
                img: "https://avatars3.githubusercontent.com/u/6828070?s=80&v=4"
            },
            repository: {
                link: "https://github.com/hbirchtree/coffeecutie"
            }
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

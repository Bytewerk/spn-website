return [==[
{% extends 'core/base.html' %}
{% load static %}

{% block earlycss %}
    <link rel="stylesheet" type="text/css" href="{% static "docs/github-markdown.css" %}" />
{% endblock %}

{% block css %}
    <link rel="stylesheet" type="text/css" href="{% static "core/highlight.js/styles/agate.css" %}" />
    <link rel="stylesheet" type="text/css" href="{% static "docs/docs.css" %}" />
{% endblock %}

{% block js%}
    <script src="{% static "core/highlight.js/highlight.pack.js" %}"></script>
    <script>hljs.initHighlightingOnLoad();</script>
{% endblock %}

{% block content %}

<div class="docs_container markdown-body">

# local no_spaces = ldoc.no_spaces
# local use_li = ldoc.use_li
# local display_name = ldoc.display_name
# local iter = ldoc.modules.iter
# local function M(txt,item) return ldoc.markup(txt,item,ldoc.plain) end
# local nowrap = ldoc.wrap and '' or 'nowrap'

<h1>$(ldoc.project)</h1>

<div id="docs_content">

# if ldoc.body then -- verbatim HTML as contents; 'non-code' entries
    $(ldoc.body)
# elseif module then -- module documentation
<p>$(M(module.summary,module))</p>
<p>$(M(module.description,module))</p>
#   if module.tags.include then
        $(M(ldoc.include_file(module.tags.include)))
#   end
#   if module.usage then
#     local li,il = use_li(module.usage)
    <h4>Usage:</h4>
    <ul>
#     for usage in iter(module.usage) do
        $(li)<pre class="usage"><code class="lua">$(ldoc.escape(usage))</code></pre>$(il)
#     end -- for
    </ul>
#   end -- if usage
#   if module.info then
    <h4>Info:</h4>
    <ul>
#     for tag, value in module.info:iter() do
        <li><strong>$(tag)</strong>: $(M(value,module))</li>
#     end
    </ul>
#   end -- if module.info


# if not ldoc.no_summary then
# -- bang out the tables of item types for this module (e.g Functions, Tables, etc)
# for kind,items in module.kinds() do
<h2><a href="#$(no_spaces(kind))">$(kind)</a></h2>
<table class="function_list">
  <thead>
    <tr>
      <td>
        Function name
      </td>
      <td>
        Description
      </td>
    </tr>
  </thead>
  <tbody>
#  for item in items() do
	<tr>
	<td class="name" $(nowrap)><a href="#$(item.name)">$(display_name(item))</a></td>
	<td class="summary">$(M(item.summary,item))</td>
	</tr>
#  end -- for items
  </tbody>
</table>
#end -- for kinds

#end -- if not no_summary

# --- currently works for both Functions and Tables. The params field either contains
# --- function parameters or table fields.
# local show_return = not ldoc.no_return_or_parms
# local show_parms = show_return
# for kind, items in module.kinds() do
#   local kitem = module.kinds:get_item(kind)
    <h2><a name="$(no_spaces(kind))"></a>$(kind)</h2>
    $(M(module.kinds:get_section_description(kind),nil))
#   if kitem then
        $(M(ldoc.descript(kitem),kitem))
#       if kitem.usage then
            <h4>Usage:</h4>
            <pre class="usage"><code class="lua">$(ldoc.prettify(kitem.usage[1]))</code></pre>
#        end
#   end
    <dl class="function">
#  for item in items() do
    <dt>
    <a name = "$(item.name)"></a>
    <strong>$(display_name(item))</strong>
#   if ldoc.prettify_files then
    <a style="float:right;" href="$(ldoc.source_ref(item))">line $(item.lineno)</a>
#  end
    </dt>
    <dd>
    $(M(ldoc.descript(item),item))

#   if ldoc.custom_tags then
#    for custom in iter(ldoc.custom_tags) do
#     local tag = item.tags[custom[1]]
#     if tag and not custom.hidden then
#      local li,il = use_li(tag)
    <h4>$(custom.title or custom[1]):</h4>
    <ul>
#      for value in iter(tag) do
         $(li)$(custom.format and custom.format(value) or M(value))$(il)
#      end -- for
#     end -- if tag
    </ul>
#    end -- iter tags
#   end

#  if show_parms and item.params and #item.params > 0 then
#    local subnames = module.kinds:type_of(item).subnames
#    if subnames then
    <h4>$(subnames):</h4>
#    end
    <ul>
#   for parm in iter(item.params) do
#     local param,sublist = item:subparam(parm)
#     if sublist then
        <li><code>$(sublist)</code>$(M(item.params.map[sublist],item))
        <ul>
#     end
#     for p in iter(param) do
#        local name,tp,def = item:display_name_of(p), ldoc.typename(item:type_of_param(p)), item:default_of_param(p)
        <li><code>$(name)</code>
#       if tp ~= '' then
            <span class="types">$(tp)</span>
#       end
        $(M(item.params.map[p],item))
#       if def == true then
         (<em>optional</em>)
#      elseif def then
         (<em>default</em> $(def))
#       end
#       if item:readonly(p) then
          <em>readonly</em>
#       end
        </li>
#     end
#     if sublist then
        </li></ul>
#     end
#   end -- for
    </ul>
#   end -- if params

#  if show_return and item.retgroups then local groups = item.retgroups
    <h4>Returns:</h4>
#   for i,group in ldoc.ipairs(groups) do local li,il = use_li(group)
    <ol>
#   for r in group:iter() do local type, ctypes = item:return_type(r); local rt = ldoc.typename(type)
        $(li)
#     if rt ~= '' then
           <span class="types">$(rt)</span>
#     end
        $(M(r.text,item))$(il)
#    if ctypes then
      <ul>
#    for c in ctypes:iter() do
            <li><span class="parameter">$(c.name)</span>
            <span class="types">$(ldoc.typename(c.type))</span>
            $(M(c.comment,item))</li>
#     end
        </ul>
#    end -- if ctypes
#     end -- for r
    </ol>
#   if i < #groups then
     <h4>Or</h4>
#   end
#   end -- for group
#   end -- if returns

#   if show_return and item.raise then
    <h4>Raises:</h4>
    $(M(item.raise,item))
#   end

#   if item.see then
#     local li,il = use_li(item.see)
    <h4>See also:</h4>
    <ul>
#     for see in iter(item.see) do
         $(li)<a href="$(ldoc.href(see))">$(see.label)</a>$(il)
#    end -- for
    </ul>
#   end -- if see

#   if item.usage then
#     local li,il = use_li(item.usage)
    <h4>Usage:</h4>
    <ul>
#     for usage in iter(item.usage) do
        $(li)<pre class="usage"><code class="lua">$(ldoc.prettify(usage))</code></pre>$(il)
#     end -- for
    </ul>
#   end -- if usage

</dd>
# end -- for items
</dl>
# end -- for kinds

# else -- if module; project-level contents

# if ldoc.description then
  <h2>$(M(ldoc.description,nil))</h2>
# end
# if ldoc.full_description then
  <p>$(M(ldoc.full_description,nil))</p>
# end

# for kind, mods in ldoc.kinds() do
<h2>$(kind)</h2>
# kind = kind:lower()
<table class="module_list">
# for m in mods() do
	<tr>
		<td class="name"  $(nowrap)><a href="$(no_spaces(kind))/$(m.name).html">$(m.name)</a></td>
		<td class="summary">$(M(ldoc.strip_header(m.summary),m))</td>
	</tr>
#  end -- for modules
</table>
# end -- for kinds
# end -- if module

</div> <!-- id="content" -->
</div> <!-- id="main" -->
</div> <!-- id="container" -->

{% endblock %}
]==]


from django import template
register = template.Library()


@register.inclusion_tag('highscore/model_table.html', takes_context=True)
def model_as_table(context, model_key=None, model_table_attrs_key=None):

    if model_key is None:
        model_key = 'object'

    if model_table_attrs_key is None:
        model_table_attrs_key = 'model_table_attrs'

    attrs = context[model_table_attrs_key]
    
    table_context = {'rows': []}
    for row in context[model_key]:
        for attr in attrs:
            value = str(getattr(row, attr))
            if value:
                table_context['rows'].append({'attr': attr,
                                              'value': value})
    return table_context

--- Define special sequences of characters.
-- For each pair (find, subs), the function will create a field named with
-- find which has the value of subs.
-- It also creates an index for the table, according to the order of insertion.
-- @param subs The replacement pattern.
-- @param find The pattern to find.
function def_escapes (find, subs)
   local special = { t = "\t", n = "\n", ['"'] = '"', ['\\'] = '\\', }
   find = gsub (find, "\\(.)", function (x) return %special[x] or x end)
   subs = gsub (subs, "\\(.)", function (x) return %special[x] or x end)
   escape_sequences.n = escape_sequences.n+1
   escape_sequences[escape_sequences.n] = find
   escape_sequences[find] = subs
end
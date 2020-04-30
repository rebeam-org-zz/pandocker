-- Based on https://github.com/Hakuyume/pandoc-filter-graphviz with additional step to generate high-dpi png images, and using pdf for latex rather than dot2tex
local negatable_keywords = {
  ["MUST"] = true, 
  ["SHALL"] = true, 
  ["SHOULD"] = true, 
}

local plain_keywords = {
  ["REQUIRED"] = true, 
  ["RECOMMENDED"] = true, 
  ["MAY"] = true, 
  ["OPTIONAL"] = true
}

local function trim(s)
  return s:match'^()%s*$' and '' or s:match'^%s*(.*%S)'
end

-- return {
--   {
--     -- Strong = function (elem)
--     --   local s = pandoc.utils.stringify(elem.c)
--     --   local t = trim(s):upper()
--     --   print("'" .. s .. "'")
--     --   print("'" .. t .. "'")
--     --   if (keywords[t])  then
--     --     return pandoc.Strong(pandoc.SmallCaps(elem.c))
--     --   else
--     --     return elem
--     --   end
--     -- end,
--     Str = function(str)
--       print(str.text)
--     end    
--   }
-- }

-- Check whether we have a negatable keyword as a Str, then a Space, then a Str "NOT"
local function is_negative(key, space, n)
  return key and key.t == "Str" and negatable_keywords[key.text]
    and space and space.t == 'Space'
    and n and n.t == 'Str'and n.text == "NOT"
end

local function is_positive_or_plain(key)
  return key and key.t == "Str" and (negatable_keywords[key.text] or plain_keywords[key.text])
end

local function rfc(text, type)
  if FORMAT == "html" then
    local span = pandoc.Span(pandoc.Str(text))
    span.attributes.class = 'rfc8174 rfc8174-' .. type
    return span
  else
    return pandoc.Strong(s)
  end
end

function Inlines (inlines)
  -- Run through elements of inlines
  for i = #inlines, 1, -1 do
    local key = inlines[i]
    local space = inlines[i+1]
    local n = inlines[i+2]

    -- Check for negatives first, so we don't convert just the positive part
    if is_negative(key, space, n) then
      local text = key.text .. " " .. n.text
      local type = key.text:lower() .. "-" .. n.text:lower()
      print(">>! " .. text)
      inlines:remove(i+2)
      inlines:remove(i+1)
      inlines[i] = rfc(text, type)

    -- If we don't have a negative, check for a positive  
    elseif is_positive_or_plain(key) then
      local text = key.text
      local type = key.text:lower()
      print(">>>" .. text)
      inlines[i] = rfc(text, type)
    end

  end
  return inlines
end

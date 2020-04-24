local function has_value (tab, val)
  for index, value in ipairs(tab) do
      if value == val then
          return true
      end
  end

  return false
end

local function file_exists(name)
  local f = io.open(name, 'r')
  if f ~= nil then
      io.close(f)
      return true
  else
      return false
  end
end

--TODO detect errors
local formats = {
  html = function(block, layout, id)
    local svg = pandoc.pipe("dot", {"-Tsvg", "-K" .. layout}, block.text)
    return pandoc.RawBlock("html", "<div id=\"" .. id .. "\" class=\"graphviz\">" .. svg .. "</div>")
  end,
  latex = function(block, layout, id)
    local tex = pandoc.pipe("dot2tex", {"--figonly", "--progoptions=-K" .. layout}, block.text)
    return pandoc.RawBlock("latex", tex)
  end,
  default = function(block, layout, id)
    local fname = pandoc.sha1(block.text) .. ".png"
    if not file_exists(fname) then
      pandoc.pipe("dot", {"-Tpng", "-K" .. layout, "-o" .. fname}, block.text)
    end
    return pandoc.Para({pandoc.Image({}, fname)})
  end
}

return {
  {
-- Use FORMAT to detect format?
    CodeBlock = function(block)
      if has_value(block.classes, "graphviz") then
        local layout = block.attributes["layout"] or "dot"
        local id = block.identifier

        local f = formats["default"] -- formats[FORMAT] or formats["default"]
        return f(block, layout, id)

        -- local svg = dot2svg(block.text, layout)
        
        -- -- local fname = pandoc.sha1(img) .. "." .. filetype
        -- -- pandoc.mediabag.insert(fname, mimetype, img)
        -- -- return pandoc.Para{ pandoc.Str(svg) }
        -- return pandoc.RawBlock("html", "<div id=\"" .. id .. "\" class=\"graphviz\">" .. svg .. "</div>")
      end
    end
  }
}